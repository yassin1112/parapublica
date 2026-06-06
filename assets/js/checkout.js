let checkoutItems = [];

function remountCheckoutModal() {
  document.getElementById('checkout-modal')?.remove();
  delete document.body.dataset.checkoutBound;
  mountCheckoutModal();
}

function mountCheckoutModal() {
  if (document.body.dataset.checkoutBound) return;
  document.body.dataset.checkoutBound = '1';

  document.body.insertAdjacentHTML(
    'beforeend',
    `
    <div class="modal-overlay checkout-modal-wrap" id="checkout-modal" hidden aria-hidden="true">
      <div class="modal-card checkout-modal-card" role="dialog" aria-labelledby="checkout-title">
        <button type="button" class="modal-close" data-close-modal aria-label="${t('close')}">×</button>
        <div class="checkout-modal-header">
          <h2 id="checkout-title">${t('checkout_title')}</h2>
          <span class="guest-pill">${t('guest_checkout_note')}</span>
        </div>
        <p class="delivery-note">${escapeHtml(t('delivery_note'))}</p>
        <p class="payment-note">${escapeHtml(t('payment_label'))}</p>
        <div id="checkout-summary" class="checkout-summary"></div>
        <form id="checkout-form">
          <div class="form-row">
            <div class="form-group">
              <label for="co-firstName">${t('first_name')}</label>
              <input id="co-firstName" name="firstName" required autocomplete="given-name">
            </div>
            <div class="form-group">
              <label for="co-lastName">${t('last_name')}</label>
              <input id="co-lastName" name="lastName" required autocomplete="family-name">
            </div>
          </div>
          <div class="form-group">
            <label for="co-phone">${t('phone')}</label>
            <input id="co-phone" name="phone" type="tel" required placeholder="${t('phone_ph')}" autocomplete="tel">
          </div>
          <div class="form-group">
            <label for="co-email">${t('email')}</label>
            <input id="co-email" name="email" type="email" required autocomplete="email">
          </div>
          <div class="form-group">
            <label for="co-address">${t('address')}</label>
            <textarea id="co-address" name="address" rows="2" required placeholder="${t('address_ph')}" autocomplete="street-address"></textarea>
          </div>
          <div id="checkout-form-error" class="alert alert-error" style="display:none"></div>
          <button type="submit" class="btn btn-primary btn-glow" style="width:100%" id="checkout-submit-btn">${t('btn_confirm_order')}</button>
        </form>
      </div>
    </div>`
  );

  const modal = document.getElementById('checkout-modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-close-modal]')) closeCheckoutModal();
  });

  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    submitCheckout(e.target);
  });
}

function renderCheckoutSummary(items) {
  const lines = items
    .map((item) => {
      const p = getProductById(item.productId);
      if (!p) return '';
      const qty = item.quantity;
      const lineTotal = p.price * qty;
      return `<div class="checkout-line">
        <span>${escapeHtml(p.name)} × ${qty}</span>
        <strong>${escapeHtml(formatPrice(lineTotal))}</strong>
      </div>`;
    })
    .join('');

  const orderItems = items.map((i) => {
    const p = getProductById(i.productId);
    return { unitPrice: p?.price || 0, quantity: i.quantity };
  });
  const { subtotal, deliveryFee, total } = calcOrderTotals(orderItems);

  return `
    ${lines}
    <div class="checkout-totals">
      <div><span>${t('subtotal')}</span><span>${escapeHtml(formatPrice(subtotal))}</span></div>
      <div><span>${t('delivery_fee')}</span><span>${escapeHtml(formatPrice(deliveryFee))}</span></div>
      <div class="checkout-total-final"><span>${t('total_final')}</span><strong>${escapeHtml(formatPrice(total))}</strong></div>
    </div>`;
}

function openCheckoutModal(items, { clearCartOnSuccess = false } = {}) {
  if (!isApiOnline()) {
    flash('error', t('err_api'));
    return;
  }
  mountCheckoutModal();
  checkoutItems = items
    .filter((i) => i.quantity > 0)
    .map((i) => ({ productId: normId(i.productId), quantity: i.quantity }));

  if (!checkoutItems.length) {
    flash('error', t('err_empty_cart'));
    return;
  }

  const user = getCurrentUser();
  const form = document.getElementById('checkout-form');
  if (user) {
    const parts = user.name.trim().split(/\s+/);
    form.firstName.value = parts[0] || '';
    form.lastName.value = parts.slice(1).join(' ') || '';
    form.email.value = user.email || '';
    form.phone.value = user.phone || '';
  }

  document.getElementById('checkout-summary').innerHTML = renderCheckoutSummary(checkoutItems);
  const modal = document.getElementById('checkout-modal');
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  form.dataset.clearCart = clearCartOnSuccess ? '1' : '0';
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

async function submitCheckout(form) {
  const errEl = document.getElementById('checkout-form-error');
  const btn = document.getElementById('checkout-submit-btn');
  errEl.style.display = 'none';
  btn.disabled = true;

  const user = getCurrentUser();
  const result = await createOrder({
    userId: user?.id || null,
    firstName: form.firstName.value,
    lastName: form.lastName.value,
    phone: form.phone.value,
    email: form.email.value,
    address: form.address.value,
    items: checkoutItems,
  });

  btn.disabled = false;

  if (result.error) {
    errEl.textContent = result.error;
    errEl.style.display = 'block';
    return;
  }

  if (form.dataset.clearCart === '1') clearCart();
  updateCartBadge();
  closeCheckoutModal();

  const o = result.order;
  sessionStorage.setItem('last_order', JSON.stringify(o));
  window.location.href = pageUrl(
    `order-success.html?orderId=${encodeURIComponent(o.id)}&email=${encodeURIComponent(o.email)}`
  );
}

function bindShopActions() {
  if (document.body.dataset.shopBound) return;
  document.body.dataset.shopBound = '1';

  document.body.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add-cart]');
    const buyBtn = e.target.closest('[data-buy-now]');
    if (addBtn && !addBtn.disabled) {
      let qty = 1;
      if (addBtn.dataset.useQty) {
        qty = Number(document.getElementById('product-qty')?.value) || 1;
      }
      const r = addToCart(addBtn.dataset.addCart, qty);
      if (r === true) {
        flash('success', t('flash_cart_added'));
        updateCartBadge();
      } else {
        flash('error', r);
      }
    }
    if (buyBtn && !buyBtn.disabled) {
      let qty = 1;
      if (buyBtn.dataset.useQty) {
        qty = Number(document.getElementById('product-qty')?.value) || 1;
      }
      openCheckoutModal([{ productId: buyBtn.dataset.buyNow, quantity: qty }]);
    }
  });
}
