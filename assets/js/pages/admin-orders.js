runPage(async () => {
  if (!requireAdmin()) return;

  let filterStatus = 'all';
  let searchQuery = '';
  let allOrders = await getAllOrders();
  let summary = await getOrdersStats();

  function filterOrders(orders) {
    let list = [...orders];
    if (filterStatus !== 'all') list = list.filter((o) => o.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((o) => {
        const hay = [o.id, o.firstName, o.lastName, o.email, o.phone, o.address].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }

  function statusBadgeClass(status) {
    return { pending: 'stock-low', confirmed: 'stock-ok', shipped: 'badge-cat', cancelled: 'stock-out' }[status] || 'badge-cat';
  }

  function renderOrdersTable(orders) {
    const filtered = filterOrders(orders);
    if (!filtered.length) {
      return `<div class="card orders-empty"><p>${t('orders_empty')}</p></div>`;
    }

    const rows = filtered
      .map((o) => {
        const itemsShort = o.items.map((i) => `${escapeHtml(i.name)} ×${i.quantity}`).join(', ');
        const statusOpts = ['pending', 'confirmed', 'shipped', 'cancelled']
          .map(
            (val) =>
              `<option value="${val}" ${o.status === val ? 'selected' : ''}>${escapeHtml(orderStatusLabel(val))}</option>`
          )
          .join('');
        const shortId = o.id.slice(-6).toUpperCase();

        const guestBadge = !o.userId
          ? `<span class="guest-pill guest-pill-sm">${t('guest_badge')}</span>`
          : '';

        return `
        <tr class="order-row">
          <td><strong>#${shortId}</strong></td>
          <td>
            <div class="order-customer-cell">
              <strong>${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)}</strong> ${guestBadge}
              <span>${escapeHtml(o.phone)}</span>
              <span class="order-email">${escapeHtml(o.email)}</span>
            </div>
          </td>
          <td class="order-items-cell">${itemsShort}</td>
          <td><span class="badge ${statusBadgeClass(o.status)}">${escapeHtml(orderStatusLabel(o.status))}</span></td>
          <td><strong>${escapeHtml(formatPrice(o.total))}</strong></td>
          <td class="order-date">${escapeHtml(o.createdAt?.slice(0, 16).replace('T', ' ') || '')}</td>
          <td><button type="button" class="btn btn-sm btn-outline" data-view-order="${o.id}">${t('view_details')}</button></td>
          <td><select class="order-status-select" data-order-status="${o.id}">${statusOpts}</select></td>
        </tr>`;
      })
      .join('');

    return `
      <div class="table-wrap orders-table-wrap">
        <table class="orders-table">
          <thead>
            <tr>
              <th>#</th><th>${t('customer')}</th><th>${t('products_col')}</th><th>${t('update_status')}</th>
              <th>${t('total_final')}</th><th>${t('date')}</th><th></th><th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function renderOrderModalContent(o) {
    const items = o.items
      .map((i) => `<li>${escapeHtml(i.name)} × ${i.quantity} — ${escapeHtml(formatPrice(i.unitPrice * i.quantity))}</li>`)
      .join('');
    return `
      <p><strong>${t('customer')}:</strong> ${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)}</p>
      <p><strong>${t('phone')}:</strong> ${escapeHtml(o.phone)}</p>
      <p><strong>${t('email')}:</strong> ${escapeHtml(o.email)}</p>
      <p><strong>${t('address')}:</strong> ${escapeHtml(o.address)}</p>
      <ul class="order-modal-items">${items}</ul>
      <div class="checkout-totals" style="margin-top:1rem">
        <div><span>${t('subtotal')}</span><span>${escapeHtml(formatPrice(o.subtotal))}</span></div>
        <div><span>${t('delivery_fee')}</span><span>${escapeHtml(formatPrice(o.deliveryFee))}</span></div>
        <div class="checkout-total-final"><span>${t('total_final')}</span><strong>${escapeHtml(formatPrice(o.total))}</strong></div>
      </div>
      <p class="delivery-note">${escapeHtml(o.deliveryNote || t('delivery_note'))}</p>
      <p class="payment-note">${escapeHtml(o.paymentMethod || t('payment_label'))}</p>`;
  }

  function mountOrderModal() {
    if (document.getElementById('order-detail-modal')) return;
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class="modal-overlay" id="order-detail-modal" hidden>
        <div class="modal-card order-detail-card">
          <button type="button" class="modal-close" data-close-order-modal aria-label="${t('close')}">×</button>
          <h2>${t('order_details')}</h2>
          <div id="order-detail-body"></div>
        </div>
      </div>`
    );
    document.getElementById('order-detail-modal').addEventListener('click', (e) => {
      if (e.target.id === 'order-detail-modal' || e.target.closest('[data-close-order-modal]')) {
        document.getElementById('order-detail-modal').hidden = true;
        document.body.classList.remove('modal-open');
      }
    });
  }

  function openOrderModal(orderId) {
    mountOrderModal();
    const o = allOrders.find((x) => x.id === orderId);
    if (!o) return;
    document.getElementById('order-detail-body').innerHTML = renderOrderModalContent(o);
    document.getElementById('order-detail-modal').hidden = false;
    document.body.classList.add('modal-open');
  }

  function renderPage() {
    return `
      <div class="orders-page-header">
        <div>
          <h1>${t('orders_title')}</h1>
          <p class="orders-sub">${t('orders_sub')}</p>
        </div>
        <button type="button" class="btn btn-outline btn-refresh" id="orders-refresh-btn">↻ ${t('orders_refresh')}</button>
      </div>
      <div class="stats-grid orders-stats" id="orders-stats-grid">
        <div class="stat-card"><strong>${summary.total}</strong><span>${t('orders_total')}</span></div>
        <div class="stat-card"><strong>${summary.pending}</strong><span>${t('orders_pending')}</span></div>
        <div class="stat-card"><strong>${escapeHtml(formatPrice(summary.revenue))}</strong><span>${t('orders_revenue')}</span></div>
      </div>
      <div class="card orders-toolbar" data-animate>
        <div class="orders-filters">
          <input type="search" id="orders-search" placeholder="${t('orders_search_ph')}" value="${escapeHtml(searchQuery)}">
          <select id="orders-status-filter">
            ${['all', 'pending', 'confirmed', 'shipped', 'cancelled']
              .map((s) => {
                const label = s === 'all' ? t('status_all') : orderStatusLabel(s);
                return `<option value="${s}" ${filterStatus === s ? 'selected' : ''}>${escapeHtml(label)}</option>`;
              })
              .join('')}
          </select>
        </div>
        <p class="delivery-note">${escapeHtml(t('delivery_note'))}</p>
      </div>
      <div id="orders-table-container">${renderOrdersTable(allOrders)}</div>`;
  }

  function renderStats() {
    const grid = document.getElementById('orders-stats-grid');
    if (!grid) return;
    grid.innerHTML = `
      <div class="stat-card"><strong>${summary.total}</strong><span>${t('orders_total')}</span></div>
      <div class="stat-card"><strong>${summary.pending}</strong><span>${t('orders_pending')}</span></div>
      <div class="stat-card"><strong>${escapeHtml(formatPrice(summary.revenue))}</strong><span>${t('orders_revenue')}</span></div>`;
  }

  async function reloadOrders() {
    const btn = document.getElementById('orders-refresh-btn');
    btn?.setAttribute('disabled', 'true');
    try {
      allOrders = await getAllOrders();
      summary = await getOrdersStats();
      renderStats();
      refreshOrdersUI();
      flash('success', t('orders_refreshed'));
    } catch (e) {
      flash('error', e.message || t('err_api'));
    } finally {
      btn?.removeAttribute('disabled');
    }
  }

  function refreshOrdersUI() {
    document.getElementById('orders-table-container').innerHTML = renderOrdersTable(allOrders);
    bindOrdersEvents();
  }

  function bindOrdersEvents() {
    document.querySelectorAll('[data-order-status]').forEach((sel) => {
      sel.onchange = async (e) => {
        await updateOrderStatus(e.target.dataset.orderStatus, e.target.value);
        const o = allOrders.find((x) => x.id === e.target.dataset.orderStatus);
        if (o) o.status = e.target.value;
        flash('success', t('flash_order_status'));
      };
    });
    document.querySelectorAll('[data-view-order]').forEach((btn) => {
      btn.onclick = () => openOrderModal(btn.dataset.viewOrder);
    });
  }

  mountLayout({
    title: t('orders_title'),
    adminPage: 'orders',
    mainHtml: renderPage(),
  });

  document.getElementById('orders-search')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    refreshOrdersUI();
  });

  document.getElementById('orders-status-filter')?.addEventListener('change', (e) => {
    filterStatus = e.target.value;
    refreshOrdersUI();
  });

  document.getElementById('orders-refresh-btn')?.addEventListener('click', () => reloadOrders());

  bindOrdersEvents();
});
