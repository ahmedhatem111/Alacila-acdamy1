/* Theme switch: sun button toggles the calm, eye-friendly colours.
   Loaded in <head> so the saved theme is applied before the page paints. */
(() => {
  const KEY = "ahlia_theme";
  const root = document.documentElement;
  const saved = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const apply = (t) => (t === "soft" ? root.setAttribute("data-theme", "soft") : root.removeAttribute("data-theme"));
  apply(saved());

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    const isSoft = () => root.getAttribute("data-theme") === "soft";
    const sync = () => {
      const label = isSoft() ? "العودة إلى الألوان الأساسية" : "تفعيل الألوان المريحة للعين";
      btn.setAttribute("aria-pressed", String(isSoft()));
      btn.setAttribute("aria-label", label);
      btn.title = label;
    };
    sync();
    btn.addEventListener("click", () => {
      const next = isSoft() ? null : "soft";
      apply(next);
      try { next ? localStorage.setItem(KEY, next) : localStorage.removeItem(KEY); } catch (e) {}
      sync();
    });
  });
})();
