(() => {
  "use strict";
  const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  const $ = (id) => document.getElementById(id);
  const el = (t, c, x) => { const n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; };
  let user = null; try { user = JSON.parse(localStorage.getItem("ahlia_user")); } catch (e) {}
  const api = (m, u, b) => window.AhliaStore.api(m, u, b);   // المواعيد محفوظة في قاعدة البيانات
  const todayIdx = () => (new Date().getDay() + 1) % 7;          // JS: Sun=0 -> our Sun=1, Sat=0
  let items = [];

  DAYS.forEach((d, i) => { const o = el("option", "", d); o.value = i; $("fDay").append(o); });
  $("fDay").value = todayIdx();
  $("todayName").textContent = "اليوم: " + DAYS[todayIdx()];
  const say = (t, ok) => { $("fMsg").textContent = t; $("fMsg").className = "form-msg " + (ok ? "ok" : "bad"); };

  function row(it, withDay) {
    const c = el("div", "card"); c.style.cssText = "padding:12px 16px;display:flex;gap:12px;align-items:center;justify-content:space-between";
    const t = el("div"); t.append(el("b", "", it.time + "  " + it.title), el("br"), el("small", "movie-dir", it.kind + (it.place ? " • " + it.place : "") + (withDay ? " • " + DAYS[it.day] : "")));
    const b = el("button", "btn btn--outline btn--sm", "حذف"); b.type = "button";
    b.onclick = async () => {
      try { await api("DELETE", "/api/schedule/" + it.id); items = items.filter((x) => x.id !== it.id); render(); }
      catch (e) { say(e.message, false); }
    };
    c.append(t, b); return c;
  }
  const byTime = (a, b) => a.time.localeCompare(b.time);

  function render() {
    const td = $("today"); td.replaceChildren();
    const mine = items.filter((i) => i.day === todayIdx()).sort(byTime);
    if (!mine.length) td.append(el("p", "movie-dir", "مفيش مواعيد النهارده. أضف أول موعد من النموذج تحت."));
    mine.forEach((i) => td.append(row(i)));
    const wk = $("week"); wk.replaceChildren();
    DAYS.forEach((d, di) => {
      const list = items.filter((i) => i.day === di).sort(byTime); if (!list.length) return;
      const sec = el("div", "term"), hd = el("div", "term__head"); hd.append(el("h3", "", d), el("span", "term__count", list.length + " موعد"));
      const g = el("div", "courses"); list.forEach((i) => g.append(row(i))); sec.append(hd, g); wk.append(sec);
    });
    if (!items.length) wk.append(el("p", "movie-dir", "الجدول فاضي."));
  }

  $("fAdd").onclick = async () => {
    const title = $("fTitle").value.trim();
    if (title.length < 2) return say("اكتب عنوان الموعد", false);
    try {
      const it = await api("POST", "/api/schedule", { title, kind: $("fKind").value, day: +$("fDay").value, time: $("fTime").value || "09:00", place: $("fPlace").value.trim() });
      items.push(it); $("fTitle").value = ""; say("تمت الإضافة", true); render();
    } catch (e) { say(e.message, false); }
  };

  /* reminders: 15 min before, only while this page is open */
  $("fNotify").onclick = async () => {
    if (!("Notification" in window)) return say("المتصفح لا يدعم التنبيهات", false);
    const p = await Notification.requestPermission();
    say(p === "granted" ? "التنبيهات مفعّلة طالما الصفحة مفتوحة" : "لم يتم السماح بالتنبيهات", p === "granted");
  };
  const fired = new Set();
  setInterval(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const n = new Date(), now = n.getHours() * 60 + n.getMinutes();
    items.filter((i) => i.day === todayIdx()).forEach((i) => {
      const [h, m] = i.time.split(":").map(Number), diff = h * 60 + m - now, k = i.id + ":" + n.toDateString();
      if (diff <= 15 && diff >= 0 && !fired.has(k)) { fired.add(k); new Notification(i.kind + " بعد " + diff + " دقيقة", { body: i.title + (i.place ? " - " + i.place : "") }); }
    });
  }, 30000);
  api("GET", "/api/schedule").then((list) => { items = list; render(); }).catch((e) => { render(); say(e.message, false); });
})();
