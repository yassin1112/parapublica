runPage(() => {
  const lines = getCartLines();

  const rows =
    lines.length === 0
      ? `<p style="color:var(--text-muted);text-align:center;padding:2rem">${t('cart_empty')} <a href="${pageUrl('products.html')}">${t('browse_products')}</a></p>`
      : lines
          .map((line) => {
            const lineTotal = line.price * line.quantity;
            return `
            <article class="cart-item card" data-animate>
              <img src="${escapeHtml(line.imageUrl || 'https://via.placeholder.com/80')}" alt="" class="cart-item-img">
              <div class="cart-item-info">
                <h3><a href="${pageUrl('product.html?slug=' + encodeURIComponent(line.slug))}">${escapeHtml(line.name)}</a></h3>
                <p class="price">${escapeHtml(formatPrice(line.price))} / ${t('unit')}</p>
                <div class="cart-item-controls">
                  <label>${t('qty')}</label>
                  <input type="number" min="1" max="${line.stockQuantity}" value="${line.quantity}" data-cart-qty="${line.productId}">
                  <button type="button" class="btn btn-sm btn-outline" data-cart-remove="${line.productId}">${t('btn_delete')}</button>
                </div>
              </div>
              <strong class="cart-item-total">${escapeHtml(formatPrice(lineTotal))}</strong>
            </article>`;
          })
          .join('');

  const orderItems = lines.map((l) => ({ unitPrice: l.price, quantity: l.quantity }));
  const { subtotal, deliveryFee, total } = calcOrderTotals(orderItems);

  mountLayout({
    title: t('cart_title'),
    activeNav: 'cart',
    mainHtml: `
      <section class="section container">
        <div class="section-header" data-animate>
          <h2>🛒 ${t('cart_title')}</h2>
          <p>${escapeHtml(t('delivery_note'))} · ${escapeHtml(t('payment_label'))}</p>
        </div>
        <div class="cart-layout">
          <div class="cart-items">${rows}</div>
          ${
            lines.length
              ? `<aside class="cart-summary card" data-animate>
                  <h3>${t('order_summary')}</h3>
                  <div class="checkout-totals">
                    <div><span>${t('subtotal')}</span><span>${escapeHtml(formatPrice(subtotal))}</span></div>
                    <div><span>${t('delivery_fee')}</span><span>${escapeHtml(formatPrice(deliveryFee))}</span></div>
                    <div class="checkout-total-final"><span>${t('total_final')}</span><strong>${escapeHtml(formatPrice(total))}</strong></div>
                  </div>
                  <p class="delivery-note">${escapeHtml(t('delivery_note'))}</p>
                  <p class="guest-checkout-hint"><span class="guest-pill">${t('guest_checkout_note')}</span></p>
                  <button type="button" class="btn btn-primary btn-glow" style="width:100%;margin-top:1rem" id="cart-checkout-btn">${t('btn_checkout')}</button>
                </aside>`
              : ''
          }
        </div>
      </section>`,
  });

  document.querySelectorAll('[data-cart-qty]').forEach((input) => {
    input.addEventListener('change', () => {
      const r = updateCartQty(input.dataset.cartQty, Number(input.value));
      if (r !== true) flash('error', typeof r === 'string' ? r : 'Error');
      window.location.reload();
    });
  });

  document.querySelectorAll('[data-cart-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.cartRemove);
      window.location.reload();
    });
  });

  document.getElementById('cart-checkout-btn')?.addEventListener('click', () => {
    const cartItems = getCartLines().map((l) => ({ productId: l.productId, quantity: l.quantity }));
    openCheckoutModal(cartItems, { clearCartOnSuccess: true });
  });
});
