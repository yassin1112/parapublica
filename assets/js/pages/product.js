runPage(() => {
  const slug = getQueryParam('slug');
  const p = slug ? getProductBySlug(slug) : null;
  if (!p) {
    flash('error', t('product_not_found'));
    window.location.href = pageUrl('products.html');
    return;
  }
  const st = stockStatus(p.stockQuantity, p.lowStockThreshold);
  const cat = getCategoryName(p.categoryId);

  mountLayout({
    title: p.name,
    activeNav: 'products',
    mainHtml: `
      <section class="section container">
        <article class="card product-detail-grid" style="max-width:900px;margin:0 auto" data-animate>
          <div>
            <img src="${escapeHtml(p.imageUrl || 'https://via.placeholder.com/500')}" alt="${escapeHtml(p.name)}" style="border-radius:var(--radius)">
          </div>
          <div>
            ${cat ? `<span class="badge badge-cat">${escapeHtml(cat)}</span>` : ''}
            <span class="badge ${st.class}">${escapeHtml(st.label)}</span>
            <h1 style="margin:.75rem 0">${escapeHtml(p.name)}</h1>
            <div style="margin-bottom:1rem">${productPriceHtml(p)}</div>
            <p style="color:var(--text-muted);margin-bottom:1rem">${escapeHtml(p.description)}</p>
            <p><strong>${t('stock_ok')}:</strong> ${p.stockQuantity}</p>
            <p class="delivery-note" style="margin-top:1rem">${escapeHtml(t('delivery_note'))}</p>
            <div class="form-group" style="margin-top:1rem;max-width:120px">
              <label>${t('qty')}</label>
              <input type="number" id="product-qty" min="1" max="${p.stockQuantity}" value="1" ${p.stockQuantity <= 0 ? 'disabled' : ''}>
            </div>
            <div class="product-actions" style="margin-top:1rem">
              <button type="button" class="btn btn-outline" data-add-cart="${p.id}" data-use-qty ${p.stockQuantity <= 0 ? 'disabled' : ''}>🛒 ${t('btn_add_cart')}</button>
              <button type="button" class="btn btn-primary" data-buy-now="${p.id}" data-use-qty ${p.stockQuantity <= 0 ? 'disabled' : ''}>${t('btn_buy')}</button>
            </div>
            <a href="${pageUrl('products.html')}" class="btn btn-outline" style="margin-top:1rem;display:inline-flex">← ${t('back_products')}</a>
          </div>
        </article>
      </section>`,
  });
});
