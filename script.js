const qs = (sel, parent = document) => parent.querySelector(sel);
const qsa = (sel, parent = document) => [...parent.querySelectorAll(sel)];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

// Loader
window.addEventListener("load", () => {
  const loader = qs("#loader");
  if (!loader) return;
  setTimeout(() => loader.classList.add("loader--hidden"), 350);
  setTimeout(() => loader.remove(), 1200);
});

// Year
(() => {
  const year = qs("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

// Smooth scroll with navbar offset
(() => {
  const nav = qs("#navbar");
  const getOffset = () => (nav ? nav.getBoundingClientRect().height + 16 : 90);

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    e.preventDefault();
    const y = window.scrollY + el.getBoundingClientRect().top - getOffset();
    window.scrollTo({ top: y, behavior: "smooth" });
  });
})();

// Navbar glass effect on scroll
(() => {
  const navbar = qs("#navbar");
  if (!navbar) return;

  const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 50);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// Mobile menu (full-screen overlay)
(() => {
  const menu = qs("#mobileMenu");
  const openBtn = qs("#hamburger");
  const closeBtn = qs("#mobileClose");
  if (!menu || !openBtn || !closeBtn) return;

  const setA11y = (open) => {
    menu.setAttribute("aria-hidden", String(!open));
    openBtn.setAttribute("aria-expanded", String(open));
    openBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  const open = () => {
    menu.classList.add("open");
    setA11y(true);
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    menu.classList.remove("open");
    setA11y(false);
    document.body.style.overflow = "";
  };

  openBtn.addEventListener("click", () => {
    if (menu.classList.contains("open")) close();
    else open();
  });
  closeBtn.addEventListener("click", close);
  menu.addEventListener("click", (e) => {
    if (e.target === menu) close();
  });
  menu.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // init
  setA11y(false);
})();

// Scroll reveal
(() => {
  const items = qsa(".reveal");
  if (!items.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          obs.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => obs.observe(el));
})();

// Back-to-top button
(() => {
  const btn = qs("#backToTop");
  if (!btn) return;

  const onScroll = () => {
    const show = window.scrollY > 650;
    btn.classList.toggle("is-visible", show);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();

// Animated counters (triggered when hero stats visible)
(() => {
  const counters = qsa(".counter");
  if (!counters.length) return;

  const animate = (el) => {
    const target = Number(el.dataset.target || "0");
    const duration = 1200;
    const t0 = performance.now();

    const tick = (t) => {
      const p = clamp((t - t0) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        counters.forEach(animate);
        obs.disconnect();
      });
    },
    { threshold: 0.5 }
  );

  const heroStats = qs(".hero-stats");
  if (heroStats) obs.observe(heroStats);
})();

// Testimonials slider
(() => {
  const track = qs("#sliderTrack");
  const dotsWrap = qs("#sliderDots");
  const prev = qs("#prevTestimonial");
  const next = qs("#nextTestimonial");
  if (!track || !dotsWrap || !prev || !next) return;

  const slides = qsa(".quote", track);
  let index = 0;
  let timer = null;

  const renderDots = () => {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dot" + (i === index ? " is-active" : "");
      b.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      b.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(b);
    });
  };

  const go = (i, user = false) => {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    qsa(".dot", dotsWrap).forEach((d, di) => d.classList.toggle("is-active", di === index));
    if (user) restart();
  };

  const restart = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => go(index + 1), 5200);
  };

  prev.addEventListener("click", () => go(index - 1, true));
  next.addEventListener("click", () => go(index + 1, true));

  renderDots();
  go(0);
  restart();

  // pause on hover (desktop)
  const slider = track.closest(".slider");
  if (slider) {
    slider.addEventListener("mouseenter", () => timer && clearInterval(timer));
    slider.addEventListener("mouseleave", () => restart());
  }
})();

// Gallery lightbox
(() => {
  const lb = qs("#lightbox");
  const img = qs("#lightboxImg");
  const closeBtn = qs("#lightboxClose");
  if (!lb || !img || !closeBtn) return;

  const open = (src) => {
    img.src = src;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    img.src = "";
    document.body.style.overflow = "";
  };

  qsa(".gallery__item").forEach((btn) => {
    btn.addEventListener("click", () => open(btn.dataset.full || btn.querySelector("img")?.src));
  });
  closeBtn.addEventListener("click", close);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

// BMI calculator
(() => {
  const form = qs("#bmiForm");
  const h = qs("#bmiHeight");
  const w = qs("#bmiWeight");
  const out = qs("#bmiValue");
  const cat = qs("#bmiCategory");
  const msg = qs("#bmiMsg");
  const marker = qs("#bmiMarker");
  const result = qs("#bmiResult");
  const reset = qs("#bmiReset");
  if (!form || !h || !w || !out || !cat || !marker || !result || !reset || !msg) return;

  const classify = (bmi) => {
    if (bmi < 18.5) return ["Underweight", "Focus on muscle-building nutrition and strength training.", "#00c8ff"];
    if (bmi < 25) return ["Normal Weight ✓", "Excellent. Maintain your lifestyle and keep training consistently.", "#00ff88"];
    if (bmi < 30) return ["Overweight", "A structured cardio + strength plan with nutrition will help you reach ideal range.", "#ffaa00"];
    return ["Obese", "Our guided transformation plan can help you achieve a healthier BMI safely.", "#ff4444"];
  };

  const setPointer = (bmi) => {
    // scale: 15..40 mapped to 0..100
    const min = 15;
    const max = 40;
    const p = ((clamp(bmi, min, max) - min) / (max - min)) * 100;
    marker.style.left = `${p}%`;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const heightCm = Number(h.value);
    const weightKg = Number(w.value);
    if (!heightCm || !weightKg || heightCm < 100 || weightKg < 30) return;
    const m = heightCm / 100;
    const bmi = weightKg / (m * m);
    const bmiRounded = Math.round(bmi * 10) / 10;

    const [label, tip, color] = classify(bmi);
    out.textContent = String(bmiRounded);
    out.style.color = color;
    out.style.textShadow = `0 0 30px ${color}66`;
    cat.textContent = label;
    cat.style.color = color;
    msg.textContent = tip;
    setPointer(bmi);
    result.classList.add("active");
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  reset.addEventListener("click", () => {
    h.value = "";
    w.value = "";
    out.textContent = "--";
    out.style.color = "";
    out.style.textShadow = "";
    cat.textContent = "--";
    cat.style.color = "";
    msg.textContent = "Enter your details above";
    marker.style.left = "50%";
    result.classList.remove("active");
  });
})();

// Working hours open/closed status + highlight today
(() => {
  const badgeText = qs("#openStatus");
  const badge = badgeText?.closest(".open-badge");
  if (!badgeText || !badge) return;

  const now = new Date();
  const day = now.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const time = now.getHours() * 60 + now.getMinutes();
  const dayIds = ["row-Sun", "row-Mon", "row-Tue", "row-Wed", "row-Thu", "row-Fri", "row-Sat"];

  qsa(".hours-row").forEach((r) => r.classList.remove("today"));
  const todayRow = qs(`#${dayIds[day]}`);
  if (todayRow) todayRow.classList.add("today");

  let isOpen = false;
  if (day === 0) {
    isOpen = time >= 360 && time < 720; // 6am-12pm
  } else {
    const morning = time >= 330 && time < 720; // 5:30am-12pm
    const evening = time >= 900 && time < 1320; // 3pm-10pm
    isOpen = morning || evening;
  }

  if (isOpen) {
    badgeText.textContent = "We Are Open Now";
  } else {
    badgeText.textContent = "Currently Closed";
    badge.style.borderColor = "rgba(255,60,60,0.3)";
    badge.style.background = "rgba(255,60,60,0.05)";
    badgeText.style.color = "#ff8888";
    const dot = qs(".open-dot", badge);
    if (dot) {
      dot.style.background = "#ff4444";
      dot.style.boxShadow = "0 0 8px #ff4444";
    }
  }
})();

// Contact form (client-side toast + WhatsApp deep-link)
(() => {
  const form = qs("#contactForm");
  const toast = qs("#formToast");
  const success = qs("#formSuccess");
  if (!form || !toast) return;

  const show = (msg, ok = true) => {
    toast.textContent = msg;
    toast.classList.toggle("is-ok", ok);
    toast.classList.toggle("is-err", !ok);
    setTimeout(() => {
      toast.textContent = "";
      toast.classList.remove("is-ok", "is-err");
    }, 5200);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = String(qs("#cName")?.value || "").trim();
    const phone = String(qs("#cPhone")?.value || "").trim();
    const age = String(qs("#cAge")?.value || "").trim();
    const goal = String(qs("#cGoal")?.value || "").trim();
    const message = String(qs("#cMessage")?.value || "").trim();

    if (!name || !phone || !message) {
      show("Please fill name, phone, and message.", false);
      return;
    }

    const text = encodeURIComponent(
      `Hi THE GYM WORLD AMRELI,\n\nName: ${name}\nPhone: ${phone}${age ? `\nAge: ${age}` : ""}${goal ? `\nGoal: ${goal}` : ""}\n\nMessage: ${message}`
    );
    const wa = `https://wa.me/919499866664?text=${text}`;
    show("Opening WhatsApp to send your message…");
    if (success) success.classList.add("show");
    window.open(wa, "_blank", "noreferrer");
    form.reset();
    setTimeout(() => success && success.classList.remove("show"), 5000);
  });
})();

// Hero particles canvas (subtle neon)
(() => {
  const canvas = qs("#heroParticles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let w = 0;
  let h = 0;
  let particles = [];
  let raf = null;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  };

  const seed = () => {
    const count = clamp(Math.floor((w * h) / 22000), 32, 78);
    particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.18,
      a: 0.25 + Math.random() * 0.45,
      hue: Math.random() > 0.55 ? 200 : 190
    }));
  };

  const step = () => {
    ctx.clearRect(0, 0, w, h);

    // soft gradient wash
    const g = ctx.createRadialGradient(w * 0.2, h * 0.25, 0, w * 0.2, h * 0.25, Math.max(w, h));
    g.addColorStop(0, "rgba(58,169,255,0.06)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 100%, 62%, ${p.a})`;
      ctx.shadowColor = "rgba(58,169,255,0.35)";
      ctx.shadowBlur = 18;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // faint connecting lines
    ctx.shadowBlur = 0;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 140) continue;
        const alpha = (1 - dist / 140) * 0.10;
        ctx.strokeStyle = `rgba(58,169,255,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    raf = requestAnimationFrame(step);
  };

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const onResize = () => {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    resize();
  };

  window.addEventListener("resize", onResize, { passive: true });
  resize();
  step();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else if (!raf) {
      step();
    }
  });
})();

// Logo fallback if missing
(() => {
  const logos = qsa('img[src="assets/logo.jpg"]');
  logos.forEach((img) => {
    img.addEventListener("error", () => {
      img.style.display = "none";
      const parent = img.parentElement;
      if (!parent) return;
      const fallback = document.createElement("div");
      fallback.textContent = "THE GYM WORLD AMRELI";
      fallback.style.padding = "14px";
      fallback.style.borderRadius = "18px";
      fallback.style.border = "1px solid rgba(0,200,255,.35)";
      fallback.style.background = "rgba(0,20,35,.35)";
      fallback.style.boxShadow = "0 0 18px rgba(0,200,255,.25)";
      fallback.style.textAlign = "center";
      fallback.style.fontWeight = "900";
      fallback.style.letterSpacing = ".8px";
      fallback.style.fontFamily = "Bebas Neue, Rajdhani, sans-serif";
      parent.prepend(fallback);
    });
  });
})();

