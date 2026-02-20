/* ============================
   LionSec Hub — script.js (CLEAN)
   ============================ */

(() => {
  "use strict";

  // Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Reduce motion on low-end devices
  const isLowEnd =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    window.innerWidth < 420;

  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isLowEnd || prefersReduce) document.documentElement.classList.add("reduce-motion");

  /* ============================
     Loader — NEVER STUCK
     ============================ */
  const initLoader = () => {
    const loader = $("#loader");
    if (!loader) return;

    const hide = () => {
      if (loader.dataset.hidden === "1") return;
      loader.dataset.hidden = "1";
      loader.classList.add("is-done");
      setTimeout(() => loader.remove(), 480);
    };

    // Hide ASAP when DOM is ready
    if (document.readyState !== "loading") setTimeout(hide, 150);
    else document.addEventListener("DOMContentLoaded", () => setTimeout(hide, 150), { once: true });

    // Hide again on full load (safe)
    window.addEventListener("load", () => setTimeout(hide, 250), { once: true });

    // Hard fallback — never leave user stuck
    setTimeout(hide, 2500);
  };

  /* ============================
     Mobile nav
     ============================ */
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

    // Close nav when any link is clicked
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setState(false);
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setState(false);
    });
  };

  /* ============================
     Smooth scroll
     ============================ */
  const smoothScrollTo = (targetSel) => {
    const el = typeof targetSel === "string" ? $(targetSel) : targetSel;
    if (!el) return;

    const header = $(".site-header");
    const offset = header ? header.getBoundingClientRect().height + 10 : 72;
    const top = window.scrollY + el.getBoundingClientRect().top - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  /* ============================
     Tabbar + nav anchor clicks
     ============================ */
  const initTabbar = () => {
    const tabbar = $(".tabbar");
    if (!tabbar) return;

    tabbar.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab");
      if (!btn) return;

      const target = btn.getAttribute("data-target");
      if (!target) return;

      const section = $(target);
      if (!section) return;

      $$(".tab").forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      smoothScrollTo(section);
    });

    // Smooth scroll for nav anchor links
    $$("#nav a[href^='#']").forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        const section = href ? $(href) : null;
        if (!section) return;
        e.preventDefault();
        smoothScrollTo(section);
      });
    });
  };

  /* ============================
     Active tab on scroll (IntersectionObserver)
     ============================ */
  const initActiveTabOnScroll = () => {
    const sections = $$("section[id]");
    const tabs = $$(".tab[data-target]");
    if (!sections.length || !tabs.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (!ent.isIntersecting) return;
          const id = "#" + ent.target.id;
          tabs.forEach((t) => {
            const active = t.getAttribute("data-target") === id;
            t.classList.toggle("is-active", active);
            t.setAttribute("aria-selected", active ? "true" : "false");
          });
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
    );

    sections.forEach((s) => io.observe(s));
  };

  /* ============================
     Reveal animations
     ============================ */
  const initReveal = () => {
    const reduce = document.documentElement.classList.contains("reduce-motion");
    const nodes = $$(".reveal, .reveal-up");
    if (!nodes.length) return;

    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (ent.isIntersecting) {
            ent.target.classList.add("is-visible");
            io.unobserve(ent.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    nodes.forEach((n) => io.observe(n));
  };

  /* ============================
     Ambient Canvas (lightweight)
     ============================ */
  const initAmbientCanvas = () => {
    const canvas = $("#neuro");
    if (!canvas) return;

    const reduce = document.documentElement.classList.contains("reduce-motion");
    if (reduce) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;

    const dots = Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
      r: 1 + Math.random() * 1.5,
    }));

    const resize = () => {
      w = canvas.width = Math.floor(window.innerWidth * 0.8);
      h = canvas.height = Math.floor(window.innerHeight * 0.8);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.55;

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > 1) d.vx *= -1;
        if (d.y < 0 || d.y > 1) d.vy *= -1;

        const x = d.x * w;
        const y = d.y * h;
        ctx.beginPath();
        ctx.arc(x, y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    });

    raf = requestAnimationFrame(draw);
  };

  /* ============================
     Video anti-download friction
     (note: true prevention requires DRM + authenticated streaming)
     ============================ */
  const initVideoFriction = () => {
    const introVideo = $("#introVideo");
    const videoShell = $("#videoShell");
    if (!introVideo) return;

    (videoShell || introVideo).addEventListener("contextmenu", (e) => e.preventDefault());
    introVideo.setAttribute("draggable", "false");
    introVideo.disablePictureInPicture = true;
  };

  /* ============================
     USD price toggle (uses data-ngn on course cards)
     ============================ */
  const initUsdToggle = () => {
    const usdToggle = $("#usdToggle");
    if (!usdToggle) return;

    const usdRate = 1600; // Update this rate as needed
    const cards = $$("[data-ngn]");

    const formatUSD = (n) =>
      "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

    const update = () => {
      const show = usdToggle.checked;
      cards.forEach((card) => {
        const ngn = Number(card.getAttribute("data-ngn") || 0);
        const usd = ngn > 0 ? Math.round(ngn / usdRate) : 0;
        const usdEl = card.querySelector("[data-usd]");
        if (!usdEl) return;
        usdEl.textContent = show ? `(${formatUSD(usd)})` : "";
      });
    };

    usdToggle.addEventListener("change", update);
    update();
  };

  /* ============================
     Cohort countdown
     ============================ */
  const initCountdown = () => {
    // ⚠️ Update this date to your actual next cohort start date
    const cohortStartDate = "2026-03-15";
    const out = $("#countdown");
    if (!out) return;

    const tick = () => {
      const end = new Date(cohortStartDate + "T00:00:00");
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (Number.isNaN(end.getTime())) {
        out.textContent = "Set cohort date";
        return;
      }
      if (diff <= 0) {
        out.textContent = "Cohort started";
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      out.textContent = `${days}d ${hrs}h ${mins}m`;
    };

    tick();
    setInterval(tick, 30000);
  };

  /* ============================
     Academy filter tabs (optional — only runs if .a-tab elements exist)
     ============================ */
  const initAcademyFilters = () => {
    const tabs = $$(".a-tab");
    const courses = $$(".course");
    if (!tabs.length || !courses.length) return;

    const setCat = (cat) => {
      courses.forEach((c) => {
        const ok = cat === "all" || c.getAttribute("data-cat") === cat;
        c.classList.toggle("is-hidden", !ok);
      });
    };

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("is-active"));
        btn.classList.add("is-active");
        setCat(btn.getAttribute("data-filter") || "all");
      });
    });
  };

  /* ============================
     Group pricing button prefills the quote select
     ============================ */
  const initGroupPricingPrefill = () => {
    const groupBtn = $("#groupPricingBtn");
    const select = $("#engagementSelect");
    if (!groupBtn || !select) return;

    groupBtn.addEventListener("click", () => {
      setTimeout(() => {
        select.value = "Group Training (Team)";
      }, 250);
    });
  };

  /* ============================
     Forms (Formspree) — sanitize + validate + submit
     ============================ */
  const sanitizeValue = (value) =>
    String(value ?? "").replace(/[<>]/g, "").trim();

  const sanitizeForm = (form) => {
    form
      .querySelectorAll("input[type='text'], input[type='email'], input[type='tel'], textarea")
      .forEach((f) => (f.value = sanitizeValue(f.value)));
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
    const form = $("#" + formId);
    const msg = $("#" + msgId);
    if (!form || !msg) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "Sending…";

      sanitizeForm(form);

      // Guard: catch placeholder endpoints before attempting to submit
      const endpoint = form.action || "";
      if (endpoint.includes("yourFormId") || endpoint.includes("yourApplyFormId")) {
        msg.textContent =
          "⚠️ Replace the Formspree link in your HTML (action='https://formspree.io/f/REAL_ID').";
        return;
      }

      if (!validateBasic(form)) {
        msg.textContent = "Please check your inputs and try again.";
        return;
      }

      try {
        const res = await fetch(endpoint, {
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

  /* ============================
     INIT — run everything
     ============================ */
  const init = () => {
    initLoader();
    initMobileNav();
    initTabbar();
    initActiveTabOnScroll();
    initReveal();
    initAmbientCanvas();
    initVideoFriction();
    initUsdToggle();
    initCountdown();
    initAcademyFilters();
    initGroupPricingPrefill();

    wireForm("quoteForm", "quoteMessage", "Request received. We'll reply shortly.");
    wireForm("applyForm", "applyMessage", "Application received. We'll respond shortly.");
  };

  document.addEventListener("DOMContentLoaded", init);
})();
