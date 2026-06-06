runPage(() => {
  const base = assetBase();
  const catFilter = Number(getQueryParam('cat')) || 0;
  const search = (getQueryParam('q') || '').trim().toLowerCase();
  const categories = getCategories();

  let list = getProducts(true);
  if (catFilter) list = list.filter((p) => p.categoryId === catFilter);
  if (search) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        (p.description || '').toLowerCase().includes(search)
    );
  }
  list.sort((a, b) => a.name.localeCompare(b.name, getLang()));

  const catOptions = categories
    .map(
      (c) =>
        `<option value="${c.id}" ${catFilter === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
    )
    .join('');

  const pills =
    `<a href="${pageUrl('products.html')}" class="cat-pill ${!catFilter ? 'active' : ''}">${t('all_categories')}</a>` +
    categories
      .map(
        (c) =>
          `<a href="${pageUrl('products.html')}?cat=${c.id}" class="cat-pill ${catFilter === c.id ? 'active' : ''}">${escapeHtml(c.name)}</a>`
      )
      .join('');

  const grid =
    list.length === 0
      ? `<p style="text-align:center;color:var(--text-muted)">${t('no_products')}</p>`
      : `<div class="products-grid">${list.map((p) => productCardHtml({ ...p, showQty: true }, base)).join('')}</div>`;

  mountLayout({
    title: t('nav_products'),
    activeNav: 'products',
    mainHtml: `
      <section class="section container">
        <div class="section-header" data-animate>
          <h2>${t('catalog_title')}</h2>
          <p>${t('catalog_sub')}</p>
        </div>
        <form class="filters-bar" method="get" data-animate id="filter-form">
          <input type="search" name="q" placeholder="${t('search')}" value="${escapeHtml(search)}">
          <select name="cat">
            <option value="0">${t('all_categories')}</option>
            ${catOptions}
          </select>
          <button type="submit" class="btn btn-primary btn-sm">${t('filter')}</button>
        </form>
        <div class="categories-strip" data-animate>${pills}</div>
        ${grid}
      </section>`,
  });

  document.getElementById('filter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const q = fd.get('q') || '';
    const cat = fd.get('cat') || '0';
    let url = pageUrl('products.html') + '?';
    if (q) url += 'q=' + encodeURIComponent(q) + '&';
    if (cat !== '0') url += 'cat=' + cat;
    window.location.href = url.replace(/[?&]$/, '');
  });
});
