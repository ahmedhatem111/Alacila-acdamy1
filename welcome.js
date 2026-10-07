/* Fills the welcome page: user name, role, site stats and quick-link counts */
(() => {
  let user = null;
  try { user = JSON.parse(localStorage.getItem("ahlia_user")); } catch (e) {}
  if (!user) return; // page guard already redirects to the login

  const D = window.AHLIA_DATA || { pages: {}, staff: [] };
  const pages = D.pages || {};
  const $$ = (s) => document.querySelectorAll(s);
  const initial = (n) => (n.replace(/^(د|م|م\.م)\.\s*/, "").trim()[0] || "أ");

  $$("[data-user-initial]").forEach((e) => (e.textContent = initial(user.name)));

  const labels = { year1: "السنة الأولى", year2: "السنة الثانية", cs: "علوم الحاسب", ai: "الذكاء الاصطناعي", is: "نظم المعلومات" };
  const roles = { year1: "طالب بالسنة الأولى", year2: "طالب بالسنة الثانية", cs: "طالب علوم الحاسب", ai: "طالب الذكاء الاصطناعي", is: "طالب نظم المعلومات" };
  $$("[data-user-role]").forEach((e) => (e.textContent = roles[user.major] || ""));

  const all = Object.values(pages).flatMap((p) => p.courses || []);
  const stat = {
    courses: all.length,
    files: all.reduce((n, c) => n + c.files.length, 0),
    slides: all.reduce((n, c) => n + c.slides.length, 0),
    staff: (D.staff || []).length,
  };
  $$("[data-stat]").forEach((e) => (e.textContent = stat[e.dataset.stat] ?? 0));

  const sub = (key, text) => $$(`[data-sub="${key}"]`).forEach((e) => (e.textContent = text));
  const termsText = (p) => `${p.courses.length} مادة • ${p.terms.length} ${p.terms.length === 2 ? "ترمان" : "ترمات"}`;
  if (pages.year1) sub("year1", termsText(pages.year1));
  if (pages.year2) sub("year2", termsText(pages.year2));
  sub("courses", `${stat.courses} مادة`);
  sub("staff", `${stat.staff} دكتور ومعيد`);

  // "your major" card -> opens the user's own major page
  const mine = document.getElementById("myMajor");
  if (mine && pages[user.major] && !/^year/.test(user.major)) {  // year students already see their year card
    mine.hidden = false;
    mine.href = user.major + ".html";
    mine.querySelector("[data-major-title]").textContent = labels[user.major];
    sub("major", termsText(pages[user.major]));
  }
})();
