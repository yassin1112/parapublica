runPage(async () => {
  const orderId = getQueryParam('orderId');
  const email = getQueryParam('email');
  let order = null;

  try {
    const cached = sessionStorage.getItem('last_order');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.id === orderId) order = parsed;
    }
    if (!order && orderId && email) {
      order = await trackOrder(orderId, email);
    }
  } catch {
    order = null;
  }

  if (!order) {
    mountLayout({
      title: t('order_success_title'),
      activeNav: '',
      mainHtml: `
        <section class="section container">
          <div class="card order-success-card" style="text-align:center;padding:2.5rem">
            <p>${t('product_not_found')}</p>
            <a href="${pageUrl('index.html')}" class="btn btn-primary" style="margin-top:1rem">${t('nav_home')}</a>
          </div>
        </section>`,
    });
    return;
  }

  const shortId = order.id.slice(-6).toUpperCase();
  const itemsHtml = order.items
    .map(
      (i) =>
        `<li><span>${escapeHtml(i.name)} × ${i.quantity}</span><strong>${escapeHtml(formatPrice(i.unitPrice * i.quantity))}</strong></li>`
    )
    .join('');

  mountLayout({
    title: t('order_success_title'),
    activeNav: '',
    mainHtml: `
      <section class="section container">
        <div class="order-success-card card" data-animate>
          <div class="success-icon">✓</div>
          <h1>${t('order_success_title')}</h1>
          <p class="order-success-sub">${t('order_success_sub')}</p>
          <div class="order-id-badge">#${shortId}</div>
          <p class="track-order-hint">${t('track_order_hint')}</p>
          <div class="order-success-details">
            <p><strong>${t('customer')}:</strong> ${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}</p>
            <p><strong>${t('phone')}:</strong> ${escapeHtml(order.phone)}</p>
            <p><strong>${t('email')}:</strong> ${escapeHtml(order.email)}</p>
            <p><strong>${t('address')}:</strong> ${escapeHtml(order.address)}</p>
            <ul class="order-success-items">${itemsHtml}</ul>
            <div class="checkout-totals">
              <div><span>${t('subtotal')}</span><span>${escapeHtml(formatPrice(order.subtotal))}</span></div>
              <div><span>${t('delivery_fee')}</span><span>${escapeHtml(formatPrice(order.deliveryFee))}</span></div>
              <div class="checkout-total-final"><span>${t('total_final')}</span><strong>${escapeHtml(formatPrice(order.total))}</strong></div>
            </div>
            <p class="delivery-note">${escapeHtml(order.deliveryNote || t('delivery_note'))}</p>
            <span class="badge ${order.status === 'pending' ? 'stock-low' : 'stock-ok'}">${escapeHtml(orderStatusLabel(order.status))}</span>
          </div>
          <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1.5rem;justify-content:center">
            <a href="${pageUrl('products.html')}" class="btn btn-primary btn-glow">${t('continue_shopping')}</a>
            ${getCurrentUser() ? `<a href="${pageUrl('account.html?tab=orders')}" class="btn btn-outline">${t('account_orders')}</a>` : ''}
          </div>
        </div>
      </section>`,
  });

  sessionStorage.removeItem('last_order');
});
