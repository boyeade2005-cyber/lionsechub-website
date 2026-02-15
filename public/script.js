/* ============================
   LionSec Hub — Performance + UI
   ============================ */

(() => {
  // Year
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Smooth tab jump (relaxed)
  const tabbar = document.querySelector(".tabbar");
  if (tabbar) {
    tabbar.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab");
      if (!btn) return;
      const target = btn.getAttribute("data-target");
      const el = target ? document.querySelector(target) : null;
      if (!el) return;

      document.querySelectorAll(".tab").forEach(t => t.classList.remove("is-active"));
      btn.classList.add("is-active");

      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Mobile nav
  const mobileToggle = document.getElementById("mobileToggle");
  const nav = document.getElementById("nav");
  if (mobileToggle && nav) {
    mobileToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Loader: remove quickly after load
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("is-done");
    setTimeout(() => loader.remove(), 480);
  });

  // Performance: reduce motion on low-end devices
  const isLowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || window.innerWidth < 420;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isLowEnd || reduceMotion) {
    document.documentElement.classList.add("reduce-motion");
  }

  // Canvas background: very light
  const canvas = document.getElementById("neuro");
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

      // faint dots only (no heavy lines)
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

    // Stop animation when tab not visible
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(draw);
  }

  // Video anti-download friction (NOT absolute security)
  const introVideo = document.getElementById("introVideo");
  const videoShell = document.getElementById("videoShell");
  if (introVideo) {
    // block context menu
    (videoShell || introVideo).addEventListener("contextmenu", (e) => e.preventDefault());

    // avoid accidental drag
    introVideo.setAttribute("draggable", "false");

    // additional hint: disable picture-in-picture
    introVideo.disablePictureInPicture = true;
  }

  /* ============================
     Academy Pricing: NGN + USD toggle + early-bird countdown
     ============================ */

  // Set your cohort start date here (YYYY-MM-DD)
  const cohortStartDate = "2026-03-15";
  const earlyBirdDiscountNgn = 50000;

  // USD estimate rate (you can update anytime)
  // Keep it simple and realistic — investors just want a benchmark.
  const usdRate = 1600; // NGN per USD (EDIT THIS)

  const usdToggle = document.getElementById("usdToggle");
  const priceCards = document.querySelectorAll("[data-ngn]");
  const countdownEl = document.getElementById("countdown");

  const formatNGN = (n) => "₦" + Math.round(n).toLocaleString("en-NG");
  const formatUSD = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const updateUSD = () => {
    const show = usdToggle && usdToggle.checked;
    priceCards.forEach(card => {
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

  // Countdown to cohort (for early bird)
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

  // Group pricing button -> prefill engagement select
  const groupBtn = document.getElementById("groupPricingBtn");
  const engagementSelect = document.getElementById("engagementSelect");
  if (groupBtn && engagementSelect) {
    groupBtn.addEventListener("click", () => {
      // Wait a tick after navigation
      setTimeout(() => {
        engagementSelect.value = "Corporate Academy Training (Group)";
      }, 250);
    });
  }

  /* ============================
     Form Sanitization (DOMPurify)
     ============================ */

  const sanitizeValue = (value) => {
    const v = String(value ?? "");
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === "function") {
      // strict sanitize (no HTML allowed)
      return window.DOMPurify.sanitize(v, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    }
    // fallback minimal sanitize if DOMPurify isn't loaded
    return v.replace(/[<>]/g, "").trim();
  };

  const sanitizeForm = (form) => {
    const fields = form.querySelectorAll("input[type='text'], input[type='email'], input[type='tel'], textarea");
    fields.forEach(f => { f.value = sanitizeValue(f.value); });
  };

  const validateBasic = (form) => {
    // Keep it light. HTML5 required handles most.
    // Just ensure email has @ and scope not empty.
    const email = form.querySelector("input[type='email']");
    if (email && !String(email.value).includes("@")) return false;

    const required = form.querySelectorAll("[required]");
    for (const r of required) {
      if (!String(r.value || "").trim()) return false;
    }
    return true;
  };

  const wireForm = (formId, msgId, successText) => {
    const form = document.getElementById(formId);
    const msg = document.getElementById(msgId);
    if (!form || !msg) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "Sending…";

      // sanitize
      sanitizeForm(form);

      // validate
      if (!validateBasic(form)) {
        msg.textContent = "Please check your inputs and try again.";
        return;
      }

      // submit
      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(form)
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

  wireForm(
    "quoteForm",
    "quoteMessage",
    "Request received. We’ll reply with intake questions and next steps shortly."
  );

  wireForm(
    "applyForm",
    "applyMessage",
    "Application received. We’ll respond with screening steps and cohort details."
  );
})();  // Loader: remove quickly after load
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("is-done");
    setTimeout(() => loader.remove(), 480);
  });

  // Performance: reduce motion on low-end devices
  const isLowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || window.innerWidth < 420;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isLowEnd || reduceMotion) {
    document.documentElement.classList.add("reduce-motion");
  }

  // Canvas background: very light
  const canvas = document.getElementById("neuro");
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

      // faint dots only (no heavy lines)
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

    // Stop animation when tab not visible
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(draw);
  }

  // Video anti-download friction (NOT absolute security)
  const introVideo = document.getElementById("introVideo");
  const videoShell = document.getElementById("videoShell");
  if (introVideo) {
    // block context menu
    (videoShell || introVideo).addEventListener("contextmenu", (e) => e.preventDefault());

    // avoid accidental drag
    introVideo.setAttribute("draggable", "false");

    // additional hint: disable picture-in-picture
    introVideo.disablePictureInPicture = true;
  }

  /* ============================
     Academy Pricing: NGN + USD toggle + early-bird countdown
     ============================ */

  // Set your cohort start date here (YYYY-MM-DD)
  const cohortStartDate = "2026-03-15";
  const earlyBirdDiscountNgn = 50000;

  // USD estimate rate (you can update anytime)
  // Keep it simple and realistic — investors just want a benchmark.
  const usdRate = 1600; // NGN per USD (EDIT THIS)

  const usdToggle = document.getElementById("usdToggle");
  const priceCards = document.querySelectorAll("[data-ngn]");
  const countdownEl = document.getElementById("countdown");

  const formatNGN = (n) => "₦" + Math.round(n).toLocaleString("en-NG");
  const formatUSD = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const updateUSD = () => {
    const show = usdToggle && usdToggle.checked;
    priceCards.forEach(card => {
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

  // Countdown to cohort (for early bird)
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

  // Group pricing button -> prefill engagement select
  const groupBtn = document.getElementById("groupPricingBtn");
  const engagementSelect = document.getElementById("engagementSelect");
  if (groupBtn && engagementSelect) {
    groupBtn.addEventListener("click", () => {
      // Wait a tick after navigation
      setTimeout(() => {
        engagementSelect.value = "Corporate Academy Training (Group)";
      }, 250);
    });
  }

  /* ============================
     Form Sanitization (DOMPurify)
     ============================ */

  const sanitizeValue = (value) => {
    const v = String(value ?? "");
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === "function") {
      // strict sanitize (no HTML allowed)
      return window.DOMPurify.sanitize(v, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    }
    // fallback minimal sanitize if DOMPurify isn't loaded
    return v.replace(/[<>]/g, "").trim();
  };

  const sanitizeForm = (form) => {
    const fields = form.querySelectorAll("input[type='text'], input[type='email'], input[type='tel'], textarea");
    fields.forEach(f => { f.value = sanitizeValue(f.value); });
  };

  const validateBasic = (form) => {
    // Keep it light. HTML5 required handles most.
    // Just ensure email has @ and scope not empty.
    const email = form.querySelector("input[type='email']");
    if (email && !String(email.value).includes("@")) return false;

    const required = form.querySelectorAll("[required]");
    for (const r of required) {
      if (!String(r.value || "").trim()) return false;
    }
    return true;
  };

  const wireForm = (formId, msgId, successText) => {
    const form = document.getElementById(formId);
    const msg = document.getElementById(msgId);
    if (!form || !msg) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "Sending…";

      // sanitize
      sanitizeForm(form);

      // validate
      if (!validateBasic(form)) {
        msg.textContent = "Please check your inputs and try again.";
        return;
      }

      // submit
      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(form)
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

  wireForm(
    "quoteForm",
    "quoteMessage",
    "Request received. We’ll reply with intake questions and next steps shortly."
  );

  wireForm(
    "applyForm",
    "applyMessage",
    "Application received. We’ll respond with screening steps and cohort details."
  );
})();
