/* backend.js — يخلّي الموقع يشتغل على استضافة ثابتة (GitHub Pages) بدون سيرفر.
   بينفّذ نفس مسارات /api اللي بيستخدمها الموقع، لكن فوق Supabase (حسابات + قاعدة بيانات).
   بيشتغل بس لو config.js فيه supabaseUrl و supabaseKey. من غير كده الموقع بيكلّم سيرفر Flask. */
(() => {
  "use strict";
  const C = window.AHLIA_CONFIG || {};
  if (!C.supabaseUrl || !C.supabaseKey) return;

  const BASE = C.supabaseUrl.replace(/\/+$/, "");
  const KEY = C.supabaseKey;
  const SKEY = "ahlia_sb";
  const MAJORS = ["year1", "year2", "cs", "ai", "is"];
  const KINDS = ["محاضرة", "سكشن", "تسليم", "امتحان"];
  const access = (major) => [major];   // نفس قاعدة الوصول في app.py (access_for)

  const fail = (msg, status) => { const e = new Error(msg); e.status = status; return e; };
  const clean = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
  const nowSec = () => Math.floor(Date.now() / 1000);

  /* ---------- الجلسة ---------- */
  const getSess = () => { try { return JSON.parse(localStorage.getItem(SKEY)); } catch (e) { return null; } };
  const putSess = (s) => { try { s ? localStorage.setItem(SKEY, JSON.stringify(s)) : localStorage.removeItem(SKEY); } catch (e) {} };
  const toSess = (d) => ({
    access_token: d.access_token, refresh_token: d.refresh_token,
    expires_at: d.expires_at || nowSec() + (d.expires_in || 3600), user: d.user,
  });

  /* ---------- طلب خام ---------- */
  async function raw(path, { method = "GET", body, token, headers } = {}) {
    let res;
    try {
      res = await fetch(BASE + path, {
        method,
        headers: Object.assign({ apikey: KEY, "Content-Type": "application/json" },
          token ? { Authorization: "Bearer " + token } : {}, headers || {}),
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) { throw fail("تعذّر الاتصال بالسيرفر، تأكد من الإنترنت", 0); }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) {}
    return { res, data };
  }

  const authMsg = (d, status) => {
    const code = (d && (d.error_code || d.code)) || "";
    const msg = String((d && (d.msg || d.message || d.error_description || d.error)) || "");
    if (status === 429 || /rate_limit/.test(code)) return "محاولات كتير، استنى شوية وجرّب تاني";
    if (/already|exists/i.test(code + msg)) return "هذا البريد مسجل من قبل، سجّل دخولك";
    if (/invalid_credentials|Invalid login/i.test(code + msg)) return "البريد أو كلمة المرور غير صحيحة";
    if (/email_not_confirmed|not confirmed/i.test(code + msg)) return "لازم تأكد بريدك الإلكتروني الأول (افتح رسالة التأكيد)";
    if (/weak_password|at least/i.test(code + msg)) return "كلمة المرور ضعيفة، استخدم 8 أحرف على الأقل";
    if (/signup.*disabled|not allowed/i.test(code + msg)) return "التسجيل مقفول حاليًا";
    return "حصل خطأ، جرّب تاني";
  };

  /* توكن صالح (مع تجديد تلقائي) */
  async function token() {
    let s = getSess();
    if (!s) throw fail("سجّل دخولك أولاً", 401);
    if (s.expires_at - 60 > nowSec()) return s.access_token;
    const { res, data } = await raw("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: s.refresh_token } });
    if (!res.ok || !data || !data.access_token) { putSess(null); throw fail("انتهت الجلسة، سجّل دخولك من جديد", 401); }
    s = toSess(data); putSess(s);
    return s.access_token;
  }

  /* طلب على قاعدة البيانات (PostgREST) */
  async function rest(method, path, body, headers) {
    const t = await token();
    const { res, data } = await raw("/rest/v1/" + path, { method, body, token: t, headers });
    if (res.status === 401) { putSess(null); throw fail("انتهت الجلسة، سجّل دخولك من جديد", 401); }
    if (!res.ok) {
      const m = (data && data.message) || "";
      if (res.status === 429 || /limit/i.test(m)) throw fail("وصلت للحد الأقصى المسموح", 429);
      if (data && data.code === "23514") throw fail("بيانات غير صالحة", 400);
      throw fail(/لازم|الحد|10/.test(m) ? m : "تعذّر تنفيذ الطلب", res.status);
    }
    return data;
  }

  const uid = () => { const s = getSess(); if (!s) throw fail("سجّل دخولك أولاً", 401); return s.user.id; };
  const eq = (v) => "eq." + encodeURIComponent(v);

  /* ---------- الحساب ---------- */
  async function payload() {
    const t = await token();
    const u = await raw("/auth/v1/user", { token: t });
    if (!u.res.ok) { putSess(null); throw fail("انتهت الجلسة، سجّل دخولك من جديد", 401); }
    const id = u.data.id;
    const prof = await rest("GET", `profiles?id=${eq(id)}&select=name,major`);
    if (!prof || !prof[0]) throw fail("الحساب غير مكتمل، تواصل مع الإدارة", 403);
    const [en, lec] = await Promise.all([
      rest("GET", `enrollments?user_id=${eq(id)}&select=course_id&order=created_at`),
      rest("GET", `lecture_progress?user_id=${eq(id)}&select=course_id,lecture&order=lecture`),
    ]);
    const done = {};
    lec.forEach((r) => (done[r.course_id] = done[r.course_id] || []).push(r.lecture));
    const p = prof[0];
    return {
      ok: true,
      user: { id, name: p.name, email: u.data.email, major: p.major, access: access(p.major) },
      state: { enrolled: en.map((r) => r.course_id), done },
    };
  }

  async function login(email, password) {
    const { res, data } = await raw("/auth/v1/token?grant_type=password", { method: "POST", body: { email, password } });
    if (!res.ok || !data || !data.access_token) throw fail(authMsg(data, res.status), res.status === 429 ? 429 : 401);
    putSess(toSess(data));
    return payload();
  }

  async function register(d) {
    const name = clean(d.name, 80), email = clean(d.email, 254).toLowerCase();
    if (name.length < 3) throw fail("اكتب اسمك الكامل", 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail("اكتب بريداً إلكترونياً صحيحاً", 400);
    if (MAJORS.indexOf(d.major) < 0) throw fail("اختر سنتك الدراسية أو تخصصك", 400);
    if (typeof d.password !== "string" || d.password.length < 8) throw fail("كلمة المرور لازم تكون 8 أحرف على الأقل", 400);
    const dom = (C.allowedEmailDomains || []).map((x) => String(x).toLowerCase());
    if (dom.length && dom.indexOf(email.split("@").pop()) < 0) throw fail("التسجيل متاح فقط بالبريد الجامعي (" + dom.map((x) => "@" + x).join("، ") + ")", 400);

    const { res, data } = await raw("/auth/v1/signup", { method: "POST", body: { email, password: d.password, data: { name, major: d.major } } });
    if (!res.ok) throw fail(authMsg(data, res.status), res.status === 429 ? 429 : res.status === 422 ? 409 : 400);
    if (data && data.access_token) { putSess(toSess(data)); return payload(); }
    /* تأكيد الإيميل مفعّل في Supabase: الحساب اتعمل لكن محتاج تأكيد */
    if (data && Array.isArray(data.identities) && data.identities.length === 0) throw fail("هذا البريد مسجل من قبل، سجّل دخولك", 409);
    throw fail("تم إنشاء الحساب ✅ افتح بريدك واضغط رابط التأكيد، وبعدها سجّل دخولك.", 202);
  }

  async function logout() {
    const s = getSess();
    if (s) { try { await raw("/auth/v1/logout", { method: "POST", token: s.access_token }); } catch (e) {} }
    putSess(null);
    return { ok: true };
  }

  /* ---------- أشكال البيانات ---------- */
  const sched = (r) => ({ id: r.id, title: r.title, kind: r.kind, day: r.day, time: r.time, place: r.place });
  const post = (r) => ({
    id: r.id, uid: String(r.user_id), name: r.name, at: Date.parse(r.created_at) || Date.now(), closed: !!r.closed,
    type: r.type, subject: r.subject, role: r.role, year: r.year, count: r.count, desc: r.description, contact: r.contact,
  });

  /* ---------- التوجيه: نفس مسارات /api ---------- */
  async function request(method, url, body) {
    const u = new URL(url, "http://x");
    const path = u.pathname;
    body = body || {};
    let m;

    if (path === "/api/register" && method === "POST") return register(body);
    if (path === "/api/login" && method === "POST") return login(clean(body.email, 254).toLowerCase(), String(body.password || ""));
    if (path === "/api/logout" && method === "POST") return logout();
    if (path === "/api/me" && method === "GET") return payload();

    if (path === "/api/enroll" && method === "PUT") {
      if (!/^[\w.\-]{1,80}$/.test(String(body.course))) throw fail("كورس غير صالح", 400);
      if (body.on) await rest("POST", "enrollments?on_conflict=user_id,course_id", { user_id: uid(), course_id: body.course }, { Prefer: "resolution=ignore-duplicates" });
      else await rest("DELETE", `enrollments?user_id=${eq(uid())}&course_id=${eq(body.course)}`);
      return { ok: true };
    }
    if (path === "/api/lecture" && method === "PUT") {
      const i = body.index;
      if (!/^[\w.\-]{1,80}$/.test(String(body.course)) || !Number.isInteger(i) || i < 0 || i >= 500) throw fail("بيانات غير صالحة", 400);
      if (body.done) await rest("POST", "lecture_progress?on_conflict=user_id,course_id,lecture", { user_id: uid(), course_id: body.course, lecture: i }, { Prefer: "resolution=ignore-duplicates" });
      else await rest("DELETE", `lecture_progress?user_id=${eq(uid())}&course_id=${eq(body.course)}&lecture=eq.${i}`);
      return { ok: true };
    }

    if (path === "/api/course-progress") {
      if (method === "GET") {
        const c = u.searchParams.get("course") || "";
        if (!/^[\w.\-]{1,80}$/.test(c)) throw fail("كورس غير صالح", 400);
        const r = await rest("GET", `course_progress?user_id=${eq(uid())}&course_id=${eq(c)}&select=data`);
        return (r && r[0] && r[0].data) || {};
      }
      if (method === "POST") {
        if (!/^[\w.\-]{1,80}$/.test(String(body.course)) || typeof body.progress !== "object" || !body.progress) throw fail("بيانات غير صالحة", 400);
        await rest("POST", "course_progress?on_conflict=user_id,course_id", { user_id: uid(), course_id: body.course, data: body.progress }, { Prefer: "resolution=merge-duplicates" });
        return { ok: true };
      }
    }

    if (path === "/api/schedule" && method === "GET") {
      const r = await rest("GET", `schedule_items?user_id=${eq(uid())}&select=id,title,kind,day,time,place&order=day.asc,time.asc`);
      return r.map(sched);
    }
    if (path === "/api/schedule" && method === "POST") {
      const title = clean(body.title, 120), time = body.time || "09:00";
      if (title.length < 2) throw fail("اكتب عنوان الموعد", 400);
      if (KINDS.indexOf(body.kind) < 0) throw fail("نوع الموعد غير صالح", 400);
      if (!Number.isInteger(body.day) || body.day < 0 || body.day > 6) throw fail("اليوم غير صالح", 400);
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw fail("الوقت غير صالح", 400);
      const r = await rest("POST", "schedule_items", { user_id: uid(), title, kind: body.kind, day: body.day, time, place: clean(body.place, 80) }, { Prefer: "return=representation" });
      return sched(r[0]);
    }
    if ((m = path.match(/^\/api\/schedule\/(\d+)$/)) && method === "DELETE") {
      await rest("DELETE", `schedule_items?id=eq.${m[1]}&user_id=${eq(uid())}`);
      return { ok: true };
    }

    if (path === "/api/teams" && method === "GET") {
      const r = await rest("GET", "team_posts?select=*&order=created_at.desc&limit=500");
      return r.map(post);
    }
    if (path === "/api/teams" && method === "POST") {
      const type = body.type, subject = clean(body.subject, 120), role = clean(body.role, 120), contact = clean(body.contact, 200);
      if ((type !== "need" && type !== "have") || !subject || !role || !contact) throw fail("املأ الحقول المطلوبة.", 400);
      const count = Math.max(1, Math.min(20, parseInt(body.count, 10) || 1));
      const r = await rest("POST", "team_posts", {
        user_id: uid(), type, subject, role, contact, count,
        year: clean(body.year, 30), description: String(body.desc || "").trim().slice(0, 600),
      }, { Prefer: "return=representation" });
      return post(r[0]);
    }
    if ((m = path.match(/^\/api\/teams\/([\w\-]+)$/))) {
      if (method === "PATCH") { await rest("PATCH", `team_posts?id=${eq(m[1])}&user_id=${eq(uid())}`, { closed: true }); return { ok: true }; }
      if (method === "DELETE") { await rest("DELETE", `team_posts?id=${eq(m[1])}&user_id=${eq(uid())}`); return { ok: true }; }
    }

    throw fail("غير موجود", 404);
  }

  window.AhliaBackend = { request };
})();
