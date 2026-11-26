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
    $$("video").forEach((v) => {
      const shell = v.closest(".video-shell") || v;
      shell.addEventListener("contextmenu", (e) => e.preventDefault());
      v.setAttribute("draggable", "false");
      v.disablePictureInPicture = true;
    });
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
  const sanitizeValue = (value) => {
    const raw = String(value ?? "");
    if (window.DOMPurify && DOMPurify.sanitize) {
      return DOMPurify.sanitize(raw, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    }
    return raw.replace(/[<>]/g, "").trim();
  };

  const sanitizeForm = (form) => {
    form
      .querySelectorAll("input[type='text'], input[type='email'], input[type='tel'], input[type='date'], textarea, select")
      .forEach((f) => (f.value = sanitizeValue(f.value)));
  };

  const validateBasic = (form) => {
    const email = form.querySelector("input[type='email']");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email.value).trim())) return false;

    const required = form.querySelectorAll("[required]");
    for (const r of required) {
      if (r.type === "checkbox") {
        if (!r.checked) return false;
      } else if (!String(r.value || "").trim()) {
        return false;
      }
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

      // Honeypot: bots that fill the hidden field get a silent success
      const hp = form.querySelector("input[name='_gotcha']");
      if (hp && String(hp.value || "").trim()) {
        form.reset();
        msg.textContent = successText;
        return;
      }

      // Guard: catch placeholder endpoints before attempting to submit
      const endpoint = form.action || "";
      if (!endpoint || endpoint.includes("yourFormId") || endpoint.includes("yourApplyFormId")) {
        msg.textContent =
          "⚠️ Replace the Formspree link in your HTML (action='https://formspree.io/f/REAL_ID').";
        return;
      }

      if (!validateBasic(form)) {
        msg.textContent = "Please check your inputs and try again.";
        return;
      }

      const fallback =
        " Could not send — please WhatsApp +234 810 754 9232 or email lionsechub@gmail.com.";

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

        let detail = ` (HTTP ${res.status})`;
        try {
          const data = await res.json();
          if (Array.isArray(data.errors) && data.errors.length) {
            detail = " — " + data.errors.map((er) => er.message).join("; ");
          }
        } catch { /* non-JSON error body */ }
        msg.textContent = "Could not send." + detail + fallback;
      } catch {
        msg.textContent = "Network error." + fallback;
      }
    });
  };

  /* ============================
     Rotating globe (Global Reach)
     Lightweight canvas dot-globe with market arcs.
     ============================ */
  const initGlobe = () => {
    $$("canvas[data-globe]").forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = document.documentElement.classList.contains("reduce-motion");

    const CITIES = [
      { name: "Lagos", lat: 6.45, lon: 3.40, anchor: true },
      { name: "Cairo", lat: 30.04, lon: 31.24 },
      { name: "Paris", lat: 48.86, lon: 2.35 },
      { name: "London", lat: 51.51, lon: -0.13 },
      { name: "Rome", lat: 41.90, lon: 12.50 },
      { name: "Dubai", lat: 25.20, lon: 55.30 },
      { name: "Singapore", lat: 1.35, lon: 103.82 },
      { name: "Sydney", lat: -33.87, lon: 151.21 },
    ];

    const toVec = (lat, lon) => {
      const la = (lat * Math.PI) / 180;
      const lo = (lon * Math.PI) / 180;
      return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)];
    };

    const cityVecs = CITIES.map((c) => ({ ...c, v: toVec(c.lat, c.lon) }));

    // Dot grid
    const dots = [];
    for (let lat = -72; lat <= 72; lat += 12) {
      for (let lon = 0; lon < 360; lon += 15) {
        dots.push(toVec(lat, lon));
      }
    }

    // Slerp between two unit vectors
    const slerp = (a, b, t) => {
      const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      const om = Math.acos(dot);
      if (om < 1e-4) return a;
      const so = Math.sin(om);
      const k0 = Math.sin((1 - t) * om) / so;
      const k1 = Math.sin(t * om) / so;
      return [
        a[0] * k0 + b[0] * k1,
        a[1] * k0 + b[1] * k1,
        a[2] * k0 + b[2] * k1,
      ];
    };

    const rotate = (v, a) => {
      const c = Math.cos(a), s = Math.sin(a);
      return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
    };

    let w = 0, h = 0, raf = 0, visible = true, rot = 0.6, last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth || 320;
      h = canvas.clientHeight || w;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (v, R, cx, cy) => {
      const p = rotate(v, rot);
      return { x: cx + p[0] * R, y: cy - p[1] * R, z: p[2] };
    };

    const draw = (now) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (!reduce) rot += (dt / 1000) * 0.05;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.40;

      // Sphere rim + outer radar ring
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(140,220,200,.14)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R + 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(140,220,200,.06)";
      ctx.setLineDash([2, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Graticule — lat/long grid, front hemisphere only
      ctx.lineWidth = 1;
      const line = (pts) => {
        ctx.beginPath();
        let pen = false;
        pts.forEach((v) => {
          const p = project(v, R * 0.995, cx, cy);
          if (p.z <= 0.02) { pen = false; return; }
          if (!pen) { ctx.moveTo(p.x, p.y); pen = true; }
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      };
      ctx.strokeStyle = "rgba(140,220,200,.07)";
      for (let lat = -60; lat <= 60; lat += 30) {
        const pts = [];
        for (let lon = 0; lon <= 360; lon += 12) pts.push(toVec(lat, lon));
        line(pts);
      }
      for (let lon = 0; lon < 360; lon += 30) {
        const pts = [];
        for (let lat = -78; lat <= 78; lat += 10) pts.push(toVec(lat, lon));
        line(pts);
      }

      // Connection arcs from Lagos
      const anchor = cityVecs[0];
      cityVecs.slice(1).forEach((c, i) => {
        ctx.beginPath();
        const STEPS = 42;
        let started = false;
        for (let s = 0; s <= STEPS; s++) {
          const t = s / STEPS;
          const vv = slerp(anchor.v, c.v, t);
          const bulge = 1 + 0.14 * Math.sin(Math.PI * t);
          const p = project([vv[0] * bulge, vv[1] * bulge, vv[2] * bulge], R * 1.001, cx, cy);
          if (p.z <= 0.01) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(110,231,183,.20)";
        ctx.lineWidth = 1;
        ctx.shadowColor = "rgba(110,231,183,.35)";
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Travelling pulse
        const pt = (now / 2400 + i * 0.19) % 1;
        const pv = slerp(anchor.v, c.v, pt);
        const pb = 1 + 0.14 * Math.sin(Math.PI * pt);
        const pp = project([pv[0] * pb, pv[1] * pb, pv[2] * pb], R * 1.001, cx, cy);
        if (pp.z > 0.02) {
          ctx.beginPath();
          ctx.arc(pp.x, pp.y, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,214,120,.95)";
          ctx.shadowColor = "rgba(255,214,120,.9)";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Dot grid (front hemisphere brighter)
      for (const d of dots) {
        const p = project(d, R, cx, cy);
        if (p.z <= 0.015) continue;
        const t = (p.z + 1) / 2;
        const r = 0.7 + 1.5 * t;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120,225,195,${(0.10 + 0.55 * t).toFixed(3)})`;
        ctx.fill();
      }

      // Radar sweep on the outer ring — cyber ops vibe
      const sweep = now / 2600;
      for (let k = 0; k < 4; k++) {
        const a = sweep - k * 0.22;
        ctx.beginPath();
        ctx.arc(cx, cy, R + 10, a - 0.55, a);
        ctx.strokeStyle = `rgba(110,231,183,${(0.34 - k * 0.08).toFixed(3)})`;
        ctx.lineWidth = 2 - k * 0.4;
        ctx.stroke();
      }
      // Sweep head dot
      const ha = sweep;
      const hx = cx + Math.cos(ha) * (R + 10);
      const hy = cy + Math.sin(ha) * (R + 10);
      ctx.beginPath();
      ctx.arc(hx, hy, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(110,231,183,.9)";
      ctx.shadowColor = "rgba(110,231,183,.9)";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cities + sector markers (bank / government) + transmission ripples
      cityVecs.forEach((c, i) => {
        const p = project(c.v, R, cx, cy);
        if (p.z <= 0.02) return;
        const t = (p.z + 1) / 2;

        // Expanding ripple — "transmitting services" pulse
        const rt = (now / 1600 + i * 0.31) % 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + rt * 18, 0, Math.PI * 2);
        ctx.strokeStyle = c.anchor
          ? `rgba(255,200,87,${((1 - rt) * 0.30).toFixed(3)})`
          : `rgba(110,231,183,${((1 - rt) * 0.22).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // City hub
        ctx.beginPath();
        ctx.arc(p.x, p.y, c.anchor ? 3.4 : 2.4, 0, Math.PI * 2);
        ctx.fillStyle = c.anchor ? "rgba(255,200,87,.95)" : `rgba(110,231,183,${(0.5 + 0.5 * t).toFixed(3)})`;
        ctx.fill();

        // Banking marker — gold square
        ctx.fillStyle = "rgba(255,200,87,.85)";
        ctx.fillRect(p.x + 9, p.y - 3, 4, 4);

        // Government marker — cyan triangle
        ctx.fillStyle = "rgba(125,211,252,.85)";
        ctx.beginPath();
        ctx.moveTo(p.x - 7, p.y + 4);
        ctx.lineTo(p.x - 11, p.y - 1);
        ctx.lineTo(p.x - 3, p.y - 1);
        ctx.closePath();
        ctx.fill();

        if (p.z > 0.22) {
          ctx.font = "600 10px system-ui, sans-serif";
          ctx.fillStyle = c.anchor ? "rgba(255,200,87,.95)" : "rgba(232,243,255,.8)";
          ctx.fillText(c.name.toUpperCase(), p.x + 14, p.y - 8);
        }
      });

      if (!reduce) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = 0;
      raf = requestAnimationFrame(draw);
    };

    resize();
    if (reduce) {
      draw(0);
    } else {
      start();
    }

    if ("ResizeObserver" in window) {
      new ResizeObserver(() => { resize(); if (reduce) draw(0); }).observe(canvas);
    } else {
      window.addEventListener("resize", () => { resize(); if (reduce) draw(0); }, { passive: true });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible && !reduce) start();
        else cancelAnimationFrame(raf);
      }).observe(canvas);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (visible && !reduce) start();
    });
    });
  };

  /* ============================
     Academy apply: Fast-Track gate + programme prefill
     ============================ */
  const initAcademyApply = () => {
    const form = $("#applyForm");
    if (!form) return;
    const track = form.querySelector("select[name='track']");
    const gate = $("#ftGate");
    const confirmBox = form.querySelector("input[name='ft_confirm']");

    if (track && gate) {
      const sync = () => {
        const isFT = /fast-track/i.test(track.value || "");
        gate.hidden = !isFT;
        if (confirmBox) confirmBox.required = isFT;
      };
      track.addEventListener("change", sync);
      sync();
    }

    // Course cards can prefill the programme select via data-apply="Programme Name"
    $$("[data-apply]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!track) return;
        const wanted = btn.getAttribute("data-apply") || "";
        const opt = Array.from(track.options).find(
          (o) => o.text.trim() === wanted || o.value === wanted
        );
        if (opt) track.value = opt.value || opt.text;
      });
    });
  };

  /* ============================
     Media guard — discourage save/screenshot of media & protected pages
     ============================ */
  const initMediaGuard = () => {
    $$("img, video").forEach((el) => el.setAttribute("draggable", "false"));

    document.addEventListener("contextmenu", (e) => {
      if (e.target.closest("img, video, audio, canvas, .video-shell")) e.preventDefault();
    });
    document.addEventListener("dragstart", (e) => {
      if (e.target.closest("img, video, a, .video-shell")) e.preventDefault();
    });

    // Protected pages (e.g. curriculum): no right-click, no text selection
    if (document.body && document.body.hasAttribute("data-protect")) {
      document.body.classList.add("no-select");
      document.addEventListener("contextmenu", (e) => e.preventDefault());
    }
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

    initAcademyFilters();
    initAcademyApply();
    initGroupPricingPrefill();
    initGlobe();
    initMediaGuard();

    wireForm("quoteForm", "quoteMessage", "Request received. We'll reply shortly.");
    wireForm("applyForm", "applyMessage", "Application received. We'll respond shortly.");
    wireForm("proposalForm", "proposalMessage", "Proposal request received. Our team will respond with next steps.");
  };

  document.addEventListener("DOMContentLoaded", init);
})();
