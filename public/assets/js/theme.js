/** Single site theme: white & green background, green typography */
function initTheme() {
  document.documentElement.removeAttribute('data-theme');
  if (typeof applyBrandTheme === 'function') {
    applyBrandTheme(typeof getBrandPalette === 'function' ? getBrandPalette() : null);
  }
}

function bindThemeToggle() {
  /* theme toggle removed */
}

function getTheme() {
  return 'default';
}

function applyTheme() {
  initTheme();
}

function bindLangSelect() {
  document.getElementById('lang-select')?.addEventListener('change', (e) => {
    if (typeof setLang === 'function') setLang(e.target.value);
  });
}
