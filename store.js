/* AhliaStore — جسر بين صفحات الموقع والسيرفر.
   - الحساب والتقدّم محفوظين في قاعدة البيانات (السيرفر هو المرجع).
   - نسخة في المتصفح (localStorage) للسرعة فقط، وبتتحدّث من السيرفر عند فتح أي صفحة. */
(() => {
  "use strict";
  if (window.AhliaStore) return;

  const KEY_USER = "ahlia_user", KEY_STATE = "ahlia_state";
  const LABEL = { year1: "السنة الأولى", year2: "السنة الثانية", cs: "علوم الحاسب", ai: "الذكاء الاصطناعي", is: "نظم المعلومات" };
  const PUBLIC_PAGES = /^(|index\.html|login\.html|team\.html)$/;

  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const drop = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
  const getUser = () => read(KEY_USER, null);
  const page = () => location.pathname.split("/").pop();

  let state = read(KEY_STATE, null);
  const u0 = getUser();
  if (!state || !u0 || state.uid !== u0.id) state = { uid: u0 ? u0.id : null, enrolled: [], done: {} };
  const persist = () => write(KEY_STATE, state);

  const toast = (m) => (window.AhliaToast ? window.AhliaToast(m) : null);

  /* طلب للسيرفر (بيضيف الهيدر المطلوب للحماية من CSRF) */
  async function api(method, url, body) {
    if (window.AhliaBackend) {   // وضع الاستضافة الثابتة (GitHub Pages) -> Supabase
      try { return await window.AhliaBackend.request(method, url, body); }
      catch (e) { if (e.status === 401 && !/^\/api\/(login|register)/.test(url)) expired(); throw e; }
    }
    const opt = { method, credentials: "same-origin", headers: { "X-Requested-With": "ahlia" } };
    if (body !== undefined) { opt.headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
    let res;
    try { res = await fetch(url, opt); } catch (e) { const er = new Error("تعذّر الاتصال بالسيرفر"); er.status = 0; throw er; }
    let data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      const er = new Error((data && data.error) || "حصل خطأ، جرّب تاني");
      er.status = res.status;
      if (res.status === 401 && !/^\/api\/(login|register)/.test(url)) expired();
      throw er;
    }
    return data;
  }

  function setSession(p) {
    write(KEY_USER, p.user);
    state = { uid: p.user.id, enrolled: p.state.enrolled || [], done: p.state.done || {} };
    persist();
  }
  function clearLocal() {
    try { if (window.caches) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))); } catch (e) {}
    drop("ahlia_sb"); drop(KEY_USER); drop(KEY_STATE); drop("ahlia_accounts"); state = { uid: null, enrolled: [], done: {} }; }

  /* الجلسة انتهت على السيرفر */
  function expired() {
    const had = !!getUser();
    clearLocal();
    if (!PUBLIC_PAGES.test(page())) location.replace("login.html?next=" + encodeURIComponent(page() + location.search));
    else if (had) location.reload();
  }

  async function logout(redirect = true) {
    try { await api("POST", "/api/logout"); } catch (e) {}
    clearLocal();
    if (redirect) location.href = "index.html";
  }

  const canAccess = (group, user) => {
    user = user || getUser();
    if (!LABEL[group]) return true;
    if (!user) return false;
    return (user.access || [user.major]).includes(group);
  };
  const who = (group) => "طلاب " + (LABEL[group] || "تخصص آخر");

  const isEnrolled = (id) => state.enrolled.includes(id);
  const doneOf = (id) => (state.done[id] || []).slice();
  const percent = (course) => {
    const topics = (course && course.topics) || [];
    if (!topics.length) return 0;
    const done = new Set(state.done[course.id] || []);
    let n = 0;
    topics.forEach((_, i) => { if (done.has(i)) n++; });
    return Math.round((n / topics.length) * 100);
  };
  const failed = () => toast("تعذّر الحفظ على السيرفر، تأكد من الاتصال");

  function setEnrolled(id, on) {
    state.enrolled = state.enrolled.filter((x) => x !== id);
    if (on) state.enrolled.push(id);
    persist();
    api("PUT", "/api/enroll", { course: id, on: !!on }).catch(failed);
  }
  function toggleLecture(id, i, on) {
    const set = new Set(state.done[id] || []);
    on ? set.add(i) : set.delete(i);
    state.done[id] = [...set].sort((a, b) => a - b);
    persist();
    api("PUT", "/api/lecture", { course: id, index: i, done: !!on }).catch(failed);
  }

  /* تحديث من السيرفر عند فتح الصفحة (لو الحساب مفتوح من جهاز تاني) */
  async function refresh() {
    if (!getUser()) return;
    try {
      const before = JSON.stringify([state.enrolled, state.done]);
      const p = await api("GET", "/api/me");
      setSession(p);
      if (before !== JSON.stringify([state.enrolled, state.done])) {
        const tag = "ahlia_rl:" + location.pathname;
        if (!sessionStorage.getItem(tag)) { sessionStorage.setItem(tag, "1"); location.reload(); }
      } else {
        try { sessionStorage.removeItem("ahlia_rl:" + location.pathname); } catch (e) {}
      }
    } catch (e) { /* 401 اتعالجت في api() — وأي خطأ شبكة نتجاهله */ }
  }

  window.AhliaStore = { LABEL, api, getUser, setSession, clearLocal, logout, canAccess, who, isEnrolled, setEnrolled, doneOf, toggleLecture, percent, refresh };

  document.addEventListener("DOMContentLoaded", () => {
    refresh();
    /* السيرفر حوّلك لأنك مش من أصحاب الصفحة */
    const denied = new URLSearchParams(location.search).get("denied");
    if (denied && LABEL[denied]) {
      const u = getUser();
      toast(`هذه الصفحة خاصة بـ ${who(denied)}` + (u && LABEL[u.major] ? `، وأنت مسجل في: ${LABEL[u.major]}.` : "."));
      history.replaceState(null, "", location.pathname);
    }
  });
})();
