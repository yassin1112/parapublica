/** Site branding */

const SITE_NAME = 'ParaPublic';

const SITE_PHONE = '+21692326831';

const SITE_PHONE_DISPLAY = '+216 92 326 831';

const SITE_LOGO_FILE = 'assets/img/logo.svg';



const BRAND_THEME_FALLBACK = {

  primary: '#9d224e',

  primaryDark: '#7a1a3d',

  primaryLight: '#c73d6f',

  accent: '#b8326a',

};



function siteLogoUrl() {

  const base = typeof assetBase === 'function' ? assetBase() : '.';

  return `${base}/${SITE_LOGO_FILE}`.replace(/\/\.\//g, '/').replace(/([^:]\/)\/+/g, '$1');

}



function renderSiteLogo(size = 'header') {

  const mod =

    size === 'footer' ? 'logo-mark--footer' : size === 'admin' ? 'logo-mark--admin' : 'logo-mark--header';

  const src = siteLogoUrl();

  return `<span class="logo-mark ${mod}">

    <img src="${src}" alt="" class="logo-img" decoding="async" data-brand-logo aria-hidden="true">

  </span>`;

}



function renderSiteNameHtml(compact = false) {
  if (compact) return `<strong class="logo-text logo-text--compact">${escapeHtml(SITE_NAME)}</strong>`;
  const m = SITE_NAME.match(/^(.+?)(Public)$/i);
  if (m) {
    return `<span class="logo-text">${escapeHtml(m[1])}<span>${escapeHtml(m[2])}</span></span>`;
  }
  return `<span class="logo-text">${escapeHtml(SITE_NAME)}</span>`;
}



function rgbToHex(r, g, b) {

  return (

    '#' +

    [r, g, b]

      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))

      .join('')

  );

}



function hexToRgb(hex) {

  const h = hex.replace('#', '');

  return {

    r: parseInt(h.slice(0, 2), 16),

    g: parseInt(h.slice(2, 4), 16),

    b: parseInt(h.slice(4, 6), 16),

  };

}



function mixHex(a, b, t) {

  const c1 = hexToRgb(a);

  const c2 = hexToRgb(b);

  return rgbToHex(

    c1.r + (c2.r - c1.r) * t,

    c1.g + (c2.g - c1.g) * t,

    c1.b + (c2.b - c1.b) * t

  );

}



/** Inline vars set only in light mode; dark mode uses style.css tokens */

const BRAND_LIGHT_VARS = [

  '--primary',

  '--primary-dark',

  '--primary-light',

  '--accent',

  '--accent-soft',

  '--link',

  '--link-hover',

  '--nav-text-hover',

  '--logo-accent',
  '--hero-accent',

  '--badge-cat-bg',

  '--badge-cat-text',

  '--delivery-note-bg',

  '--delivery-note-text',

  '--delivery-note-border',

  '--order-id-bg',

  '--btn-outline-border',

  '--btn-outline-text',

  '--btn-outline-hover-bg',

  '--btn-primary-shadow',

  '--btn-primary-shadow-hover',

  '--border',

  '--focus-ring',

  '--gradient-brand',

  '--gradient-soft',

  '--page-bg-image',

  '--footer-bg-image',

  '--admin-sidebar-bg',

  '--shadow',

  '--shadow-lg',

];



let cachedBrandPalette = null;



function clearBrandInlineStyles() {

  BRAND_LIGHT_VARS.forEach((v) => document.documentElement.style.removeProperty(v));

}



function getBrandPalette() {

  return cachedBrandPalette;

}



function applyBrandTheme(palette) {

  cachedBrandPalette = palette;

  const root = document.documentElement;



  const primary = palette ? palette.primary : BRAND_THEME_FALLBACK.primary;

  const accent = palette ? palette.accent : BRAND_THEME_FALLBACK.accent;

  const primaryDark = mixHex(primary, '#000000', 0.22);

  const primaryLight = mixHex(primary, '#ffffff', 0.45);

  const accentSoft = mixHex(accent, '#ffffff', 0.92);



  root.style.setProperty('--primary', primary);

  root.style.setProperty('--primary-dark', primaryDark);

  root.style.setProperty('--primary-light', primaryLight);

  root.style.setProperty('--accent', accent);

  root.style.setProperty('--accent-soft', accentSoft);
  root.style.setProperty('--bg', '#ffffff');
  root.style.setProperty('--surface', '#ffffff');
  root.style.setProperty('--surface-muted', accentSoft);
  root.style.setProperty('--surface-hover', mixHex(accentSoft, primaryLight, 0.35));
  root.style.setProperty('--text', '#000000');
  root.style.setProperty('--text-muted', '#1f1f1f');
  root.style.setProperty('--heading', '#000000');
  root.style.setProperty('--link', '#000000');
  root.style.setProperty('--link-hover', '#000000');
  root.style.setProperty('--nav-text', '#000000');
  root.style.setProperty('--nav-text-hover', '#000000');
  root.style.setProperty('--logo-accent', '#000000');
  root.style.setProperty('--hero-accent', '#000000');
  root.style.setProperty('--badge-cat-bg', mixHex(accentSoft, primaryLight, 0.25));
  root.style.setProperty('--badge-cat-text', '#000000');
  root.style.setProperty('--delivery-note-bg', accentSoft);
  root.style.setProperty('--delivery-note-text', '#000000');
  root.style.setProperty('--delivery-note-border', primary);
  root.style.setProperty('--order-id-bg', `color-mix(in srgb, ${primary} 14%, transparent)`);
  root.style.setProperty('--btn-outline-border', primary);
  root.style.setProperty('--btn-outline-text', '#000000');
  root.style.setProperty('--footer-text', '#000000');
  root.style.setProperty('--footer-link', '#000000');
  root.style.setProperty('--footer-link-hover', '#000000');
  root.style.setProperty('--footer-heading', '#000000');
  root.style.setProperty('--btn-outline-hover-bg', accentSoft);
  root.style.setProperty('--table-row-hover', accentSoft);
  root.style.setProperty('--btn-primary-shadow', `${primary}52`);
  root.style.setProperty('--btn-primary-shadow-hover', `${primaryDark}66`);
  root.style.setProperty('--border', mixHex('#bbf7d0', primary, 0.2));
  root.style.setProperty('--border-header', `${mixHex('#bbf7d0', primary, 0.2)}d9`);

  root.style.setProperty('--focus-ring', `${primary}33`);

  root.style.setProperty(

    '--gradient-brand',

    `linear-gradient(135deg, ${mixHex(primary, '#fff', 0.2)} 0%, ${primary} 50%, ${primaryDark} 100%)`

  );

  root.style.setProperty('--gradient-soft', `linear-gradient(135deg, ${primary}22, ${accent}14)`);

  root.style.setProperty(

    '--page-bg-image',

    `radial-gradient(ellipse 90% 60% at 12% -12%, ${primary}38, transparent 55%), radial-gradient(ellipse 70% 50% at 92% 8%, ${accent}1f, transparent 50%), linear-gradient(165deg, #ffffff 0%, #f0fdf4 48%, #ecfdf5 100%)`

  );

  root.style.setProperty(

    '--footer-bg-image',

    `linear-gradient(160deg, ${mixHex(primary, '#000', 0.55)} 0%, ${primaryDark} 48%, ${mixHex(primary, '#000', 0.35)} 100%)`

  );

  root.style.setProperty(

    '--admin-sidebar-bg',

    `linear-gradient(165deg, #ffffff 0%, ${accentSoft} 55%, ${mixHex(accentSoft, primaryLight, 0.35)} 100%)`

  );

  root.style.setProperty('--shadow', `0 8px 30px ${primary}1a`);

  root.style.setProperty('--shadow-lg', `0 24px 60px ${primaryDark}24`);

}



function applySiteFavicon() {

  let link = document.querySelector('link[rel="icon"]');

  if (!link) {

    link = document.createElement('link');

    link.rel = 'icon';

    document.head.appendChild(link);

  }

  link.type = 'image/svg+xml';

  link.href = siteLogoUrl();

}



function initBrand() {

  applyBrandTheme(null);

  applySiteFavicon();

}



if (typeof document !== 'undefined') {

  if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', initBrand);

  } else {

    initBrand();

  }

}

