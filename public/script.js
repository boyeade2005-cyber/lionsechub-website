/* =========================================================
   LionSec Hub — script.js (FIXED)
   - Loader hide (robust)
   - Mobile menu toggle
   - Tabbar scroll + active state
   - Reveal on scroll
   - USD toggle estimates
   - Early-bird countdown
   - Track helper recommendations
   - Apply level → recommendation + auto-suggest track
   - Formspree submit (fetch) with inline messages
   - Ambient canvas (light)
   ========================================================= */

(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const formatUSD = (n) => {
    const num = Number(n || 0);
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(num);
    } catch {
      return `$${Math.round(num).toLocaleString("en-US")}`;
    }
  };

  const safeText = (s) => String(s ?? "");

  const setMessage = (el, msg, type = "info") => {
    if (!el) return;
    el.textContent = safeText(msg);
    el.dataset.type = type;
  };

  const smoothScrollTo = (targetSel) => {
    const target = typeof targetSel === "string" ? $(targetSel) : targetSel;
    if (!target) return;

    const header = $(".site-header");
    const offset = header ? header.getBoundingClientRect().height + 8 : 72;

    const top = window.scrollY + target.getBoundingClientRect().top - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // ---------- Loader (ROBUST FIX) ----------
  const initLoader = () => {
    const loader = $("#loader");
    if (!loader) return;

    const hide = () => {
      // If already hidden, do nothing
      if (loader.dataset.hidden === "1") return;
      loader.dataset.hidden = "1";

      loader.style.opacity = "0";
      loader.style.pointerEvents = "none";
      setTimeout(() => {
        loader.style.display = "none";
      }, 250);
    };

    // Hide as soon as DOM is ready (fast)
    document.addEventListener("DOMContentLoaded", () => setTimeout(hide, 150), { once: true });

    // Hide again when everything fully loads (safe)
    window.addEventListener("load", () => setTimeout(hide, 200), { once: true });

    // Hard fallback: never allow it to stay forever
    setTimeout(hide, 2500);
  };

  // ---------- Mobile nav ----------
  const initMobileNav = () => {
    const toggle = $("#mobileToggle");
    const nav = $("#nav");
    if (!toggle || !nav) return;

    const setState = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", () => setState(!nav.classList.contains("is-open")));

    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) setState(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setState(false);
    });
  };

  // ---------- Tabbar scroll + active ----------
  const initTabbar = () => {
    const tabButtons = $$(".tabbar .tab");
    if (!tabButtons.length) return;

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");
        if (target) smoothScrollTo(target);
      });
    });

    const sections = ["#home", "#intelligence", "#academy", "#careers", "#ventures", "#trust", "#quote", "#apply"]
      .map((id) => $(id))
      .filter(Boolean);

    if (!sections.length) return;

    const setActive = (targetId) => {
      tabButtons.forEach((b) => {
        const isActive = b.getAttribute("data-target") === targetId;
        b.classList.toggle("is-active", isActive);
        b.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        setActive(`#${visible.target.id}`);
      },
      { threshold: [0.25, 0.35, 0.5, 0.65] }
    );

    sections.forEach((sec) => io.observe(sec));
  };

  // ---------- Reveal on scroll ----------
  const initReveal = () => {
    const nodes = $$(".reveal, .reveal-up");
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    nodes.forEach((n) => io.observe(n));
  };

  // ---------- Footer year ----------
  const initYear = () => {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  };

  // ---------- USD toggle ----------
  const initUsdToggle = () => {
    const toggle = $("#usdToggle");
    if (!toggle) return;

    const NGN_PER_USD = 1600;

    const update = () => {
      const show = toggle.checked;
      const usdSpans = $$("[data-usd]");

      usdSpans.forEach((el) => {
        const explicit = el.getAttribute("data-usd");
        let ngn = Number(explicit);

        if (!show) {
          el.textContent = "";
          el.style.display = "none";
          return;
        }

        if (!Number.isFinite(ngn) || ngn <= 0) {
          el.textContent = "";
          el.style.display = "none";
          return;
        }

        const usd = Math.round(ngn / NGN_PER_USD);
        el.textContent = `≈ ${formatUSD(usd)}`;
        el.style.display = "inline";
      });
    };

    toggle.addEventListener("change", update);
    update();
  };

  // ---------- Early-bird countdown ----------
  const initCountdown = () => {
    const out = $("#countdown");
    if (!out) return;

    const DEFAULT_DAYS = 10;

    const stored = localStorage.getItem("lionsec_earlybird_deadline");
    let deadline = stored ? new Date(stored) : null;

    if (!(deadline instanceof Date) || isNaN(deadline.getTime())) {
      deadline = new Date();
      deadline.setDate(deadline.getDate() + DEFAULT_DAYS);
      deadline.setHours(23, 59, 59, 999);
      localStorage.setItem("lionsec_earlybird_deadline", deadline.toISOString());
    }

    const tick = () => {
      const now = new Date();
      const ms = deadline - now;

      if (ms <= 0) {
        out.textContent = "Closed";
        return;
      }

      const sec = Math.floor(ms / 1000);
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);

      out.textContent = `${d}d ${h}h ${m}m`;
    };

    tick();
    setInterval(tick, 30 * 1000);
  };

  // ---------- Track helper ----------
  const initTrackHelper = () => {
    const output = $("#helperOutput");
    const buttons = $$(".helper-btn");
    if (!output || !buttons.length) return;

    const reco = {
      zero: { title: "Complete Beginner Path", text: "Start with IT Fundamentals → Python/Web Basics → Networking." },
      some: { title: "You know a little", text: "Go Python + Networking, then specialize." },
      cyber: { title: "Cybersecurity track", text: "Networking + IT Fundamentals first, then Ethical Hacking." },
      job: { title: "Fastest to employable", text: "0 → Job Ready Bootcamp is the fastest structured route." },
    };

    const render = (k) => {
      const item = reco[k];
      if (!item) return;

      const html = `<strong>Recommendation:</strong> <span class="gold">${item.title}</span><br><span class="muted">${item.text}</span>`;

      if (window.DOMPurify) {
        output.innerHTML = DOMPurify.sanitize(html, { ALLOWED_TAGS: ["strong", "span", "br"] });
      } else {
        output.textContent = `Recommendation: ${item.title} — ${item.text}`;
      }
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => render(btn.getAttribute("data-reco")));
    });
  };

  // ---------- Apply reco ----------
  const initApplyReco = () => {
    const level = $("#levelSelect");
    const track = $("#trackSelect");
    const box = $("#applyReco");
    if (!level || !track || !box) return;

    const setTrackByStartsWith = (needle) => {
      const options = Array.from(track.options);
      const found = options.find((o) => safeText(o.textContent).toLowerCase().startsWith(needle.toLowerCase()));
      if (found) track.value = found.value;
    };

    const render = (msg) => {
      if (window.DOMPurify) {
        box.innerHTML = DOMPurify.sanitize(msg, { ALLOWED_TAGS: ["strong", "span", "br"] });
      } else {
        box.textContent = msg.replace(/<br>/g, " ").replace(/<\/?strong>/g, "").replace(/<\/?span.*?>/g, "");
      }
    };

    const onChange = () => {
      const v = level.value;

      if (v === "beginner") {
        render(`<strong>Recommendation:</strong> <span class="gold">Start Level 1</span><br><span class="muted">IT Fundamentals → Python/Web Basics.</span>`);
        setTrackByStartsWith("Computer & IT Fundamentals");
      } else if (v === "some") {
        render(`<strong>Recommendation:</strong> <span class="gold">Build fast</span><br><span class="muted">Python + Networking → then specialize.</span>`);
        setTrackByStartsWith("Python for Absolute Beginners");
      } else if (v === "intermediate") {
        render(`<strong>Recommendation:</strong> <span class="gold">Go to specialization</span><br><span class="muted">Pick RegTech / Ethical Hacking / Fintech Engineering.</span>`);
      } else {
        render(`<strong>Recommendation:</strong> <span class="muted">Select your level to get a suggested starting track.</span>`);
      }
    };

    level.addEventListener("change", onChange);
    onChange();
  };

  // ---------- Forms ----------
  const initForms = () => {
    const handle = (formId, messageId) => {
      const form = $(formId);
      const msg = $(messageId);
      if (!form || !msg) return;

      const endpoint = form.getAttribute("action") || "";
      const looksPlaceholder = endpoint.includes("yourFormId") || endpoint.includes("yourApplyFormId");

      const setBusy = (busy) => {
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        btn.disabled = !!busy;
        if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
        btn.textContent = busy ? "Submitting…" : btn.dataset.originalText;
      };

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (looksPlaceholder) {
          setMessage(msg, "Replace the Formspree link in your HTML (action='https://formspree.io/f/...').", "warn");
          return;
        }

        if (!form.checkValidity()) {
          form.reportValidity();
          setMessage(msg, "Please complete the required fields.", "warn");
          return;
        }

        setBusy(true);
        setMessage(msg, "Sending…", "info");

        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(form),
          });

          if (res.ok) {
            form.reset();
            setMessage(msg, "Submitted ✅ We’ll get back to you shortly.", "ok");
          } else {
            let data = null;
            try { data = await res.json(); } catch {}
            const error = data?.errors?.[0]?.message || "Something went wrong. Please try again.";
            setMessage(msg, error, "bad");
          }
        } catch {
          setMessage(msg, "Network error. Please check your connection and try again.", "bad");
        } finally {
          setBusy(false);
        }
      });
    };

    handle("#quoteForm", "#quoteMessage");
    handle("#applyForm", "#applyMessage");
  };

  // ---------- Ambient Canvas ----------
  const initAmbientCanvas = () => {
    const canvas = $("#neuro");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    const points = [];
    const MAX_POINTS = 32; // slightly reduced

    const resize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      points.length = 0;
      for (let i = 0; i < MAX_POINTS; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 1 + Math.random() * 2.2,
        });
      }
    };

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const step = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of points) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245,197,66,0.32)";
        ctx.fill();
      }

      requestAnimationFrame(step);
    };

    resize();
    window.addEventListener("resize", () => setTimeout(resize, 150));
    requestAnimationFrame(step);
  };

  // ---------- Init ----------
  const init = () => {
    initLoader();
    initMobileNav();
    initTabbar();
    initReveal();
    initYear();
    initUsdToggle();
    initCountdown();
    initTrackHelper();
    initApplyReco();
    initForms();
    initAmbientCanvas();
  };

  document.addEventListener("DOMContentLoaded", init);
})();  const formatUSD = (n) => {
    const num = Number(n || 0);
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(num);
    } catch {
      return `$${Math.round(num).toLocaleString("en-US")}`;
    }
  };

  const safeText = (s) => String(s ?? "");

  const setMessage = (el, msg, type = "info") => {
    if (!el) return;
    el.textContent = safeText(msg);

    // Optional "type" styling hooks (won't break if CSS doesn't define them)
    el.dataset.type = type;
  };

  const smoothScrollTo = (targetSel) => {
    const target = typeof targetSel === "string" ? $(targetSel) : targetSel;
    if (!target) return;

    // Offset for sticky header
    const header = $(".site-header");
    const offset = header ? header.getBoundingClientRect().height + 8 : 72;

    const top = window.scrollY + target.getBoundingClientRect().top - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // ---------- Loader ----------
  const initLoader = () => {
    const loader = $("#loader");
    if (!loader) return;

    const hide = () => {
      loader.style.opacity = "0";
      loader.style.pointerEvents = "none";
      setTimeout(() => {
        loader.style.display = "none";
      }, 300);
    };

    // Hide after page is ready (small delay for smoothness)
    window.addEventListener("load", () => setTimeout(hide, 450), { once: true });
  };

  // ---------- Mobile nav ----------
  const initMobileNav = () => {
    const toggle = $("#mobileToggle");
    const nav = $("#nav");
    if (!toggle || !nav) return;

    const setState = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      setState(open);
    });

    // Close when clicking a link
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      setState(false);
    });

    // Close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setState(false);
    });
  };

  // ---------- Tabbar scroll + active ----------
  const initTabbar = () => {
    const tabButtons = $$(".tabbar .tab");
    if (!tabButtons.length) return;

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");
        if (!target) return;
        smoothScrollTo(target);
      });
    });

    // Active state via IntersectionObserver
    const sections = ["#home", "#intelligence", "#academy", "#careers", "#ventures", "#trust", "#quote", "#apply"]
      .map((id) => $(id))
      .filter(Boolean);

    if (!sections.length) return;

    const byId = new Map(
      tabButtons
        .map((b) => [b.getAttribute("data-target"), b])
        .filter(([k, v]) => k && v)
    );

    const setActive = (targetId) => {
      tabButtons.forEach((b) => {
        const isActive = b.getAttribute("data-target") === targetId;
        b.classList.toggle("is-active", isActive);
        b.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        // Choose the most visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const id = `#${visible.target.id}`;
        if (byId.has(id)) setActive(id);
      },
      {
        root: null,
        threshold: [0.25, 0.35, 0.5, 0.65],
      }
    );

    sections.forEach((sec) => io.observe(sec));
  };

  // ---------- Reveal on scroll ----------
  const initReveal = () => {
    const nodes = $$(".reveal, .reveal-up");
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    nodes.forEach((n) => io.observe(n));
  };

  // ---------- Footer year ----------
  const initYear = () => {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  };

  // ---------- USD toggle ----------
  const initUsdToggle = () => {
    const toggle = $("#usdToggle");
    if (!toggle) return;

    // Heuristic USD rate (benchmark only). Change anytime.
    const NGN_PER_USD = 1600;

    const update = () => {
      const show = toggle.checked;

      // Elements that already have empty span: <span data-usd></span>
      // OR have numeric: <span data-usd="45000"></span>
      const usdSpans = $$("[data-usd]");

      usdSpans.forEach((el) => {
        const explicit = el.getAttribute("data-usd");
        // if explicit contains a number, use it as NGN value; otherwise try to read from parent card
        let ngn = Number(explicit);

        if (!Number.isFinite(ngn) || ngn <= 0) {
          // Try parent container with data-ngn
          const parent = el.closest("[data-ngn]");
          if (parent) {
            const p = Number(parent.getAttribute("data-ngn"));
            if (Number.isFinite(p)) ngn = p;
          }
        }

        if (!show) {
          el.textContent = "";
          el.style.display = "none";
          return;
        }

        if (!Number.isFinite(ngn) || ngn <= 0) {
          // If we still can't read it, just show nothing instead of guessing wrongly
          el.textContent = "";
          el.style.display = "none";
          return;
        }

        const usd = Math.round(ngn / NGN_PER_USD);
        el.textContent = `≈ ${formatUSD(usd)}`;
        el.style.display = "inline";
      });
    };

    toggle.addEventListener("change", update);
    update();
  };

  // ---------- Early-bird countdown ----------
  const initCountdown = () => {
    const out = $("#countdown");
    if (!out) return;

    // Set your cohort deadline here (local time).
    // Example: ends 10 days from now if you forget to change.
    const DEFAULT_DAYS = 10;

    const stored = localStorage.getItem("lionsec_earlybird_deadline");
    let deadline = stored ? new Date(stored) : null;

    if (!(deadline instanceof Date) || isNaN(deadline.getTime())) {
      deadline = new Date();
      deadline.setDate(deadline.getDate() + DEFAULT_DAYS);
      deadline.setHours(23, 59, 59, 999);
      localStorage.setItem("lionsec_earlybird_deadline", deadline.toISOString());
    }

    const tick = () => {
      const now = new Date();
      let ms = deadline - now;

      if (ms <= 0) {
        out.textContent = "Closed";
        return;
      }

      const sec = Math.floor(ms / 1000);
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);

      out.textContent = `${d}d ${h}h ${m}m`;
    };

    tick();
    setInterval(tick, 30 * 1000); // update every 30s
  };

  // ---------- Track helper (Academy) ----------
  const initTrackHelper = () => {
    const output = $("#helperOutput");
    const buttons = $$(".helper-btn");
    if (!output || !buttons.length) return;

    const reco = {
      zero: {
        title: "Complete Beginner Path",
        text:
          "Start with **Computer & IT Fundamentals**, then **Python for Absolute Beginners** or **Web Development Basics**. If you want one full path, choose the **0 → Job Ready Bootcamp**.",
      },
      some: {
        title: "You know a little",
        text:
          "Go straight to **Python for Absolute Beginners** (if coding is weak) + **Networking Fundamentals** (if you want cybersecurity). Then pick a specialization.",
      },
      cyber: {
        title: "Cybersecurity track",
        text:
          "Start with **Networking Fundamentals** + **IT Fundamentals**, then move into **AI Ethical Hacking** when your base is solid.",
      },
      job: {
        title: "Fastest to employable",
        text:
          "Best route is the **0 → Job Ready Bootcamp** (structure + mentorship + portfolio + career prep). Add **Tech Job & Portfolio Prep** if needed.",
      },
    };

    const render = (k) => {
      const item = reco[k];
      if (!item) return;

      // Use DOMPurify if present, otherwise fall back to plain text
      const html = `<strong>Recommendation:</strong> <span class="gold">${item.title}</span><br><span class="muted">${item.text}</span>`;
      if (window.DOMPurify) {
        output.innerHTML = DOMPurify.sanitize(html, { ALLOWED_TAGS: ["strong", "span", "br"] });
      } else {
        output.textContent = `Recommendation: ${item.title} — ${item.text.replace(/\*\*/g, "")}`;
      }
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const k = btn.getAttribute("data-reco");
        render(k);
      });
    });
  };

  // ---------- Apply section: level → reco + auto-track suggestion ----------
  const initApplyReco = () => {
    const level = $("#levelSelect");
    const track = $("#trackSelect");
    const box = $("#applyReco");
    if (!level || !track || !box) return;

    const trackStartsWith = (needle) => {
      const options = Array.from(track.options);
      const found = options.find((o) => safeText(o.textContent).toLowerCase().startsWith(needle.toLowerCase()));
      return found ? found.value : null;
    };

    const setTrackByStartsWith = (needle) => {
      const value = trackStartsWith(needle);
      if (value) track.value = value;
    };

    const render = (msg) => {
      if (window.DOMPurify) {
        box.innerHTML = DOMPurify.sanitize(msg, { ALLOWED_TAGS: ["strong", "span", "br"] });
      } else {
        box.textContent = msg.replace(/<br>/g, " ").replace(/<\/?strong>/g, "").replace(/<\/?span.*?>/g, "");
      }
    };

    const onChange = () => {
      const v = level.value;

      if (v === "beginner") {
        render(
          `<strong>Recommendation:</strong> <span class="gold">Start Level 1</span><br>` +
            `<span class="muted">Best start: Computer & IT Fundamentals → Python/Web Basics. If you want one complete path, choose the Bootcamp.</span>`
        );
        // Suggest IT Fundamentals by default
        setTrackByStartsWith("Computer & IT Fundamentals");
      } else if (v === "some") {
        render(
          `<strong>Recommendation:</strong> <span class="gold">Build a strong base fast</span><br>` +
            `<span class="muted">Suggested: Python for Absolute Beginners + Networking Fundamentals, then a specialization.</span>`
        );
        setTrackByStartsWith("Python for Absolute Beginners");
      } else if (v === "intermediate") {
        render(
          `<strong>Recommendation:</strong> <span class="gold">Go to specialization</span><br>` +
            `<span class="muted">You can choose RegTech / Ethical Hacking / Fintech Engineering based on your goal.</span>`
        );
        // Don’t force-change track here
      } else {
        render(`<strong>Recommendation:</strong> <span class="muted">Select your current level to get a suggested starting track.</span>`);
      }
    };

    level.addEventListener("change", onChange);
    onChange();
  };

  // ---------- Forms (Formspree fetch submit) ----------
  const initForms = () => {
    const handle = (formId, messageId) => {
      const form = $(formId);
      const msg = $(messageId);
      if (!form || !msg) return;

      const endpoint = form.getAttribute("action") || "";

      // Simple endpoint guard: if user forgot to replace, show friendly warning
      const looksPlaceholder = endpoint.includes("yourFormId") || endpoint.includes("yourApplyFormId");

      const setBusy = (busy) => {
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        btn.disabled = !!busy;
        btn.dataset.busy = busy ? "1" : "0";
        btn.textContent = busy ? "Submitting…" : btn.dataset.originalText || btn.textContent;
      };

      const initBtn = () => {
        const btn = form.querySelector('button[type="submit"]');
        if (btn && !btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
      };

      initBtn();

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (looksPlaceholder) {
          setMessage(
            msg,
            "Heads up: replace the Formspree link in your HTML (action='https://formspree.io/f/...'). Then try again.",
            "warn"
          );
          return;
        }

        // Basic browser validation
        if (!form.checkValidity()) {
          form.reportValidity();
          setMessage(msg, "Please complete the required fields.", "warn");
          return;
        }

        setBusy(true);
        setMessage(msg, "Sending…", "info");

        try {
          const formData = new FormData(form);

          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
            body: formData,
          });

          if (res.ok) {
            form.reset();
            setMessage(msg, "Submitted ✅ We’ll get back to you shortly.", "ok");
          } else {
            let data = null;
            try {
              data = await res.json();
            } catch {}
            const error = data?.errors?.[0]?.message || "Something went wrong. Please try again.";
            setMessage(msg, error, "bad");
          }
        } catch (err) {
          setMessage(msg, "Network error. Please check your connection and try again.", "bad");
        } finally {
          setBusy(false);
        }
      });
    };

    handle("#quoteForm", "#quoteMessage");
    handle("#applyForm", "#applyMessage");
  };

  // ---------- Optional: Calm background canvas (lightweight) ----------
  const initAmbientCanvas = () => {
    const canvas = $("#neuro");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0,
      h = 0,
      dpr = 1;

    const points = [];
    const MAX_POINTS = 40;

    const resize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      points.length = 0;
      for (let i = 0; i < MAX_POINTS; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: 1 + Math.random() * 2.5,
        });
      }
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);

      // subtle background
      ctx.globalAlpha = 0.6;

      // points
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245,197,66,0.35)";
        ctx.fill();
      }

      // links
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const max = 140;

          if (dist < max) {
            const alpha = (1 - dist / max) * 0.12;
            ctx.strokeStyle = `rgba(245,197,66,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;

      requestAnimationFrame(step);
    };

    resize();
    window.addEventListener("resize", () => {
      // debounce-ish
      clearTimeout(initAmbientCanvas._t);
      initAmbientCanvas._t = setTimeout(resize, 150);
    });

    // reduce motion respect
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) requestAnimationFrame(step);
    else ctx.clearRect(0, 0, w, h);
  };

  // ---------- Init ----------
  const init = () => {
    initLoader();
    initMobileNav();
    initTabbar();
    initReveal();
    initYear();
    initUsdToggle();
    initCountdown();
    initTrackHelper();
    initApplyReco();
    initForms();
    initAmbientCanvas();
  };

  document.addEventListener("DOMContentLoaded", init);
})();
```0
