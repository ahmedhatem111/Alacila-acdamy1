/* شريط تنقل سفلي للتلفون (زي التطبيقات) — بيظهر للمستخدم المسجّل بس على الشاشات الصغيرة */
(() => {
  const user = (() => { try { return JSON.parse(localStorage.getItem("ahlia_user")); } catch (e) { return null; } })();
  const cur = location.pathname.split("/").pop() || "index.html";
  if (!user || /^(login|certificate)\.html$/.test(cur)) return;
  const S = 'viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const TABS = [
    ["welcome.html", "الرئيسية", `<svg ${S}><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>`, ["welcome.html", "index.html", ""]],
    ["courses.html", "الكورسات", `<svg ${S}><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19V5M9 7h6"/></svg>`, ["courses.html", "course.html", "year1.html", "year2.html", "cs.html", "ai.html", "is.html", "staff.html"]],
    ["schedule.html", "جدولي", `<svg ${S}><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>`, ["schedule.html"]],
    ["teams.html", "زملاء", `<svg ${S}><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M17 4a4 4 0 010 7M22 21c0-3-1.5-5-4-5.7"/></svg>`, ["teams.html"]],
  ];
  document.addEventListener("DOMContentLoaded", () => {
    const nav = document.createElement("nav");
    nav.className = "tabbar";
    nav.setAttribute("aria-label", "التنقل السريع");
    nav.innerHTML = TABS.map(([href, label, icon, pages]) =>
      `<a href="${href}"${pages.includes(cur) ? ' class="on" aria-current="page"' : ""}>${icon}<span>${label}</span></a>`).join("") +
      `<button type="button" id="tabMore">${`<svg ${S}><path d="M4 6h16M4 12h16M4 18h16"/></svg>`}<span>المزيد</span></button>`;
    document.body.append(nav);
    document.body.classList.add("has-tabbar");
    document.getElementById("tabMore").addEventListener("click", () => document.getElementById("burger")?.click());
  });
})();
