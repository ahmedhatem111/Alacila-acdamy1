/* Renders the team page from data.js (AHLIA_DATA.team) */
(() => {
  const grid = document.getElementById("team");
  const nav = document.getElementById("teamNav");
  const teams = (window.AHLIA_DATA && window.AHLIA_DATA.teams) || [];
  if (!grid) return;

  const S = 'viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const TEAM_ICONS = {
    review: `<svg ${S}><path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`,
    design: `<svg ${S}><path d="M12 19l7-7 3 3-7 7zM18 13l-1.500-7.500L2 2l3.500 14.500L13 18zM2 2l7.600 7.600"/><circle cx="11" cy="11" r="2"/></svg>`,
    code: `<svg ${S}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>`,
    dev: `<svg ${S}><circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 00.300 1.800l.1.100a2 2 0 11-2.800 2.800l-.1-.1a1.700 1.700 0 00-1.800-.3 1.700 1.700 0 00-1 1.500V21a2 2 0 11-4 0v-.1a1.700 1.700 0 00-1.100-1.500 1.700 1.700 0 00-1.800.3l-.1.100a2 2 0 11-2.800-2.800l.1-.1a1.700 1.700 0 00.3-1.800 1.700 1.700 0 00-1.500-1H3a2 2 0 110-4h.1a1.700 1.700 0 001.500-1.100 1.700 1.700 0 00-.3-1.800l-.1-.1a2 2 0 112.800-2.800l.1.100a1.700 1.700 0 001.800.3H9a1.700 1.700 0 001-1.500V3a2 2 0 114 0v.1a1.700 1.700 0 001 1.500 1.700 1.700 0 001.800-.3l.1-.1a2 2 0 112.800 2.800l-.1.100a1.700 1.700 0 00-.3 1.800V9a1.700 1.700 0 001.500 1H21a2 2 0 110 4h-.1a1.700 1.700 0 00-1.500 1z"/></svg>`,
    mgmt: `<svg ${S}><path d="M4 22V4M4 4h13l-2 4 2 4H4"/></svg>`,
  };

  const LINKEDIN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M3 3h18v18H3zM8 10H5.500v8.500H8zM6.800 6.200a1.500 1.500 0 100 3 1.500 1.500 0 000-3zM18.500 18.500v-4.800c0-2.300-1.200-3.800-3.200-3.800-1.100 0-1.800.6-2.200 1.200V10H10.600v8.500h2.500v-4.600c0-1.200.6-1.900 1.500-1.900s1.400.7 1.400 1.900v4.600z" fill-rule="evenodd"/></svg>';
  const FACEBOOK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M13.500 22v-8.200h2.800l.5-3.300h-3.300V8.400c0-.9.400-1.700 1.800-1.700h1.600V3.800c-.3 0-1.300-.2-2.500-.2-2.600 0-4.200 1.500-4.200 4.300v2.600H7.400v3.300h2.800V22z"/></svg>';

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    kids.flat().forEach((c) => c != null && el.append(c.nodeType ? c : document.createTextNode(c)));
    return el;
  }

  const initial = (name) => (name.replace(/^د\.?\s*/, "").trim()[0] || "؟");

  function photo(p) {
    const wrap = h("div", { class: "person__photo" });
    const fallback = () => wrap.replaceChildren(h("span", { class: "ph", "aria-hidden": "true" }, initial(p.name)));
    if (!p.photo) { fallback(); return wrap; }
    const img = h("img", { src: p.photo, alt: p.name, loading: "lazy" });
    img.addEventListener("error", fallback);
    wrap.append(img);
    return wrap;
  }

  function pill(label, svg, url, name) {
    const on = !!(url && url.trim());
    return h("a", {
      class: "social-pill",
      href: on ? url : null,
      target: on ? "_blank" : null,
      rel: on ? "noopener noreferrer" : null,
      "aria-label": `${label} — ${name}`,
      "aria-disabled": on ? null : "true",
      title: on ? null : "لم يتم إضافة الحساب بعد",
      html: svg + " " + label,
    });
  }

  function personCard(p) {
    return h("article", { class: "card person" },
      photo(p),
      h("h3", {}, p.name),
      h("span", { class: "person__role" }, p.role),
      h("div", { class: "person__links" }, pill("LinkedIn", LINKEDIN, p.linkedin, p.name), pill("Facebook", FACEBOOK, p.facebook, p.name))
    );
  }

  function teamSection(tm) {
    const n = (tm.members || []).length;
    return h("section", { class: "team-group", id: "team-" + tm.id, "aria-labelledby": "h-" + tm.id },
      h("div", { class: "team-group__head" },
        h("span", { class: "team-group__icon", html: TEAM_ICONS[tm.icon] || TEAM_ICONS.dev }),
        h("div", {}, h("h2", { id: "h-" + tm.id }, tm.title), tm.desc ? h("p", {}, tm.desc) : null),
        h("span", { class: "team-group__count" }, n + (n === 1 ? " عضو" : " أعضاء"))
      ),
      h("div", { class: "team-group__list" }, (tm.members || []).map(personCard))
    );
  }

  grid.replaceChildren(...teams.map(teamSection));
  if (nav) {
    nav.replaceChildren(
      ...teams.map((tm) => h("a", { class: "chip", href: "#team-" + tm.id, html: (TEAM_ICONS[tm.icon] || "").replace('width="26" height="26"', 'width="16" height="16"') + " " + tm.title }))
    );
  }
})();
