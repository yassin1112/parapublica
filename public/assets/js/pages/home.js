const CATEGORY_ICONS = {
  skincare: '✨',
  vitamins: '💊',
  hygiene: '🧴',
  baby: '👶',
  devices: '🩺',
};

runPage(async () => {
  const base = assetBase();
  const categories = getCategories();
  const allProducts = getProducts(true);

  const onSale = allProducts
    .filter((p) => p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price))
    .slice(0, 8);

  const featured = [...allProducts]
    .sort((a, b) => b.stockQuantity - a.stockQuantity)
    .slice(0, 8);

  const newest = [...allProducts]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

  const categoryTiles = categories
    .map((c) => {
      const icon = CATEGORY_ICONS[c.slug] || '🛍️';
      return `
        <a href="${pageUrl('products.html')}?cat=${c.id}" class="category-tile" data-animate>
          <div class="category-tile-icon">${icon}</div>
          <span>${escapeHtml(c.name)}</span>
        </a>`;
    })
    .join('');

  const renderGrid = (list, emptyKey) => {
    if (!list.length) {
      return `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">${t(emptyKey || 'products_empty')}</p>`;
    }
    return list.map((p) => productCardHtml({ ...p, showQty: false }, base)).join('');
  };

  mountLayout({
    title: t('nav_home'),
    activeNav: 'home',
    mainHtml: `
      <section class="container section" style="padding-top:1.25rem">
        <div class="promo-hero" data-animate>
          <div class="promo-hero-banner">
            <h2>${t('promo_hero_title')}</h2>
            <p>${t('promo_hero_sub')}</p>
            <a href="${pageUrl('products.html')}" class="btn btn-primary">${t('hero_cta_products')}</a>
          </div>
          <div class="promo-slider">
            <div class="promo-mini-card"><strong>${t('trust_delivery')}</strong><span>${t('promo_mini_1')}</span></div>
            <div class="promo-mini-card"><strong>${t('trust_authentic')}</strong><span>${t('promo_mini_2')}</span></div>
            <div class="promo-mini-card"><strong>${t('promotions_title')}</strong><span>${t('promo_mini_3')}</span></div>
            <div class="promo-mini-card"><strong>${t('shop_categories')}</strong><span>${categories.length} ${t('stat_products')}</span></div>
          </div>
        </div>

        <div class="section-title-row" data-animate>
          <h2>${t('shop_categories')}</h2>
          <a href="${pageUrl('products.html')}">${t('view_all')} →</a>
        </div>
        <div class="category-strip">${categoryTiles || `<p>${t('products_empty')}</p>`}</div>

        ${
          onSale.length
            ? `
        <div class="section-title-row" data-animate>
          <h2>${t('promotions_title')}</h2>
          <a href="${pageUrl('products.html')}">${t('view_all')} →</a>
        </div>
        <div class="products-grid" style="margin-bottom:2.5rem">${renderGrid(onSale)}</div>`
            : ''
        }

        <div class="section-title-row" data-animate>
          <h2>${t('deal_today')}</h2>
          <a href="${pageUrl('products.html')}">${t('view_all')} →</a>
        </div>
        <div class="products-grid" style="margin-bottom:2.5rem">${renderGrid(featured)}</div>

        <div class="section-title-row" data-animate>
          <h2>${t('featured_title')}</h2>
          <a href="${pageUrl('products.html')}">${t('view_all')} →</a>
        </div>
        <div class="products-grid">${renderGrid(newest.length ? newest : featured)}</div>

        <div class="trust-strip" data-animate>
          <div class="trust-item">
            <div class="trust-item-icon">🚚</div>
            <div>
              <h4>${t('trust_delivery')}</h4>
              <p>${t('trust_delivery_sub')}</p>
            </div>
          </div>
          <div class="trust-item">
            <div class="trust-item-icon">✅</div>
            <div>
              <h4>${t('trust_authentic')}</h4>
              <p>${t('trust_authentic_sub')}</p>
            </div>
          </div>
          <div class="trust-item">
            <div class="trust-item-icon">📞</div>
            <div>
              <h4>${t('trust_support')}</h4>
              <p>${t('trust_support_sub')} <a href="tel:${SITE_PHONE.replace(/\s/g, '')}">${SITE_PHONE_DISPLAY}</a></p>
            </div>
          </div>
        </div>
      </section>`,
  });
});
