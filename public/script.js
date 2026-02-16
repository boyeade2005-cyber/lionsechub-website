/* ============================
   LionSec Hub — Performance + UI
   ============================ */

(() => {
  // Helpers
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Footer year
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Mobile nav
  const mobileToggle = $("#mobileToggle");
  const nav = $("#nav");
  if (mobileToggle && nav) {
    mobileToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", String(open));
      mobileToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        mobileToggle.setAttribute("aria-expanded", "false");
        mobileToggle.setAttribute("aria-label", "Open menu");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        nav.classList.remove("is-open");
        mobileToggle.setAttribute("aria-expanded", "false");
        mobileToggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  // Smooth tab jump
  const tabbar = $(".tabbar");
  if (tabbar) {
    tabbar.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab");
      if (!btn) return;

      const target = btn.getAttribute("data-target");
      const el = target ? $(target) : null;
      if (!el) return;

      $$(".tab").forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });

      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      const header = $(".site-header");
      const offset = header ? header.getBoundingClientRect().height + 8 : 72;
      const top = window.scrollY + el.getBoundingClientRect().top - offset;

      window.scrollTo({ top, behavior: "smooth" });
    });
  }

  // Reduce motion on low-end devices
  const isLowEnd =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    window.innerWidth < 420;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isLowEnd || reduceMotion) {
    document.documentElement.classList.add("reduce-motion");
  }

  // Loader (ROBUST) — NEVER STUCK
  const initLoader = () => {
    const loader = $("#loader");
    if (!loader) return;

    const hide = () => {
      if (loader.dataset.hidden === "1") return;
      loader.dataset.hidden = "1";
      loader.classList.add("is-done");
      setTimeout(() => loader.remove(), 480);
    };

    document.addEventListener("DOMContentLoaded", () => setTimeout(hide, 150), { once: true });
    window.addEventListener("load", () => setTimeout(hide, 250), { once: true });
    setTimeout(hide, 2500); // hard fallback
  };
  initLoader();

  // Canvas background (very light)
  const canvas = $("#neuro");
  if (canvas && !document.documentElement.classList.contains("reduce-motion")) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0, h = 0, raf = 0;

    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
      r: 1 + Math.random() * 1.5
    }));

    const resize = () => {
      w = canvas.width = Math.floor(window.innerWidth * 0.8);
      h = canvas.height = Math.floor(window.innerHeight * 0.8);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.55;

      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > 1) d.vx *= -1;
        if (d.y < 0 || d.y > 1) d.vy *= -1;

        const x = d.x * w, y = d.y * h;
        ctx.beginPath();
        ctx.arc(x, y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(draw);
  }

  // Video friction
  const introVideo = $("#introVideo");
  const videoShell = $("#videoShell");
  if (introVideo) {
    (videoShell || introVideo).addEventListener("contextmenu", (e) => e.preventDefault());
    introVideo.setAttribute("draggable", "false");
    introVideo.disablePictureInPicture = true;
  }

  // USD toggle (uses data-ngn on course cards)
  const usdRate = 1600;
  const usdToggle = $("#usdToggle");
  const priceCards = $$("[data-ngn]");

  const formatUSD = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const updateUSD = () => {
    const show = usdToggle && usdToggle.checked;
    priceCards.forEach((card) => {
      const ngn = Number(card.getAttribute("data-ngn") || 0);
      const usd = ngn > 0 ? Math.round(ngn / usdRate) : 0;
      const usdEl = card.querySelector("[data-usd]");
      if (!usdEl) return;
      usdEl.textContent = show ? `(${formatUSD(usd)})` : "";
    });
  };

  if (usdToggle) {
    usdToggle.addEventListener("change", updateUSD);
    updateUSD();
  }

  // Countdown
  const cohortStartDate = "2026-03-15";
  const countdownEl = $("#countdown");

  const updateCountdown = () => {
    if (!countdownEl) return;
    const end = new Date(cohortStartDate + "T00:00:00");
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (Number.isNaN(end.getTime())) {
      countdownEl.textContent = "Set cohort date";
      return;
    }
    if (diff <= 0) {
      countdownEl.textContent = "Cohort started";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    countdownEl.textContent = `${days}d ${hrs}h ${mins}m`;
  };
  updateCountdown();
  setInterval(updateCountdown, 30000);

  // Academy filter tabs (optional)
  const aTabs = $$(".a-tab");
  const courses = $$(".course");

  const setCat = (cat) => {
    courses.forEach((c) => {
      const ok = cat === "all" || c.getAttribute("data-cat") === cat;
      c.classList.toggle("is-hidden", !ok);
    });
  };

  if (aTabs.length) {
    aTabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        aTabs.forEach((t) => t.classList.remove("is-active"));
        btn.classList.add("is-active");
        setCat(btn.getAttribute("data-filter") || "all");
      });
    });
  }

  // Group pricing button -> prefill engagement select
  const groupBtn = $("#groupPricingBtn");
  const engagementSelect = $("#engagementSelect");
  if (groupBtn && engagementSelect) {
    groupBtn.addEventListener("click", () => {
      setTimeout(() => {
        engagementSelect.value = "Group Training (Team)";
      }, 250);
    });
  }

  // Forms (basic)
  const sanitizeValue = (value) => {
    const v = String(value ?? "");
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === "function") {
      return window.DOMPurify.sanitize(v, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    }
    return v.replace(/[<>]/g, "").trim();
  };

  const sanitizeForm = (form) => {
    const fields = form.querySelectorAll("input[type='text'], input[type='email'], input[type='tel'], textarea");
    fields.forEach((f) => (f.value = sanitizeValue(f.value)));
  };

  const validateBasic = (form) => {
    const email = form.querySelector("input[type='email']");
    if (email && !String(email.value).includes("@")) return false;

    const required = form.querySelectorAll("[required]");
    for (const r of required) {
      if (!String(r.value || "").trim()) return false;
    }
    return true;
  };

  const wireForm = (formId, msgId, successText) => {
    const form = $(formId);
    const msg = $(msgId);
    if (!form || !msg) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "Sending…";

      sanitizeForm(form);

      if (!validateBasic(form)) {
        msg.textContent = "Please check your inputs and try again.";
        return;
      }

      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });

        if (res.ok) {
          form.reset();
          msg.textContent = successText;
          return;
        }
        msg.textContent = "Could not send. Please try again or use WhatsApp.";
      } catch {
        msg.textContent = "Network error. Please try again or use WhatsApp.";
      }
    });
  };

  wireForm("quoteForm", "quoteMessage", "Request received. We’ll reply shortly.");
  wireForm("applyForm", "applyMessage", "Application received. We’ll respond shortly.");
})();      const v = level.value;

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
