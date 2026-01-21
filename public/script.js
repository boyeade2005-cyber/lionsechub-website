(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Loader (fast + calm)
  window.addEventListener("load", () => {
    const loader = $("#loader");
    if (!loader) return;
    // small delay to avoid flash, still fast
    setTimeout(() => loader.classList.add("hidden"), 350);
    setTimeout(() => loader.remove(), 900);
  });

  // Mobile nav
  const toggle = $("#mobileToggle");
  const nav = $("#nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // close on click
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  // Tabs -> smooth scroll (relaxed)
  const tabs = $$(".tab");
  const setActiveTab = (id) => {
    tabs.forEach(t => {
      const on = t.dataset.target === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
  };

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      const el = $(target);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveTab(target);
    });
  });

  // Update active tab on scroll
  const sections = ["#home","#intelligence","#academy","#careers","#ventures","#trust","#quote","#apply"]
    .map(id => $(id))
    .filter(Boolean);

  const ioActive = new IntersectionObserver((entries) => {
    // pick the most visible section
    const visible = entries
      .filter(en => en.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible && visible.target && visible.target.id) {
      setActiveTab("#" + visible.target.id);
    }
  }, { threshold: [0.35, 0.5, 0.65] });

  sections.forEach(s => ioActive.observe(s));

  // Reveal animations (calm)
  const revealEls = $$(".reveal, .reveal-up");
  const ioReveal = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("show");
        ioReveal.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => ioReveal.observe(el));

  // Video scanline only while playing
  const video = $("#introVideo");
  if (video) {
    const shell = video.closest(".video-shell");
    const setPlaying = (on) => shell && shell.classList.toggle("is-playing", on);

    video.addEventListener("play", () => setPlaying(true));
    video.addEventListener("pause", () => setPlaying(false));
    video.addEventListener("ended", () => setPlaying(false));
  }

  // Basic safe sanitization (no external libs)
  // NOTE: For maximum security, use DOMPurify locally later.
  const sanitize = (value) => {
    const s = String(value ?? "");
    // remove angle brackets and control chars
    return s
      .replace(/[<>]/g, "")
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .trim()
      .slice(0, 2000);
  };

  async function handleForm(formId, msgId) {
    const form = $(formId);
    const msg = $(msgId);
    if (!form || !msg) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "Submitting…";

      try {
        const fd = new FormData(form);
        // sanitize values before sending
        for (const [k, v] of fd.entries()) {
          fd.set(k, sanitize(v));
        }

        const res = await fetch(form.action, {
          method: "POST",
          body: fd,
          headers: { "Accept": "application/json" }
        });

        if (res.ok) {
          msg.textContent = "Submitted successfully. We’ll contact you shortly.";
          form.reset();
        } else {
          msg.textContent = "Submission failed. Please try again or use WhatsApp.";
        }
      } catch {
        msg.textContent = "Network error. Please try again or use WhatsApp.";
      }

      setTimeout(() => { msg.textContent = ""; }, 7000);
    });
  }

  handleForm("#quoteForm", "#quoteMessage");
  handleForm("#applyForm", "#applyMessage");

  // Ambient canvas (lightweight + calm)
  const canvas = $("#neuro");
  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0, h = 0;
    let dots = [];
    let raf = 0;

    const rand = (min, max) => Math.random() * (max - min) + min;

    const resize = () => {
      w = canvas.width = Math.floor(window.innerWidth * (window.devicePixelRatio || 1));
      h = canvas.height = Math.floor(window.innerHeight * (window.devicePixelRatio || 1));
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      const count = window.innerWidth < 720 ? 42 : 58;
      dots = Array.from({ length: count }).map(() => ({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.28, 0.28),
        vy: rand(-0.28, 0.28),
        r: rand(1.0, 2.0)
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);

      // dots
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(242,198,109,0.10)";
        ctx.fill();
      }

      // lines (calm + fewer)
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i], b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.08;
            ctx.strokeStyle = `rgba(140,180,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(step);
    };

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(step);
      }
    };

    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    resize();
    step();
  }
})();
