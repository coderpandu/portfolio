/* =========================================================
   Sumit Phuyal — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    const pre = $("#preloader");
    if (!pre) return;
    setTimeout(() => pre.classList.add("is-done"), reduceMotion ? 0 : 1400);
  });

  /* ---------- Year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Time-based greeting ---------- */
  const greetEl = $("#greeting");
  if (greetEl) {
    const h = new Date().getHours();
    greetEl.textContent = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) root.setAttribute("data-theme", savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  /* ---------- Custom cursor ---------- */
  const dot = $("#cursorDot");
  const ring = $("#cursorRing");
  if (dot && ring && window.matchMedia("(hover: hover)").matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-cursor]");
      ring.classList.remove("is-hover", "is-view");
      if (t) ring.classList.add(t.dataset.cursor === "view" ? "is-view" : "is-hover");
    });
    document.addEventListener("mousedown", () => ring.classList.add("is-hover"));
    document.addEventListener("mouseup", () => ring.classList.remove("is-hover"));
  }

  /* ---------- Navbar: scroll state, progress, active link ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");
  const sections = $$("section[id]");
  const navLinks = $$(".nav__link");

  const onScroll = () => {
    const y = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle("is-scrolled", y > 30);
    if (progress) progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + "%";
    if (toTop) toTop.classList.toggle("is-visible", y > 600);

    // active link
    let current = "";
    sections.forEach((sec) => {
      if (y >= sec.offsetTop - 140) current = sec.id;
    });
    navLinks.forEach((l) =>
      l.classList.toggle("is-active", l.getAttribute("href") === "#" + current)
    );
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Mobile menu ---------- */
  const burger = $("#navBurger");
  const menu = $("#navMenu");
  const closeMenu = () => {
    if (!menu) return;
    menu.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };
  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    $$(".nav__link", menu).forEach((l) => l.addEventListener("click", closeMenu));
    document.addEventListener("click", (e) => {
      if (menu.classList.contains("is-open") && !menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
  }

  /* ---------- Typing effect ---------- */
  const typed = $("#typed");
  if (typed) {
    const words = ["Web Designer", "IT Professional", "Python & Django Dev", "Customer Support Specialist", "Problem Solver"];
    let wi = 0, ci = 0, deleting = false;
    const tick = () => {
      const word = words[wi];
      typed.textContent = word.slice(0, ci);
      if (!deleting && ci < word.length) {
        ci++;
        setTimeout(tick, 90);
      } else if (!deleting && ci === word.length) {
        deleting = true;
        setTimeout(tick, 1600);
      } else if (deleting && ci > 0) {
        ci--;
        setTimeout(tick, 45);
      } else {
        deleting = false;
        wi = (wi + 1) % words.length;
        setTimeout(tick, 300);
      }
    };
    if (reduceMotion) { typed.textContent = words[0]; } else { tick(); }
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  // stagger index for grid children
  $$(".skills__grid .skill-card, .projects__grid .project, .about__stats .stat").forEach((el, i) => {
    el.style.setProperty("--i", (i % 4));
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            runSectionAnims(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    runSectionAnims(document);
  }

  /* ---------- Animated counters ---------- */
  function animateCounter(el) {
    const target = +el.dataset.target;
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  /* ---------- Skill bars & language rings ---------- */
  function runSectionAnims(scope) {
    const ctx = scope === document ? document : scope;

    // counters
    $$(".stat__num", ctx).forEach((el) => {
      if (!el.dataset.done) { el.dataset.done = "1"; animateCounter(el); }
    });

    // skill bars
    $$(".bar__fill", ctx).forEach((el) => {
      if (!el.dataset.done) { el.dataset.done = "1"; el.style.width = el.dataset.width + "%"; }
    });

    // language rings
    $$(".lang", ctx).forEach((lang) => {
      if (lang.dataset.done) return;
      lang.dataset.done = "1";
      const pct = +lang.dataset.pct;
      const circle = $(".lang__fg", lang);
      const val = $(".lang__val", lang);
      const circ = 327;
      if (circle) circle.style.strokeDashoffset = circ - (circ * pct) / 100;
      if (val) {
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / 1400, 1);
          val.textContent = Math.round(p * pct) + "%";
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    });
  }

  /* ---------- 3D tilt on hero card ---------- */
  const card = $("#heroCard");
  if (card && window.matchMedia("(hover: hover)").matches && !reduceMotion) {
    const strength = 12;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${px * strength}deg) rotateX(${-py * strength}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateY(0) rotateX(0)";
    });
  }

  /* ---------- Particle canvas ---------- */
  const canvas = $("#particles");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, particles = [], mouse = { x: -999, y: -999 };
    const COUNT = window.innerWidth < 768 ? 36 : 70;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function makeParticles() {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
      }));
    }
    function color() {
      return root.getAttribute("data-theme") === "light" ? "20, 22, 50" : "150, 140, 255";
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const rgb = color();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // mouse repel
        const dxm = p.x - mouse.x, dym = p.y - mouse.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 120) {
          p.x += (dxm / dm) * 0.8;
          p.y += (dym / dm) * 0.8;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, 0.7)`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${rgb}, ${0.14 * (1 - d / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener("mouseout", () => { mouse.x = -999; mouse.y = -999; });
    window.addEventListener("resize", () => { resize(); makeParticles(); });
    resize(); makeParticles(); draw();
  }

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  const note = $("#formNote");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#name"), email = $("#email"), subject = $("#subject"), message = $("#message");
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let ok = true;

      [name, email, message].forEach((f) => {
        const bad = !f.value.trim() || (f === email && !emailRe.test(email.value.trim()));
        f.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });

      if (!ok) {
        note.textContent = "Please fill in your name, a valid email, and a message.";
        note.className = "form__note err";
        return;
      }

      // Build a mailto so the message actually reaches the inbox (no backend needed)
      const subj = encodeURIComponent(subject.value.trim() || `Portfolio message from ${name.value.trim()}`);
      const body = encodeURIComponent(
        `Name: ${name.value.trim()}\nEmail: ${email.value.trim()}\n\n${message.value.trim()}`
      );
      note.textContent = "Opening your email app… thanks for reaching out!";
      note.className = "form__note ok";
      window.location.href = `mailto:sumeetphuyal585@gmail.com?subject=${subj}&body=${body}`;
      form.reset();
      setTimeout(() => { note.textContent = ""; note.className = "form__note"; }, 6000);
    });

    // clear invalid state while typing
    $$("#contactForm input, #contactForm textarea").forEach((f) =>
      f.addEventListener("input", () => f.classList.remove("invalid"))
    );
  }

  /* ---------- Smooth-scroll fallback for older browsers ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  });
})();
