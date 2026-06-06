function assetBase() {
  return window.location.pathname.includes('/admin/') ? '..' : '.';
}

function pageUrl(path) {
  const base = assetBase();
  return `${base}/${path}`.replace('/./', '/');
}

function renderHead(title) {
  document.title = `${title} | ${SITE_NAME}`;
}

function renderFlash() {
  const f = consumeFlash();
  if (!f) return '';
  const cls = f.type === 'success' ? 'alert-success' : 'alert-error';
  return `<div class="container"><div class="alert ${cls}" data-animate>${escapeHtml(f.message)}</div></div>`;
}

function renderHeaderControls() {
  return `
    <div class="header-controls">
      <label class="sr-only" for="lang-select">${t('lang_label')}</label>
      <select id="lang-select" class="lang-select" aria-label="${t('lang_label')}">${renderLangSelect()}</select>
    </div>`;
}

function renderTopPromoBar() {
  return `<div class="top-promo-bar">${t('promo_bar')}</div>`;
}

function renderHeaderSearch() {
  const q = typeof getQueryParam === 'function' ? getQueryParam('q') || '' : '';
  return `
    <form class="header-search" action="${pageUrl('products.html')}" method="get" role="search">
      <div class="header-search-wrap">
        <input type="search" name="q" value="${escapeHtml(q)}" placeholder="${t('search')}" aria-label="${t('search')}">
      </div>
    </form>`;
}

function renderHeader(activeNav) {
  const base = assetBase();
  const user = getCurrentUser();
  const nav = (id, href, label, extra = '') =>
    `<a href="${pageUrl(href)}" class="${activeNav === id ? 'active' : ''} ${extra}">${label}</a>`;

  let authLinks = '';
  if (user) {
    authLinks += nav('account', 'account.html', t('nav_account'));
    if (user.role === 'admin') {
      authLinks += `<a href="${base}/admin/index.html" class="nav-admin">${t('nav_admin')}</a>`;
    }
    authLinks += `<a href="#" class="nav-logout" data-logout>${t('nav_logout')}</a>`;
  } else {
    authLinks += nav('login', 'login.html', t('nav_login'));
    authLinks += `<a href="${pageUrl('register.html')}" class="btn btn-sm btn-outline">${t('nav_register')}</a>`;
  }

  return `
    ${renderTopPromoBar()}
    <header class="site-header" data-animate>
      <div class="container header-inner">
        <a href="${pageUrl('index.html')}" class="logo" aria-label="${SITE_NAME}">
          ${renderSiteLogo('header')}
          ${renderSiteNameHtml()}
        </a>
        ${renderHeaderSearch()}
        ${renderHeaderControls()}
        <button class="nav-toggle" type="button" aria-label="${t('nav_menu')}" data-nav-toggle>
          <span></span><span></span><span></span>
        </button>
        <nav class="main-nav" data-nav>
          ${nav('home', 'index.html', t('nav_home'))}
          ${nav('products', 'products.html', t('nav_products'))}
          <a href="${pageUrl('cart.html')}" class="nav-cart ${activeNav === 'cart' ? 'active' : ''}">
            🛒 ${t('nav_cart')} <span class="cart-badge" id="cart-badge" style="display:none">0</span>
          </a>
          ${nav('about', 'about.html', t('nav_about'))}
          ${authLinks}
        </nav>
      </div>
    </header>`;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">${renderSiteLogo('footer')}${renderSiteNameHtml(true)}</div>
          <p>${t('footer_tagline')}</p>
        </div>
        <div>
          <h4>${t('footer_links')}</h4>
          <ul>
            <li><a href="${pageUrl('products.html')}">${t('nav_products')}</a></li>
            <li><a href="${pageUrl('about.html')}">${t('nav_about')}</a></li>
            <li><a href="${pageUrl('login.html')}">${t('nav_account')}</a></li>
          </ul>
        </div>
        <div>
          <h4>${t('footer_contact')}</h4>
          <p>contact@parapublic.com</p>
          <p><a href="tel:${SITE_PHONE.replace(/\s/g, '')}" style="color:inherit">${SITE_PHONE_DISPLAY}</a></p>
          <p style="margin-top:.5rem;font-size:.88rem">${t('trust_delivery_sub')}</p>
        </div>
      </div>
      <div class="footer-bottom container">
        <span>© ${new Date().getFullYear()} ${SITE_NAME} — ${t('footer_rights')}</span>
      </div>
    </footer>`;
}

function renderAdminSidebar(activePage) {
  const base = assetBase();
  const user = getCurrentUser();
  const link = (id, href, label) =>
    `<a href="${href}" class="${activePage === id ? 'active' : ''}">${label}</a>`;

  return `
    <aside class="admin-sidebar" data-animate>
      <div class="admin-brand">${renderSiteLogo('admin')}${renderSiteNameHtml(true)}</div>
      <p class="admin-sidebar-user">${escapeHtml(user?.name || '')}</p>
      ${link('dashboard', 'index.html', t('admin_dashboard'))}
      ${link('products', 'products.html', t('admin_products'))}
      ${link('stock', 'stock.html', t('admin_stock'))}
      ${link('orders', 'orders.html', t('admin_orders'))}
      ${link('users', 'users.html', t('admin_users'))}
      <hr class="admin-sidebar-divider">
      <a href="${base}/index.html">← ${t('back_site')}</a>
    </aside>`;
}

function mountLayout({ title, activeNav, mainHtml, adminPage }) {
  renderHead(title);
  const root = document.getElementById('app-root');
  if (!root) return;

  if (adminPage) {
    root.innerHTML = `
      ${renderHeader('')}
      <main class="site-main">
        ${renderApiBanner()}
        ${renderFlash()}
        <section class="container admin-layout">
          ${renderAdminSidebar(adminPage)}
          <div class="admin-content">${mainHtml}</div>
        </section>
      </main>
      ${renderFooter()}`;
  } else {
    root.innerHTML = `
      ${renderHeader(activeNav)}
      <main class="site-main">
        ${renderApiBanner()}
        ${renderFlash()}
        ${mainHtml}
      </main>
      ${renderFooter()}`;
  }

  document.querySelector('[data-logout]')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
    window.location.href = pageUrl('index.html');
  });

  bindLangSelect();
  initTheme();

  if (typeof initMainJs === 'function') initMainJs();
  if (typeof remountCheckoutModal === 'function') remountCheckoutModal();
  else if (typeof mountCheckoutModal === 'function') mountCheckoutModal();
  if (typeof bindShopActions === 'function') bindShopActions();
  if (typeof updateCartBadge === 'function') updateCartBadge();
}

async function boot() {
  initLang();
  initTheme();
  await initDb();
}

function runPage(renderFn) {
  boot()
    .then(renderFn)
    .catch((err) => {
      console.error(err);
      mountLayout({
        title: typeof t === 'function' ? t('err_load') : 'Error',
        activeNav: '',
        mainHtml: `
          <section class="container section">
            <div class="card" style="padding:2rem;text-align:center;max-width:520px;margin:2rem auto">
              <h2>${typeof t === 'function' ? t('err_load') : 'Could not load page'}</h2>
              <p class="alert alert-error" style="margin:1rem 0">${escapeHtml(err.message)}</p>
              <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:1rem">${typeof t === 'function' ? escapeHtml(t('err_api')) : ''}</p>
              <a href="${pageUrl('index.html')}" class="btn btn-primary">${typeof t === 'function' ? t('nav_home') : 'Home'}</a>
            </div>
          </section>`,
      });
    });
}
