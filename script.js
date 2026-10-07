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
            if (st.y > canvas.height) {
                st.y = 0;
                st.x = Math.random() * canvas.width;
            }
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
        }, { rootMargin: "-40% 0px -55% 0px" }
    );
    ["home", "years", "majors", "courses", "features", "certificate"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) spy.observe(el);
    });

    /* ---------- 4) Progress bars animate when visible ---------- */
    const barObs = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("in");
                barObs.unobserve(e.target);
            }
        }), { threshold: 0.4 }
    );
    document.querySelectorAll(".bar").forEach((b) => barObs.observe(b));

    /* ---------- 5) Reveal sections once ---------- */
    document.querySelectorAll(".section, .features").forEach((el) => el.classList.add("reveal"));
    const revObs = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("in");
                revObs.unobserve(e.target);
            }
        }), { threshold: 0, rootMargin: "0px 0px -40px 0px" }
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
        if (!t) {
            t = document.createElement("div");
            t.id = "toast";
            t.className = "toast";
            t.setAttribute("role", "status");
            document.body.append(t);
        }
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(toast.t);
        toast.t = setTimeout(() => t.classList.remove("show"), 3200);
    }
    /* may the signed-in student open this page? (own year / major only) */
    function blocked(page) {
        const S = window.AhliaStore,
            user = getUser();
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
            if (el === authBtn && user) { // header button while signed in = log out
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
                if (msg) {
                    e.preventDefault();
                    toast(msg);
                }
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
        const set = (open) => {
            box.classList.toggle("open", open);
            btn.setAttribute("aria-expanded", String(open));
        };
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            set(!box.classList.contains("open"));
        });
        document.addEventListener("click", (e) => { if (!box.contains(e.target)) set(false); });
        document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    });
})();

/* ========== Site-wide search palette ========== */
(() => {
    const pages = [
        ["الرئيسية", "index.html"],
        ["السنة الأولى", "year1.html"],
        ["السنة الثانية", "year2.html"],
        ["علوم الحاسب", "cs.html"],
        ["الذكاء الاصطناعي", "ai.html"],
        ["نظم المعلومات", "is.html"],
        ["الكورسات", "courses.html"],
        ["المواد والمحاضرات", "course.html"],
        ["هيئة التدريس", "staff.html"],
        ["جدولي", "schedule.html"],
        ["الأفلام التعليمية", "movies.html"],
        ["زملاء المشروع", "teams.html"],
        ["الشهادات", "certificate.html"],
        ["فريق العمل", "team.html"],
    ];
    const overlay = document.createElement("div");
    overlay.className = "search-palette";
    overlay.hidden = true;
    overlay.innerHTML = '<section class="search-palette__panel" role="dialog" aria-modal="true" aria-label="بحث في المنصة"><label class="search-palette__field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg><input type="search" placeholder="ابحث عن مادة، كورس، أو صفحة..." autocomplete="off" aria-label="ابحث في المنصة"><kbd>ESC</kbd></label><div class="search-palette__results" role="listbox" aria-label="نتائج البحث"></div><p class="search-palette__hint">تنقّل بالأسهم <kbd>↑</kbd> <kbd>↓</kbd> ثم Enter</p></section>';
    document.body.append(overlay);

    const input = overlay.querySelector("input");
    const results = overlay.querySelector(".search-palette__results");
    let indexPromise;
    let active = -1;
    let matches = [];
    let trigger = null;

    function makeEntry(title, href, section) {
        return { title, href, section };
    }

    async function buildIndex() {
        if (indexPromise) return indexPromise;
        indexPromise = Promise.all(pages.map(async([label, path]) => {
            const pageUrl = new URL(path, location.href);
            const entries = [makeEntry(label, pageUrl.href, "صفحة")];
            try {
                const response = await fetch(pageUrl.href, { credentials: "same-origin" });
                if (!response.ok) return entries;
                const html = await response.text();
                const doc = new DOMParser().parseFromString(html, "text/html");
                doc.querySelectorAll("h1, h2, h3, a[href]").forEach((element) => {
                    const title = (element.textContent || "").replace(/\s+/g, " ").trim();
                    if (title.length < 2 || title.length > 120) return;
                    let target = pageUrl;
                    if (element.matches("a[href]")) {
                        try { target = new URL(element.getAttribute("href"), pageUrl); } catch { return; }
                        if (target.origin !== location.origin || /^(mailto:|tel:|javascript:)/i.test(target.protocol)) return;
                    } else if (element.id) {
                        target = new URL(pageUrl.href);
                        target.hash = element.id;
                    }
                    entries.push(makeEntry(title, target.href, element.matches("a[href]") ? label : "عنوان في " + label));
                });
            } catch {}
            return entries;
        })).then((groups) => {
            const seen = new Set();
            return groups.flat().filter((entry) => {
                const key = entry.href + "|" + entry.title.toLocaleLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        });
        return indexPromise;
    }

    function render(query) {
        const request = ++render.request;
        results.replaceChildren();
        active = -1;
        if (!query.trim()) {
            results.textContent = "اكتب كلمة للبحث داخل صفحات المنصة";
            results.classList.add("is-empty");
            return;
        }
        results.textContent = "جاري البحث...";
        results.classList.add("is-empty");
        buildIndex().then((entries) => {
            if (request !== render.request) return;
            const term = query.trim().toLocaleLowerCase();
            matches = entries.filter((entry) => entry.title.toLocaleLowerCase().includes(term)).slice(0, 12);
            results.replaceChildren();
            results.classList.toggle("is-empty", matches.length === 0);
            if (!matches.length) {
                results.textContent = "مفيش نتائج. جرّب كلمة تانية.";
                return;
            }
            matches.forEach((entry, i) => {
                const link = document.createElement("a");
                link.className = "search-palette__result";
                link.href = entry.href;
                link.setAttribute("role", "option");
                link.setAttribute("aria-selected", "false");
                const title = document.createElement("span");
                title.textContent = entry.title;
                const section = document.createElement("small");
                section.textContent = entry.section;
                link.append(title, section);
                link.addEventListener("mousemove", () => setActive(i));
                results.append(link);
            });
        });
    }
    render.request = 0;

    function setActive(next) {
        const options = results.querySelectorAll(".search-palette__result");
        if (!options.length) return;
        active = (next + options.length) % options.length;
        options.forEach((option, i) => {
            option.setAttribute("aria-selected", String(i === active));
            if (i === active) option.scrollIntoView({ block: "nearest" });
        });
    }

    function close() {
        overlay.hidden = true;
        document.body.classList.remove("search-open");
        if (trigger) trigger.focus();
    }

    function open() {
        overlay.hidden = false;
        document.body.classList.add("search-open");
        input.value = "";
        render("");
        input.focus();
    }

    const actions = document.querySelector(".header__actions");
    if (actions) {
        trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "search-trigger";
        trigger.setAttribute("aria-label", "بحث في المنصة (Ctrl+K)");
        trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg><span>بحث</span><kbd>Ctrl K</kbd>';
        trigger.addEventListener("click", open);
        actions.prepend(trigger);
    }

    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive(active + 1);
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive(active - 1);
        }
        if (event.key === "Enter" && matches[active]) location.href = matches[active].href;
        if (event.key === "Escape") close();
    });
    overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
    document.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            overlay.hidden ? open() : close();
        } else if (event.key === "Escape" && !overlay.hidden) close();
    });
})();

/* ========== Course bookmarks and resume state ========== */
(() => {
    const catalog = window.COURSES;
    if (!catalog || !/\/course\.html$/.test(location.pathname)) return;

    let user = null;
    try { user = JSON.parse(localStorage.getItem("ahlia_user")); } catch (e) {}
    if (!user || !user.id) return;

    const query = (new URLSearchParams(location.search).get("id") || "").trim();
    const courseId = catalog[query] ? query : Object.keys(catalog).find((id) => {
        const title = String(catalog[id].title || "").toLocaleLowerCase();
        const needle = query.toLocaleLowerCase();
        return title === needle || (needle.length > 2 && (title.includes(needle) || needle.includes(title)));
    });
    if (!courseId) return;

    const userId = String(user.id);
    const course = catalog[courseId];
    const bookmarkKey = "ahlia_saved_courses:" + encodeURIComponent(userId);
    const recentKey = "ahlia_recent_course:" + encodeURIComponent(userId);
    const progressKey = `progress:${courseId}:${userId}`;
    const readSaved = () => {
        try {
            const value = JSON.parse(localStorage.getItem(bookmarkKey) || "[]");
            return Array.isArray(value) ? value.filter((item) => item && /^[\w.-]{1,80}$/.test(item.id)) : [];
        } catch (e) { return []; }
    };

    function rememberCourse() {
        let progress = {};
        try { progress = JSON.parse(localStorage.getItem(progressKey) || "{}"); } catch (e) {}
        const done = progress.done && typeof progress.done === "object" ? progress.done : {};
        const total = (course.sections || []).reduce((count, section) => count + (section.l || []).length, 0);
        const completed = Object.keys(done).filter((key) => done[key]).length;
        const percent = total ? Math.round(completed / total * 100) : 0;
        try {
            localStorage.setItem(recentKey, JSON.stringify({
                id: courseId,
                title: course.title,
                percent,
                userId,
                updatedAt: Date.now(),
            }));
        } catch (e) {}
    }

    rememberCourse();
    window.addEventListener("pagehide", rememberCourse);

    const info = document.getElementById("info");
    const continueButton = info && info.querySelector("#cont");
    if (!continueButton) return;

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "course-save";
    saveButton.setAttribute("aria-pressed", "false");
    continueButton.insertAdjacentElement("afterend", saveButton);

    function updateSaveButton() {
        const saved = readSaved().some((item) => item.id === courseId);
        saveButton.setAttribute("aria-pressed", String(saved));
        saveButton.setAttribute("aria-label", saved ? "إزالة الكورس من قائمتي" : "حفظ الكورس لقائمتي");
        saveButton.innerHTML = saved ?
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-8-4.5-8-10a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.5-8 10-8 10z" fill="currentColor"></path></svg><span>محفوظ في قائمتي</span>' :
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-8-4.5-8-10a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.5-8 10-8 10z"></path></svg><span>احفظه لوقت لاحق</span>';
    }

    saveButton.addEventListener("click", () => {
        const saved = readSaved();
        const exists = saved.some((item) => item.id === courseId);
        const updated = exists ?
            saved.filter((item) => item.id !== courseId) :
            [...saved, { id: courseId, title: course.title, savedAt: Date.now() }].slice(-30);
        try { localStorage.setItem(bookmarkKey, JSON.stringify(updated)); } catch (e) {}
        updateSaveButton();
    });
    updateSaveButton();
})();

/* ========== Installable app (PWA): service worker + install button ========== */
(() => {
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
        window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
    }
    let deferred = null;
    const buttons = () => document.querySelectorAll("[data-install]");
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferred = e;
        buttons().forEach((b) => (b.hidden = false));
    });
    window.addEventListener("appinstalled", () => {
        deferred = null;
        buttons().forEach((b) => (b.hidden = true));
    });
    document.addEventListener("click", async(e) => {
        const b = e.target.closest("[data-install]");
        if (!b || !deferred) return;
        deferred.prompt();
        await deferred.userChoice;
        deferred = null;
        b.hidden = true;
    });
})();