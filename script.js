document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1) Starfield background ---------- */
  const canvas = document.getElementById("stars");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let stars = [];
  function resize() {
    if (!canvas) return;
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    stars = Array.from({ length: Math.min(90, Math.floor(innerWidth / 14)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      s: Math.random() * 0.25 + 0.05,
      a: Math.random() * Math.PI * 2,
    }));
  }
  function draw() {
    if (!ctx) return;
    if (document.documentElement.getAttribute("data-theme") === "soft") {
      // calm theme has no starfield: clear it and check back later
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!reduce) setTimeout(() => requestAnimationFrame(draw), 600);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const st of stars) {
      st.a += 0.02;
      st.y += st.s;
      if (st.y > canvas.height) { st.y = 0; st.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(140,180,255,${0.35 + Math.sin(st.a) * 0.3})`;
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  resize();
  draw();
  addEventListener("resize", resize);

  /* ---------- 2) Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- 3) Active nav link on scroll ---------- */
  const links = nav ? [...nav.querySelectorAll("a")] : [];
  const map = new Map(links.map((l) => [l.getAttribute("href").slice(1), l]));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && map.has(e.target.id)) {
          links.forEach((l) => l.classList.remove("active"));
          map.get(e.target.id).classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  ["home", "years", "majors", "courses", "features", "certificate"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });

  /* ---------- 4) Progress bars animate when visible ---------- */
  const barObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); barObs.unobserve(e.target); }
    }),
    { threshold: 0.4 }
  );
  document.querySelectorAll(".bar").forEach((b) => barObs.observe(b));

  /* ---------- 5) Reveal sections once ---------- */
  document.querySelectorAll(".section, .features").forEach((el) => el.classList.add("reveal"));
  const revObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); }
    }),
    { threshold: 0, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revObs.observe(el));

});

/* ========== Auth glue: signed-out visitors are sent to login.html (a real page) ========== */
(() => {
  const KEY_USER = "ahlia_user";
  const PAGES = { cs: "cs.html", ai: "ai.html", is: "is.html", year1: "year1.html", year2: "year2.html" };
  /* every page except index.html, login.html and team.html needs a signed-in user */
  const PROTECTED = /^(welcome|courses|course|teams|staff|year1|year2|cs|ai|is|mylearning|schedule|paths|movies|certificate)\.html(\?[\w%.\-=&]*)?$/;

  const getUser = () => { try { return JSON.parse(localStorage.getItem(KEY_USER)); } catch (e) { return null; } };
  const loginUrl = (next) => "login.html" + (next ? "?next=" + encodeURIComponent(next) : "");

  /* small message at the bottom of the screen */
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 3200);
  }
  /* may the signed-in student open this page? (own year / major only) */
  function blocked(page) {
    const S = window.AhliaStore, user = getUser();
    const group = (page || "").replace(/\.html.*$/, "");
    if (!S || !user || !S.LABEL[group] || S.canAccess(group, user)) return null;
    return `هذه الصفحة خاصة بـ ${S.who(group)}، وأنت مسجل في: ${S.LABEL[user.major] || "حسابك"}.`;
  }

  const authBtn = document.getElementById("authBtn");
  const authLabel = document.getElementById("authLabel");
  function refreshHeader() {
    if (!authLabel) return;
    const u = getUser();
    authLabel.textContent = u ? "خروج" : "تسجيل الدخول";
    authBtn.title = u ? u.name : "";
  }
  refreshHeader();

  /* buttons / cards that need an account: header button, year cards, course buttons ... */
  document.querySelectorAll("[data-open-auth]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const user = getUser();
      if (el === authBtn && user) {            // header button while signed in = log out
        (window.AhliaStore ? AhliaStore.logout(false) : Promise.resolve(localStorage.removeItem(KEY_USER))).then(refreshHeader);
        return;
      }
      const target = el.dataset.target || null;
      if (user) {
        const msg = blocked(target);
        if (msg) { toast(msg); return; }
        if (target) location.href = target;
        return;
      }
      location.href = loginUrl(target);
    })
  );

  /* major cards */
  document.querySelectorAll(".major").forEach((m) =>
    m.addEventListener("click", (e) => {
      e.preventDefault();
      const page = PAGES[m.dataset.major];
      if (!getUser()) { location.href = loginUrl(page); return; }
      const msg = blocked(page);
      msg ? toast(msg) : (location.href = page);
    })
  );

  /* ordinary links to protected pages (nav, ...) */
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (a.hasAttribute("data-open-auth") || a.classList.contains("major") || !PROTECTED.test(href)) return;
    a.addEventListener("click", (e) => {
      if (getUser()) {
        const msg = blocked(href);
        if (msg) { e.preventDefault(); toast(msg); }
        return;
      }
      e.preventDefault();
      location.href = loginUrl(href);
    });
  });

  window.AhliaToast = toast;

  /* "المزيد" dropdown */
  document.querySelectorAll(".nav-more").forEach((box) => {
    const btn = box.querySelector(".nav-more__btn");
    const set = (open) => { box.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", (e) => { e.stopPropagation(); set(!box.classList.contains("open")); });
    document.addEventListener("click", (e) => { if (!box.contains(e.target)) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  });
})();

/* ========== Installable app (PWA): service worker + install button ========== */
(() => {
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  let deferred = null;
  const buttons = () => document.querySelectorAll("[data-install]");
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; buttons().forEach((b) => (b.hidden = false)); });
  window.addEventListener("appinstalled", () => { deferred = null; buttons().forEach((b) => (b.hidden = true)); });
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-install]"); if (!b || !deferred) return;
    deferred.prompt(); await deferred.userChoice; deferred = null; b.hidden = true;
  });
})();
