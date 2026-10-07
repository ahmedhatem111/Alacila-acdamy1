/* Login / sign-up page logic (login.html).
   الحسابات محفوظة في قاعدة البيانات على السيرفر (/api/login و /api/register). */
(() => {
    const KEY_USER = "ahlia_user";
    const WELCOME = "welcome.html";
    const OFFLINE = window.AHLIA_OFFLINE_MODE === true;
    /* only these pages are valid targets after logging in (prevents open redirects) */
    const PROTECTED = /^(welcome|courses|course|teams|staff|year1|year2|cs|ai|is|mylearning|schedule|paths|movies|certificate)\.html(\?[\w%.\-=&]*)?$/;
    const MAJOR_OF_PAGE = { "cs.html": "cs", "ai.html": "ai", "is.html": "is", "year1.html": "year1", "year2.html": "year2" };

    const S = window.AhliaStore;

    const params = new URLSearchParams(location.search);
    const nextRaw = params.get("next");
    const next = nextRaw && PROTECTED.test(nextRaw) ? nextRaw : null;

    // already signed in (checked on the server) -> straight to where they were going
    if (OFFLINE) {
        const localNote = document.getElementById("offlineNote");
        if (localNote) localNote.hidden = false;
        const current = S.getUser();
        if (current && current.mode === "local-guest") location.replace(next || WELCOME);
        else if (current) S.clearLocal();
        localStorage.removeItem("ahlia_sb");
    } else {
        S.api("GET", "/api/me").then((p) => { S.setSession(p);
            location.replace(next || WELCOME); }).catch(() => S.clearLocal());
    }

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const note = document.getElementById("authNote");
    if (next) note.hidden = false;
    if (next && MAJOR_OF_PAGE[next.split("?")[0]]) signupForm.elements.major.value = MAJOR_OF_PAGE[next.split("?")[0]];

    function show(which) {
        loginForm.hidden = which !== "login";
        signupForm.hidden = which !== "signup";
        const form = which === "login" ? loginForm : signupForm;
        form.querySelectorAll(".form-msg").forEach((m) => (m.textContent = ""));
        document.title = (which === "login" ? "تسجيل الدخول" : "إنشاء حساب") + " | أهلية أكاديمي";
    }
    show(location.hash === "#signup" ? "signup" : "login");
    document.querySelectorAll("[data-switch]").forEach((b) =>
        b.addEventListener("click", () => { show(b.dataset.switch);
            window.scrollTo({ top: 0, behavior: "smooth" }); })
    );

    /* show / hide password with the eye icon */
    const EYE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    const EYE_OFF = EYE.replace('<circle cx="12" cy="12" r="3"/>', '<circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/>');
    document.querySelectorAll(".pw__toggle").forEach((btn) =>
        btn.addEventListener("click", () => {
            const input = btn.previousElementSibling;
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            btn.innerHTML = show ? EYE : EYE_OFF;
            btn.setAttribute("aria-pressed", String(show));
            btn.setAttribute("aria-label", show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور");
            input.focus();
        })
    );

    /* validation */
    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    function setError(input, msg) {
        const field = input.closest(".field");
        field.classList.toggle("invalid", !!msg);
        field.querySelector(".err").textContent = msg || "";
        return !msg;
    }
    const el = (f, n) => f.elements[n];

    function validateLogin(f) {
        let ok = true;
        const email = el(f, "email").value.trim();
        ok = setError(el(f, "email"), OFFLINE ? (email ? "" : "اكتب أي اسم أو بريد") : (emailOk(email) ? "" : "اكتب بريداً إلكترونياً صحيحاً")) && ok;
        ok = setError(el(f, "password"), el(f, "password").value ? "" : "اكتب كلمة المرور") && ok;
        return ok;
    }

    function validateSignup(f) {
        let ok = true;
        const name = el(f, "name").value.trim();
        const email = el(f, "email").value.trim();
        ok = setError(el(f, "name"), (OFFLINE ? name.length > 0 : name.length >= 3) ? "" : "اكتب اسمك الكامل") && ok;
        ok = setError(el(f, "email"), OFFLINE ? (email ? "" : "اكتب أي اسم أو بريد") : (emailOk(email) ? "" : "اكتب بريداً إلكترونياً صحيحاً")) && ok;
        ok = setError(el(f, "major"), el(f, "major").value ? "" : "اختر سنتك الدراسية أو تخصصك") && ok;
        ok = setError(el(f, "password"), (OFFLINE ? el(f, "password").value.length > 0 : el(f, "password").value.length >= 8) ? "" : (OFFLINE ? "اكتب أي كلمة مرور" : "8 أحرف على الأقل")) && ok;
        ok = setError(el(f, "confirm"), el(f, "confirm").value && el(f, "confirm").value === el(f, "password").value ? "" : "كلمتا المرور غير متطابقتين") && ok;
        return ok;
    }
    const say = (form, text, type) => {
        const m = form.querySelector(".form-msg");
        m.textContent = text;
        m.className = "form-msg " + type;
    };

    /* signed in -> the page they asked for, or the welcome page */
    function finish(payload) {
        S.setSession(payload);
        setTimeout(() => (location.href = next || WELCOME), 600);
    }

    async function submit(form, url, data, okMsg) {
        const btn = form.querySelector("button[type=submit]");
        btn.disabled = true;
        try {
            if (OFFLINE) {
                const typed = String(data.email || "ضيف").trim();
                const major = data.major || MAJOR_OF_PAGE[next && next.split("?")[0]] || "year1";
                const guestId = "guest-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
                const payload = {
                    ok: true,
                    user: {
                        id: guestId,
                        name: String(data.name || typed.split("@")[0] || "ضيف").trim(),
                        email: typed,
                        major,
                        access: Object.keys(S.LABEL),
                        mode: "local-guest",
                    },
                    state: { enrolled: [], done: {} },
                };
                say(form, "تم الدخول كضيف على هذا الجهاز. لا يتم حفظ كلمة المرور أو التحقق من الحساب.", "ok");
                finish(payload);
                return;
            }
            const payload = await S.api("POST", url, data);
            say(form, okMsg, "ok");
            finish(payload);
        } catch (e) {
            say(form, e.message, e.status === 202 ? "ok" : "bad");
            btn.disabled = false;
        }
    }

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validateLogin(loginForm)) return;
        submit(loginForm, "/api/login", {
            email: el(loginForm, "email").value.trim(),
            password: el(loginForm, "password").value,
        }, "تم تسجيل الدخول بنجاح");
    });

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validateSignup(signupForm)) return;
        submit(signupForm, "/api/register", {
            name: el(signupForm, "name").value.trim(),
            email: el(signupForm, "email").value.trim(),
            major: el(signupForm, "major").value, // year1 | year2 | cs | ai | is
            password: el(signupForm, "password").value,
        }, "تم إنشاء حسابك بنجاح");
    });
})();