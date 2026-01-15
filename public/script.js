// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Loader
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";
    setTimeout(() => loader.remove(), 450);
  }
});

// Mobile menu
const toggle = document.getElementById("mobileToggle");
const nav = document.getElementById("nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Smooth scroll offset
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const headerH = document.querySelector(".site-header")?.offsetHeight || 72;
    const y = target.getBoundingClientRect().top + window.scrollY - (headerH + 10);
    window.scrollTo({ top: y, behavior: "smooth" });
  });
});

// Accordion
document.querySelectorAll(".accordion-header").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".accordion-item");
    item.classList.toggle("active");
  });
});

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("in-view");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal, .reveal-up, .reveal-left, .reveal-right")
  .forEach(el => observer.observe(el));

// WhatsApp helper
const WA_NUMBER = "2348107549232";
function openWhatsApp(message) {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// Quote form -> WhatsApp
const quoteForm = document.getElementById("quoteForm");
const quoteMsg = document.getElementById("quoteMessage");

if (quoteForm && quoteMsg) {
  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(quoteForm);
    const name = (data.get("q_name") || "").toString().trim();
    const email = (data.get("q_email") || "").toString().trim();
    const company = (data.get("q_company") || "").toString().trim();
    const phone = (data.get("q_phone") || "").toString().trim();
    const service = (data.get("q_service") || "").toString().trim();
    const details = (data.get("q_details") || "").toString().trim();

    if (!name || !email || !phone || !service || !details) {
      quoteMsg.textContent = "Please fill the required fields.";
      return;
    }

    const msg =
`Hello LionSec Hub 👋
I want to request a quote.

Name: ${name}
Email: ${email}
Company: ${company || "N/A"}
Phone: ${phone}
Service Needed: ${service}

Details:
${details}`;

    quoteMsg.textContent = "Opening WhatsApp…";
    openWhatsApp(msg);
    quoteForm.reset();
    setTimeout(() => (quoteMsg.textContent = "Request sent (via WhatsApp). We’ll reply ASAP."), 650);
  });
}

// Registration form -> WhatsApp
const regForm = document.getElementById("registrationForm");
const regMsg = document.getElementById("formMessage");

if (regForm && regMsg) {
  regForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(regForm);
    const fullname = (data.get("fullname") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const location = (data.get("location") || "").toString().trim();
    const course = (data.get("course") || "").toString().trim();
    const paymentPlan = (data.get("paymentPlan") || "").toString().trim();
    const notes = (data.get("notes") || "").toString().trim();

    if (!fullname || !email || !phone || !course || !paymentPlan) {
      regMsg.textContent = "Please fill the required fields.";
      return;
    }

    const msg =
`Hello LionSec Hub 👋
I want to register for the next cohort.

Full Name: ${fullname}
Email: ${email}
Phone/WhatsApp: ${phone}
Location: ${location || "N/A"}
Course: ${course}
Payment Plan: ${paymentPlan}

Notes:
${notes || "N/A"}`;

    regMsg.textContent = "Opening WhatsApp…";
    openWhatsApp(msg);
    regForm.reset();
    setTimeout(() => (regMsg.textContent = "Registration message sent (via WhatsApp)."), 650);
  });
}

/* Background network */
const canvas = document.getElementById("neuro");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let w, h, pts;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    pts = Array.from({ length: Math.min(90, Math.floor(w / 18)) }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);

    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 120) {
          ctx.globalAlpha = (1 - d / 120) * 0.18;
          ctx.strokeStyle = "#FFC857";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "#6EE7B7";
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  tick();
}
