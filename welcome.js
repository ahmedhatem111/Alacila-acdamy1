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
    $$("[data-stat]").forEach((e) => (e.textContent = stat[e.dataset.stat] || 0));

    const sub = (key, text) => $$(`[data-sub="${key}"]`).forEach((e) => (e.textContent = text));
    const termsText = (p) => `${p.courses.length} مادة • ${p.terms.length} ${p.terms.length === 2 ? "ترمان" : "ترمات"}`;
    if (pages.year1) sub("year1", termsText(pages.year1));
    if (pages.year2) sub("year2", termsText(pages.year2));
    sub("courses", `${stat.courses} مادة`);
    sub("staff", `${stat.staff} دكتور ومعيد`);

    // "your major" card -> opens the user's own major page
    const mine = document.getElementById("myMajor");
    if (mine && pages[user.major] && !/^year/.test(user.major)) { // year students already see their year card
        mine.hidden = false;
        mine.href = user.major + ".html";
        mine.querySelector("[data-major-title]").textContent = labels[user.major];
        sub("major", termsText(pages[user.major]));
    }

    const userId = String(user.id || "");
    const courseKey = /^[\w.-]{1,80}$/;
    const readLocal = (key, fallback) => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value == null ? fallback : value;
        } catch (e) { return fallback; }
    };
    const recent = userId ? readLocal("ahlia_recent_course:" + encodeURIComponent(userId), null) : null;
    let saved = userId ? readLocal("ahlia_saved_courses:" + encodeURIComponent(userId), []) : [];
    if (!Array.isArray(saved)) saved = [];
    saved = saved.filter((item) => item && courseKey.test(item.id));
    const validRecent = recent && courseKey.test(recent.id) ? recent : null;
    if (!validRecent && !saved.length) return;

    const hub = document.createElement("section");
    hub.className = "section learning-hub";
    hub.setAttribute("aria-label", "مساحة التعلّم");
    hub.innerHTML = '<div class="section__head"><h2>كمّل رحلتك</h2></div><div class="learning-hub__grid"><a class="card learning-resume" hidden><span class="learning-eyebrow">آخر كورس</span><strong data-resume-title></strong><div class="learning-progress" role="progressbar" aria-label="نسبة إكمال الكورس"><i></i></div><span class="learning-progress__label" data-resume-progress></span><span class="learning-cta">متابعة الكورس<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6"></path></svg></span></a><section class="card learning-saved" aria-labelledby="savedHeading" hidden><header><h3 id="savedHeading">قائمة الحفظ</h3><span data-saved-count></span></header><div class="saved-course-list"></div></section></div>';

    const resumeLink = hub.querySelector(".learning-resume");
    if (validRecent) {
        const progress = Math.max(0, Math.min(100, Number(validRecent.percent) || 0));
        resumeLink.hidden = false;
        resumeLink.href = "course.html?id=" + encodeURIComponent(validRecent.id);
        resumeLink.querySelector("[data-resume-title]").textContent = validRecent.title || "كورس";
        resumeLink.querySelector("[data-resume-progress]").textContent = progress + "% مكتمل";
        resumeLink.querySelector(".learning-progress").setAttribute("aria-valuenow", String(progress));
        resumeLink.querySelector(".learning-progress i").style.width = progress + "%";
    }

    const savedPanel = hub.querySelector(".learning-saved");
    const savedList = hub.querySelector(".saved-course-list");
    const savedCount = hub.querySelector("[data-saved-count]");

    function renderSaved() {
        savedList.replaceChildren();
        savedCount.textContent = saved.length;
        savedPanel.hidden = saved.length === 0;
        saved.forEach((course) => {
            const row = document.createElement("div");
            row.className = "saved-course-row";
            const link = document.createElement("a");
            link.href = "course.html?id=" + encodeURIComponent(course.id);
            link.textContent = course.title || "كورس محفوظ";
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "saved-course-remove";
            remove.setAttribute("aria-label", "إزالة " + (course.title || "الكورس") + " من قائمة الحفظ");
            remove.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"></path></svg>';
            remove.addEventListener("click", () => {
                saved = saved.filter((item) => item.id !== course.id);
                try { localStorage.setItem("ahlia_saved_courses:" + encodeURIComponent(userId), JSON.stringify(saved)); } catch (e) {}
                renderSaved();
                if (!validRecent && !saved.length) hub.remove();
            });
            row.append(link, remove);
            savedList.append(row);
        });
    }
    renderSaved();

    const start = document.getElementById("start");
    if (start) start.before(hub);
})();