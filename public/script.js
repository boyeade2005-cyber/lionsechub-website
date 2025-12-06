document.addEventListener('DOMContentLoaded', () => {
  
  // 1. LOADER DISMISSAL
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
  }, 1500);

  // 2. YEAR UPDATE
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // 3. SCROLL REVEAL ANIMATION
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  const elementsToReveal = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  elementsToReveal.forEach(el => observer.observe(el));

  // 4. ACCORDION LOGIC (For Policy)
  const accHeaders = document.querySelectorAll('.accordion-header');
  accHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active');
    });
  });

  // 5. PARTICLE BACKGROUND
  const canvas = document.getElementById('neuro');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${1 - dist / 120})`;
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  // 6. FORM SUBMISSION - FIXED VERSION
  const form = document.getElementById('registrationForm');
  const msg = document.getElementById('formMessage');

  if (form && msg) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      msg.textContent = '⏳ ESTABLISHING SECURE UPLINK...';
      msg.style.color = '#00f0ff';

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      console.log('📤 Sending registration:', payload);

      try {
        // FIXED: Changed to localhost:5000
        const res = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        console.log('📥 Response status:', res.status);

        const data = await res.json();
        console.log('📥 Response data:', data);

        if (res.ok) {
          msg.textContent = '✅ ACCESS GRANTED. CHECK EMAIL FOR ONBOARDING.';
          msg.style.color = '#6EE7B7';
          form.reset();
          
          // Scroll to message
          msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          msg.textContent = '❌ ERROR: ' + (data.message || data.error || 'TRANSMISSION FAILED');
          msg.style.color = '#FF8A8A';
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
        msg.textContent = '❌ SYSTEM FAILURE: Make sure server is running on http://localhost:5000';
        msg.style.color = '#FF8A8A';
      }
    });
  }

  // 7. MOBILE MENU TOGGLE (if you want to add this later)
  const mobileToggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.nav');
  
  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }
});