(() => {
  "use strict";
  const D = (window.AHLIA_DATA || {}).movies || { sections: [], items: [] };
  const $ = (id) => document.getElementById(id);
  const el = (t, c, txt) => { const n = document.createElement(t); if (c) n.className = c; if (txt != null) n.textContent = txt; return n; };
  const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
  const cats = [["all", "الكل"]].concat([...new Map(D.items.map((i) => [i.category, i.categoryLabel])).entries()]);
  let cat = "all", q = "";

  /* details dialog (same classes as the rest of the site) */
  const box = el("div", "modal__box panel panel--md");
  const modal = el("div", "modal"); modal.hidden = true;
  modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true");
  const bd = el("div", "modal__backdrop"); modal.append(bd, box); document.body.append(modal);
  const close = () => { modal.hidden = true; document.body.classList.remove("modal-open"); };
  bd.onclick = close; addEventListener("keydown", (e) => e.key === "Escape" && close());

  function open(m) {
    box.replaceChildren();
    const head = el("div", "panel__head"); head.append(el("h2", "", m.title));
    const x = el("button", "icon-btn", "✕"); x.type = "button"; x.setAttribute("aria-label", "إغلاق"); x.onclick = close; head.append(x);
    const top = el("div", "movie-detail__top"), ph = el("div", "movie-detail__poster");
    if (m.poster) { const im = el("img"); im.src = m.poster; im.alt = m.title; im.loading = "lazy"; ph.append(im); }
    const info = el("div"), meta = el("div", "movie-meta");
    [m.kind, m.year, m.duration, m.categoryLabel].forEach((v) => v && meta.append(el("span", "", v)));
    const rate = el("div", "movie-rate"); rate.append(el("b", "", String(m.rating)), el("span", "", stars(m.rating)), el("small", "", "(" + m.ratingCount + " تقييم)"));
    const dir = el("p", "movie-dir"); dir.innerHTML = "<b>المخرج:</b> "; dir.append(m.director + " • " + m.language);
    const tags = el("ul", "chips"); (m.tags || []).forEach((t) => tags.append(el("li", "", t)));
    info.append(meta, rate, dir, tags); top.append(ph, info);
    const txt = el("p", "movie-text", m.details || m.desc);
    const act = el("div", "movie-actions");
    if (m.video) { const a = el("a", "btn btn--primary", "شاهد"); a.href = m.video; a.target = "_blank"; a.rel = "noopener"; act.append(a); }
    else act.append(el("small", "movie-dir", "رابط المشاهدة غير مضاف بعد. أضف رابطًا مرخّصًا في حقل video داخل data.js."));
    const body = el("div", "panel__body"); body.append(top, txt, act);
    box.append(head, body); modal.hidden = false; document.body.classList.add("modal-open"); x.focus();
  }

  function card(m) {
    const b = el("button", "card mcard"); b.type = "button"; b.onclick = () => open(m);
    const p = el("div", "mcard__poster");
    if (m.poster) { const im = el("img"); im.src = m.poster; im.alt = ""; im.loading = "lazy"; im.onerror = () => im.remove(); p.append(im); }
    p.append(el("span", "mcard__year", String(m.year)));
    const body = el("div", "mcard__body"); body.append(el("h3", "", m.title), el("small", "", m.categoryLabel + " • ★ " + m.rating));
    b.append(p, body); return b;
  }

  function render() {
    const root = $("mvSections"); root.replaceChildren(); let n = 0;
    D.sections.forEach((s) => {
      const list = D.items.filter((i) => i.section === s.id && (cat === "all" || i.category === cat) &&
        (!q || [i.title, i.desc, i.categoryLabel, (i.tags || []).join(" ")].join(" ").toLowerCase().includes(q)));
      if (!list.length) return; n += list.length;
      const sec = el("section", "section"), hd = el("div", "section__head"); hd.append(el("h2", "", s.title));
      const g = el("div", "movies-grid"); list.forEach((m) => g.append(card(m))); sec.append(hd, g); root.append(sec);
    });
    $("mvEmpty").hidden = n > 0;
  }

  cats.forEach(([k, label]) => {
    const c = el("button", "chip", label); c.type = "button"; c.dataset.k = k;
    c.setAttribute("aria-pressed", k === "all" ? "true" : "false");
    c.onclick = () => { cat = k; $("mvCats").querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === c ? "true" : "false")); render(); };
    $("mvCats").append(c);
  });
  $("mvSearch").addEventListener("input", (e) => { q = e.target.value.trim().toLowerCase(); render(); });
  render();
})();
