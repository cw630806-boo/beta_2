/* =========================================================
   الوضع الليلي / النهاري
   - يُحمَّل بأول شيء فـ <head> (بدون defer/async/module) باش يطبّق
     الوضع المحفوظ قبل ما المتصفح يرسم الصفحة، ويتفادى وميض تغيّر اللون.
   - الوضع الافتراضي دائماً "ليلي" (dark) إلا إذا العميل بدّل يدوياً من قبل.
   - يخزّن الاختيار فـ localStorage باش يبقى نفسه فـ كل صفحات الموقع.
   ========================================================= */
(function () {
  var saved = localStorage.getItem('siteTheme');
  var theme = saved === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
})();

// دالة تبديل الوضع + تحديث زر التبديل وأيقونته إذا كان موجود فالصفحة
function siteApplyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('siteTheme', theme);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#F5F1E8' : '#15181A');
  siteUpdateThemeToggleIcon();
}

function siteUpdateThemeToggleIcon() {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  var isLight = document.documentElement.getAttribute('data-theme') === 'light';
  btn.innerHTML = isLight
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></svg>';
  btn.setAttribute('aria-label', isLight ? 'التبديل إلى الوضع الليلي' : 'التبديل إلى الوضع النهاري');
}

function siteInitThemeToggle() {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  siteUpdateThemeToggleIcon();
  btn.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    siteApplyTheme(current === 'light' ? 'dark' : 'light');
  });
}

document.addEventListener('DOMContentLoaded', siteInitThemeToggle);