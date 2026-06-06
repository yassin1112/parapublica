runPage(async () => {
  if (!requireLogin()) return;
  const user = getCurrentUser();
  const tab = getQueryParam('tab') || 'profile';

  let content = '';
  if (tab === 'orders') {
    const orders = await getOrdersForUser(user.id);
    content =
      orders.length === 0
        ? `<div class="card"><p style="color:var(--text-muted)">${t('no_orders')}</p></div>`
        : orders
            .map((o) => {
              const items = o.items.map((i) => `${escapeHtml(i.name)} × ${i.quantity}`).join(', ');
              return `
              <article class="card" style="margin-bottom:1rem">
                <p><strong>${t('order_num')} #${o.id.slice(-6).toUpperCase()}</strong> — ${escapeHtml(orderStatusLabel(o.status))}</p>
                <p style="font-size:.9rem;color:var(--text-muted)">${escapeHtml(o.createdAt?.slice(0, 10) || '')}</p>
                <p>${items}</p>
                <p>${t('subtotal')}: ${escapeHtml(formatPrice(o.subtotal))} + ${t('delivery_fee')} ${escapeHtml(formatPrice(o.deliveryFee))}</p>
                <p class="price">${t('total_final')}: ${escapeHtml(formatPrice(o.total))}</p>
                <p class="delivery-note">${escapeHtml(o.deliveryNote || t('delivery_note'))}</p>
              </article>`;
            })
            .join('');
    content = `<h2 style="margin-bottom:1rem">${t('account_orders')}</h2>${content}`;
  } else {
    content = `
      <h2 style="margin-bottom:1rem">${t('account_profile')}</h2>
      <div class="card">
        <form id="profile-form">
          <div class="form-group"><label>${t('name')}</label><input name="name" value="${escapeHtml(user.name)}" required></div>
          <div class="form-group"><label>${t('email')}</label><input value="${escapeHtml(user.email)}" disabled></div>
          <div class="form-group"><label>${t('phone')}</label><input name="phone" value="${escapeHtml(user.phone || '')}"></div>
          <div class="form-group"><label>Role</label><input value="${user.role === 'admin' ? t('role_admin') : t('role_customer')}" disabled></div>
          <button type="submit" class="btn btn-primary">${t('btn_save')}</button>
        </form>
        <p style="margin-top:1.25rem;font-size:.9rem"><a href="${pageUrl('forgot-password.html')}">${t('forgot_password')}</a></p>
      </div>`;
  }

  mountLayout({
    title: t('nav_account'),
    activeNav: 'account',
    mainHtml: `
      <section class="container account-layout">
        <aside class="account-sidebar" data-animate>
          <p style="font-weight:700;margin-bottom:1rem">${escapeHtml(user.name)}</p>
          <a href="${pageUrl('account.html')}" class="${tab === 'profile' ? 'active' : ''}">${t('account_profile')}</a>
          <a href="${pageUrl('account.html?tab=orders')}" class="${tab === 'orders' ? 'active' : ''}">${t('account_orders')}</a>
          ${user.role === 'admin' ? `<a href="admin/index.html" class="nav-admin">${t('nav_admin')}</a>` : ''}
        </aside>
        <div data-animate>${content}</div>
      </section>`,
  });

  document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateUserProfile(e.target.name.value.trim(), e.target.phone.value.trim());
    flash('success', t('flash_profile_saved'));
    window.location.reload();
  });
});
