/* Renders courses, files, slides and teaching staff from data.js */
(() => {
  "use strict";
  const DATA = window.AHLIA_DATA;
  const key = document.body.dataset.page;
  const isAll = key === "all";
  const isStaffPage = key === "staff";
  const isUtil = ["mylearning", "paths", "movies"].includes(key);   // pages that only need the shared modal API
  const Store = window.AhliaStore;
  const allPages = (DATA && DATA.pages) || {};
  const allCourses = Object.values(allPages).flatMap((p) => (p.courses || []).map((c) => Object.assign({ category: p.label }, c)));
  const allStaff = (DATA && DATA.staff) || [];
  const base = allPages[key];
  if (!isAll && !isStaffPage && !isUtil && !base) return;
  const page = isAll || isStaffPage || isUtil ? { icon: "code", courses: allCourses } : base;
  const pageIds = new Set((page.courses || []).map((c) => c.id));

  /* ---------- icons ---------- */
  const S = 'viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  const ICONS = {
    cs: `<svg ${S}><rect x="11" y="11" width="26" height="26" rx="4"/><path d="M18 20l-4 4 4 4M30 20l4 4-4 4M26 18l-4 12M17 5v6M24 5v6M31 5v6M17 37v6M24 37v6M31 37v6"/></svg>`,
    ai: `<svg ${S}><path d="M24 8c-3-3-9-2-10 3-4 1-6 5-4 9-2 3-1 8 3 9 1 4 6 6 11 3 5 3 10 1 11-3 4-1 5-6 3-9 2-4 0-8-4-9-1-5-7-6-10-3z"/><path d="M24 8v32M18 18l6 4M30 20l-6 4M18 30l6-4"/></svg>`,
    is: `<svg ${S}><ellipse cx="24" cy="11" rx="14" ry="5"/><path d="M10 11v26c0 3 6 5 14 5s14-2 14-5V11M10 24c0 3 6 5 14 5s14-2 14-5"/></svg>`,
    db: `<svg ${S}><ellipse cx="24" cy="11" rx="14" ry="5"/><path d="M10 11v26c0 3 6 5 14 5s14-2 14-5V11M10 24c0 3 6 5 14 5s14-2 14-5"/></svg>`,
    pc: `<svg ${S}><rect x="6" y="8" width="36" height="24" rx="3"/><path d="M16 40h16M24 32v8"/></svg>`,
    code: `<svg ${S}><rect x="5" y="8" width="38" height="32" rx="5"/><path d="M19 18l-5 6 5 6M29 18l5 6-5 6"/></svg>`,
    calc: `<svg ${S}><rect x="9" y="6" width="30" height="36" rx="4"/><path d="M15 14h18M16 24h4M28 24h4M16 32h4M28 32h4"/></svg>`,
    book: `<svg ${S}><path d="M24 12c-4-4-12-4-18-2v26c6-2 14-2 18 2 4-4 12-4 18-2V10c-6-2-14-2-18 2z"/><path d="M24 12v26"/></svg>`,
    tree: `<svg ${S}><circle cx="24" cy="9" r="4"/><circle cx="12" cy="32" r="4"/><circle cx="36" cy="32" r="4"/><path d="M22 13l-8 15M26 13l8 15M12 36v6M36 36v6"/></svg>`,
    obj: `<svg ${S}><path d="M24 5l16 9v20L24 43 8 34V14z"/><path d="M8 14l16 9 16-9M24 23v20"/></svg>`,
    sigma: `<svg ${S}><path d="M36 9H12l14 15-14 15h24"/></svg>`,
    design: `<svg ${S}><path d="M8 40l4-12L34 6l8 8-22 22z"/><path d="M28 12l8 8M8 40l8-4"/></svg>`,
    media: `<svg ${S}><rect x="5" y="9" width="38" height="30" rx="5"/><path d="M20 17l12 7-12 7z"/></svg>`,
    data: `<svg ${S}><path d="M6 42h36"/><rect x="9" y="26" width="7" height="12" rx="1"/><rect x="20" y="16" width="7" height="22" rx="1"/><rect x="31" y="8" width="7" height="30" rx="1"/></svg>`,
    security: `<svg ${S}><path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z"/><path d="M17 24l5 5 9-10"/></svg>`,
    mobile: `<svg ${S}><rect x="13" y="4" width="22" height="40" rx="4"/><path d="M21 38h6"/></svg>`,
  };
  const U = 'viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  const UI = {
    back: `<svg ${U}><path d="M9 5l7 7-7 7"/></svg>`,
    next: `<svg ${U}><path d="M15 5l-7 7 7 7"/></svg>`,
    x: `<svg ${U}><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    file: `<svg ${U}><path d="M6 2h9l5 5v15H6z"/><path d="M9 13h8M9 17h8"/></svg>`,
    slides: `<svg ${U}><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></svg>`,
    full: `<svg ${U}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  };
  const icon = (name) => ICONS[name] || ICONS[page.icon] || "";

  /* ---------- tiny DOM helper ---------- */
  function h(tag, props, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) {
      if (kid != null && kid !== false) node.append(kid.nodeType ? kid : document.createTextNode(kid));
    }
    return node;
  }

  /* ---------- data helpers ---------- */
  const courses = page.courses || [];
  const staff = isAll || isStaffPage || isUtil ? allStaff : allStaff.filter((m) => (m.teaches || []).some((id) => pageIds.has(id)));
  const teachersOf = {};
  allStaff.forEach((m) => (m.teaches || []).forEach((id) => (teachersOf[id] = teachersOf[id] || []).push(m)));
  const courseById = (id) => allCourses.find((c) => c.id === id);
  const initial = (name) => (name.replace(/^(د|م|م\.م)\.\s*/, "").trim()[0] || "د");
  const avatar = (m, big) => h("span", { class: "avatar" + (big ? " lg" : ""), "aria-hidden": "true" }, initial(m.name));

  /* ---------- modal manager (with back stack) ---------- */
  const box = h("div", { class: "modal__box panel" });
  const modal = h(
    "div",
    { class: "modal", hidden: true, role: "dialog", "aria-modal": "true", "aria-label": "المحتوى" },
    h("div", { class: "modal__backdrop", onclick: () => closeAll() }),
    box
  );
  document.body.append(modal);
  let stack = [];
  let lastFocus = null;

  function render() {
    const view = stack[stack.length - 1];
    box.className = "modal__box panel panel--" + (view.size || "md");
    const closeBtn = h("button", { class: "icon-btn", type: "button", "aria-label": "إغلاق", onclick: () => closeAll(), html: UI.x });
    const head = h(
      "div",
      { class: "panel__head" },
      stack.length > 1 ? h("button", { class: "icon-btn", type: "button", "aria-label": "رجوع", onclick: back, html: UI.back }) : null,
      h("h2", {}, view.title),
      view.actions || [],
      closeBtn
    );
    box.replaceChildren(head, view.body());
    closeBtn.focus({ preventScroll: true });
  }
  function go(view) {
    if (modal.hidden) {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add("modal-open");
    }
    stack.push(view);
    render();
  }
  function back() {
    stack.pop();
    stack.length ? render() : closeAll();
  }
  function closeAll() {
    stack = [];
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    box.replaceChildren();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") { stack.length > 1 ? back() : closeAll(); return; }
    const v = stack[stack.length - 1];
    if (v && v.onKey) v.onKey(e);
  });

  /* ---------- views ---------- */
  const tabMemory = {};

  /* progress bars on cards stay in sync with the checklist inside the modal */
  const progressBar = (c) => {
    if (!Store || !Store.getUser()) return null;
    const p = Store.percent(c);
    if (!p && !Store.isEnrolled(c.id)) return null;
    return h("div", { class: "cprog", "data-id": c.id }, h("div", { class: "bar in" }, h("i", { style: `--w:${p}%;width:${p}%` })), h("small", {}, p + "%"));
  };
  const refreshProgress = () =>
    document.querySelectorAll(".cprog").forEach((n) => {
      const course = courseById(n.dataset.id); if (!course) return;
      const p = Store.percent(course);
      n.querySelector("i").style.width = p + "%";
      n.querySelector("small").textContent = p + "%";
    });
  const lockedFor = (c) => !!(Store && c.group && !Store.canAccess(c.group));
  const LOCK = '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 118 0v4"/></svg>';

  function materialsView(c) {
    return {
      title: c.title,
      size: "md",
      body() {
        if (lockedFor(c)) {
          return h("div", { class: "panel__body lockbox" },
            h("span", { class: "lockbox__ico", html: LOCK }),
            h("h3", {}, "غير متاح لتخصصك"),
            h("p", {}, `محتوى هذه المادة خاص بـ ${Store.who(c.group)}.`)
          );
        }
        const list = h("div", { class: "rows" });
        const tabs = h("div", { class: "tabs", role: "tablist" });
        const topics = c.topics || [];
        const defs = [
          ["files", `الملفات (${c.files.length})`],
          ["slides", `السلايد (${c.slides.length})`],
        ];
        if (Store && topics.length) defs.push(["lectures", `المحاضرات (${topics.length})`]);

        /* enrol + progress */
        const enrollArea = h("div", { class: "enroll" });
        function paintEnroll() {
          if (!Store || !Store.getUser()) return;
          const on = Store.isEnrolled(c.id), p = Store.percent(c);
          enrollArea.replaceChildren(
            h("div", { class: "enroll__top" },
              h("button", { class: "btn btn--xs " + (on ? "btn--outline" : "btn--primary"), type: "button",
                onclick: () => { Store.setEnrolled(c.id, !on); paintEnroll(); refreshProgress(); } }, on ? "مشترك ✓ (إلغاء)" : "اشترك في الكورس"),
              p === 100 && topics.length ? h("a", { class: "btn btn--primary btn--xs", href: "certificate.html?course=" + encodeURIComponent(c.id), target: "_blank", rel: "noopener" }, "احصل على شهادتك") : null
            ),
            on || p ? h("div", { class: "enroll__bar" }, h("div", { class: "bar in" }, h("i", { style: `width:${p}%` })), h("small", {}, `${p}% مكتمل`)) : null
          );
        }
        function paint() {
          const tab = tabMemory[c.id] || "files";
          tabs.replaceChildren(
            ...defs.map(([id, label]) =>
              h("button", { class: "tab", type: "button", role: "tab", "aria-selected": String(tab === id), onclick: () => { tabMemory[c.id] = id; paint(); } }, label)
            )
          );
          if (tab === "lectures") {
            const done = new Set(Store.doneOf(c.id));
            list.replaceChildren(
              ...topics.map((t, i) => {
                const box = h("input", { type: "checkbox", id: `lec-${c.id}-${i}` });
                box.checked = done.has(i);
                box.addEventListener("change", () => { Store.toggleLecture(c.id, i, box.checked); paintEnroll(); refreshProgress(); row.classList.toggle("is-done", box.checked); });
                const row = h("label", { class: "row lecture" + (box.checked ? " is-done" : ""), for: `lec-${c.id}-${i}` },
                  box, h("span", { class: "lecture__n" }, String(i + 1)), h("div", { class: "row__text" }, h("strong", {}, t), h("small", {}, "علّم المحاضرة عند الانتهاء منها")));
                return row;
              })
            );
            return;
          }
          list.replaceChildren(
            ...(tab === "files"
              ? c.files.map((f) =>
                  h("div", { class: "row" },
                    h("span", { class: "row__ico", html: UI.file }),
                    h("div", { class: "row__text" }, h("strong", {}, f.title), h("small", {}, f.type || "PDF")),
                    h("div", { class: "row__actions" },
                      h("button", { class: "btn btn--primary btn--xs", type: "button", onclick: () => go(pdfView(c, f)) }, "فتح"),
                      h("a", { class: "btn btn--outline btn--xs", href: f.url, download: true }, "تحميل")
                    )
                  )
                )
              : c.slides.map((d) =>
                  h("div", { class: "row" },
                    h("span", { class: "row__ico", html: UI.slides }),
                    h("div", { class: "row__text" }, h("strong", {}, d.title), h("small", {}, d.slides ? `${d.slides.length} شرائح` : "PDF")),
                    h("div", { class: "row__actions" },
                      h("button", { class: "btn btn--primary btn--xs", type: "button", onclick: () => go(deckView(c, d)) }, "عرض")
                    )
                  )
                ))
          );
        }
        paintEnroll();
        paint();
        const teachers = isAll ? [] : teachersOf[c.id] || [];   // courses page shows no staff names
        return h("div", { class: "panel__body" },
          h("p", { class: "panel__desc" }, c.desc, c.hours ? [" • ", h("span", { class: "time" }, c.hours + " ساعات")] : null),
          teachers.length ? h("div", { class: "teachers" }, h("small", {}, "يدرّسها:"), teachers.map(teacherChip)) : null,
          enrollArea, tabs, list
        );
      },
    };
  }

  function pdfView(c, f) {
    return {
      title: f.title,
      size: "pdf",
      actions: [h("a", { class: "btn btn--outline btn--xs hide-sm", href: f.url, target: "_blank", rel: "noopener" }, "فتح في تبويب")],
      body() {
        return h("div", { class: "panel__body panel__body--flush" },
          h("iframe", { class: "viewer", src: f.url, title: f.title }));
      },
    };
  }

  function deckView(c, deck) {
    if (deck.url) return pdfView(c, deck);
    const slides = deck.slides || [];
    let i = 0;
    let paint = () => {};
    const prev = () => { if (i > 0) { i--; paint(); } };
    const next = () => { if (i < slides.length - 1) { i++; paint(); } };
    return {
      title: deck.title,
      size: "deck",
      onKey(e) {
        // RTL deck: left = next, right = previous
        if (e.key === "ArrowLeft") next();
        else if (e.key === "ArrowRight") prev();
      },
      body() {
        const stage = h("div", { class: "stage", "aria-live": "polite" });
        const count = h("span", { class: "deck__count" });
        const bar = h("i", {});
        const prevBtn = h("button", { class: "btn btn--outline btn--xs", type: "button", onclick: prev, html: UI.back + " السابق" });
        const nextBtn = h("button", { class: "btn btn--primary btn--xs", type: "button", onclick: next, html: "التالي " + UI.next });
        const fsBtn = h("button", { class: "icon-btn", type: "button", "aria-label": "ملء الشاشة", onclick: () => stage.requestFullscreen && stage.requestFullscreen(), html: UI.full });
        paint = () => {
          const s = slides[i];
          stage.className = "stage" + (s.cover ? " stage--cover" : "");
          stage.replaceChildren(h("h3", {}, s.t), h("ul", {}, (s.p || []).map((t) => h("li", {}, t))));
          count.textContent = `${i + 1} / ${slides.length}`;
          bar.style.width = ((i + 1) / slides.length) * 100 + "%";
          prevBtn.disabled = i === 0;
          nextBtn.disabled = i === slides.length - 1;
        };
        paint();
        return h("div", { class: "panel__body" },
          stage,
          h("div", { class: "deck__bar" }, bar),
          h("div", { class: "deck__controls" }, prevBtn, count, fsBtn, nextBtn)
        );
      },
    };
  }

  function staffView(m) {
    const taught = (m.teaches || []).map(courseById).filter(Boolean);
    return {
      title: "عضو هيئة التدريس",
      size: "md",
      body() {
        return h("div", { class: "panel__body" },
          h("div", { class: "profile" }, avatar(m, true), h("div", {}, h("h3", {}, m.name), h("p", {}, m.title))),
          h("h4", { class: "panel__sub" }, `المواد التي يدرّسها (${taught.length})`),
          h("div", { class: "rows" },
            taught.map((c) =>
              h("div", { class: "row" },
                h("span", { class: "row__ico", html: icon(c.icon) }),
                h("div", { class: "row__text" }, h("strong", {}, c.title), h("small", {}, c.desc)),
                h("div", { class: "row__actions" },
                  h("button", { class: "btn btn--primary btn--xs", type: "button", onclick: () => go(materialsView(c)) }, "الملفات والسلايد")
                )
              )
            )
          )
        );
      },
    };
  }

  /* ---------- page parts ---------- */
  function teacherChip(m) {
    return h("button", { class: "teacher-chip", type: "button", onclick: () => go(staffView(m)) }, avatar(m), m.name);
  }

  function courseCard(c, compact) {
    const teachers = teachersOf[c.id] || [];
    return h("article", { class: "card course" },
      h("div", { class: "course__thumb" }, h("span", { class: "thumb-ico", html: icon(c.icon) })),
      h("div", { class: "course__body" },
        h("h3", {}, c.title),
        compact && !c.hours ? null : h("p", {}, c.desc),
        c.hours ? h("div", { class: "meta" }, h("span", { class: "time", html: UI.clock + " " + c.hours + " ساعات" })) : null,
        teachers.length ? h("div", { class: "teachers" }, teachers.map(teacherChip)) : null,
        h("div", { class: "counts" },
          h("span", { html: UI.file.replace('width="18" height="18"', 'width="14" height="14"') + ` ${c.files.length} ملفات` }),
          h("span", { html: UI.slides.replace('width="18" height="18"', 'width="14" height="14"') + ` ${c.slides.length} سلايد` })
        ),
        progressBar(c),
        h("button", { class: "btn btn--outline btn--xs course__btn", type: "button", onclick: () => go(materialsView(c)) }, lockedFor(c) ? "غير متاح لتخصصك" : "الملفات والسلايد")
      )
    );
  }

  function memberCard(m) {
    const n = (m.teaches || []).length;
    return h("button", { class: "card member", type: "button", onclick: () => go(staffView(m)) },
      avatar(m, true),
      h("div", {}, h("h3", {}, m.name), h("small", {}, m.title), h("p", {}, `يدرّس ${n} ${n === 1 ? "مادة" : "مواد"} — اضغط للتفاصيل`))
    );
  }

  /* ---------- catalog page (all courses) ---------- */
  function renderCatalog() {
    const grid = document.getElementById("catalogGrid");
    const chips = document.getElementById("chips");
    const search = document.getElementById("q");
    const levelSel = document.getElementById("level");
    const count = document.getElementById("resultCount");
    if (!grid) return;

    const groups = Object.values(allPages).filter((p) => p.courses && p.courses.length).map((p) => p.label);
    const hue = (cat) => [215, 265, 175, 200, 285, 30][groups.indexOf(cat) % 6];
    let cat = "الكل";

    // sidebar: user + totals
    let user = null;
    try { user = JSON.parse(localStorage.getItem("ahlia_user")); } catch (e) {}
    const roles = { year1: "طالب بالسنة الأولى", year2: "طالب بالسنة الثانية", cs: "طالب علوم الحاسب", ai: "طالب الذكاء الاصطناعي", is: "طالب نظم المعلومات" };
    const set = (sel, fn) => document.querySelectorAll(sel).forEach(fn);
    if (user) {
      set("[data-user-initial]", (e) => (e.textContent = initial(user.name)));
      set("[data-user-role]", (e) => (e.textContent = roles[user.major] || "طالب بكلية الحاسبات"));
    }
    set("[data-total-courses]", (e) => (e.textContent = courses.length));
    set("[data-total-files]", (e) => (e.textContent = courses.reduce((n, c) => n + c.files.length, 0)));
    set("[data-total-slides]", (e) => (e.textContent = courses.reduce((n, c) => n + c.slides.length, 0)));

    function card(c) {
      return h("article", { class: "card ccard" },
        h("div", { class: "ccard__thumb", style: `--h:${hue(c.category)}` },
          h("span", { class: "tag" }, c.category),
          h("span", { class: "thumb-ico", html: icon(c.icon) })
        ),
        h("div", { class: "ccard__body" },
          h("h3", {}, c.title),
          h("p", {}, c.desc),
          h("div", { class: "ccard__meta" },
            h("span", { html: UI.clock + " " + (c.hours ? c.hours + " ساعات" : c.term || "") }),
            h("span", { class: "level" }, c.level || "مبتدئ")
          ),
          progressBar(c),
          h("button", { class: "btn btn--primary btn--sm btn--block" + (lockedFor(c) ? " is-locked" : ""), type: "button", onclick: () => go(materialsView(c)) }, lockedFor(c) ? "غير متاح لتخصصك" : "بدء الكورس")
        )
      );
    }

    function paint() {
      const q = search.value.trim().toLowerCase();
      const lvl = levelSel.value;
      const list = courses.filter((c) => {
        if (cat !== "الكل" && c.category !== cat) return false;
        if (lvl && c.level !== lvl) return false;
        if (!q) return true;
        return (c.title + " " + c.desc + " " + c.category).toLowerCase().includes(q);
      });
      chips.replaceChildren(
        ...["الكل"].concat(groups).map((g) =>
          h("button", { class: "chip", type: "button", "aria-pressed": String(g === cat), onclick: () => { cat = g; paint(); } }, g)
        )
      );
      grid.replaceChildren(
        ...(list.length ? list.map(card) : [h("p", { class: "empty" }, "لا توجد كورسات مطابقة لبحثك")])
      );
      count.textContent = `عرض ${list.length} من ${courses.length} كورس`;
    }
    search.addEventListener("input", paint);
    levelSel.addEventListener("change", paint);
    paint();
  }

  /* ---------- staff page (doctors + assistants, each with their subjects) ---------- */
  function renderStaffPage() {
    const list = document.getElementById("staffList");
    const chips = document.getElementById("chips");
    const search = document.getElementById("q");
    const count = document.getElementById("resultCount");
    if (!list) return;
    let user = null;
    try { user = JSON.parse(localStorage.getItem("ahlia_user")); } catch (e) {}
    let type = "all";
    const TYPES = [["all", "الكل"], ["doctor", "الدكاترة"], ["assistant", "المعيدون"]];

    const subject = (c) => {
      const inner = [h("span", {}, c.title), h("small", {}, c.category)];
      return user && !lockedFor(c)
        ? h("button", { class: "subject", type: "button", title: "فتح الملفات والسلايد", onclick: () => go(materialsView(c)) }, inner)
        : h("span", { class: "subject" }, inner);
    };
    const person = (m) => {
      const taught = (m.teaches || []).map(courseById).filter(Boolean);
      return h("article", { class: "card staffcard" },
        avatar(m, true),
        h("h3", {}, m.name),
        h("span", { class: "staffcard__title" }, m.title),
        h("h4", { class: "staffcard__sub" }, `المواد التي يدرّسها (${taught.length})`),
        h("div", { class: "subjects" }, taught.map(subject))
      );
    };
    const section = (title, items) =>
      items.length
        ? h("section", { class: "staff-sec" },
            h("div", { class: "section__head" }, h("h2", {}, title), h("p", {}, `${items.length} ${items.length === 1 ? "عضو" : "أعضاء"}`)),
            h("div", { class: "staffpage__grid" }, items.map(person)))
        : null;

    function paint() {
      const q = search.value.trim().toLowerCase();
      const match = (m) => {
        if (!q) return true;
        const subs = (m.teaches || []).map(courseById).filter(Boolean).map((c) => c.title).join(" ");
        return (m.name + " " + m.title + " " + subs).toLowerCase().includes(q);
      };
      const docs = allStaff.filter((m) => m.type === "doctor" && match(m));
      const asts = allStaff.filter((m) => m.type === "assistant" && match(m));
      chips.replaceChildren(
        ...TYPES.map(([id, label]) => h("button", { class: "chip", type: "button", "aria-pressed": String(type === id), onclick: () => { type = id; paint(); } }, label))
      );
      const shown = (type !== "assistant" ? docs.length : 0) + (type !== "doctor" ? asts.length : 0);
      list.replaceChildren(
        ...[type !== "assistant" ? section("الدكاترة", docs) : null, type !== "doctor" ? section("المعيدون", asts) : null].filter(Boolean),
        shown ? null : h("p", { class: "empty" }, "لا توجد نتائج مطابقة لبحثك")
      );
      count.textContent = `عرض ${shown} من ${allStaff.length} عضو`;
    }
    search.addEventListener("input", paint);
    paint();
  }

  if (isStaffPage) {
    renderStaffPage();
    return;
  }

  /* shared API for mylearning.js / paths.js */
  window.AhliaUI = { go, materialsView, courseById, allCourses, icon, h, UI, lockedFor, refreshProgress };
  if (isUtil) return;

  if (isAll) {
    renderCatalog();
    return;
  }

  /* ---------- major / year pages ---------- */
  function termGroup(t) {
    const n = t.courses.length;
    return h("div", { class: "term" },
      h("div", { class: "term__head" }, h("h3", {}, t.title), h("span", { class: "term__count" }, `${n} ${n === 1 ? "مادة" : "مواد"}`)),
      h("div", { class: "courses" }, t.courses.map((c) => courseCard(c, true)))
    );
  }
  const grid = document.getElementById("courses");
  if (grid) {
    if (page.terms) {
      grid.className = "terms";
      grid.replaceChildren(...page.terms.map(termGroup));
    } else {
      grid.replaceChildren(...courses.map((c) => courseCard(c)));
    }
  }
  const staffGrid = document.getElementById("staffGrid");
  if (staffGrid) staffGrid.replaceChildren(...staff.map(memberCard));
})();
