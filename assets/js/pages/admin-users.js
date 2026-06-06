runPage(async () => {
  if (!requireAdmin()) return;
  const current = getCurrentUser();
  const users = (await getUsers()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  mountLayout({
    title: t('admin_users'),
    adminPage: 'users',
    mainHtml: `
      <h1 style="margin-bottom:1.5rem">${t('admin_users')}</h1>
      <div class="table-wrap" data-animate>
        <table>
          <thead>
            <tr><th>${t('name')}</th><th>${t('email')}</th><th>Role</th><th>${t('phone')}</th><th>Status</th><th>${t('date')}</th><th></th></tr>
          </thead>
          <tbody id="users-tbody">${users
            .map((u) => {
              const toggleBtn =
                u.id !== current.id
                  ? `<button type="button" class="btn btn-sm btn-outline" data-toggle="${u.id}">${u.isActive ? 'Off' : 'On'}</button>`
                  : '';
              return `<tr>
                <td>${escapeHtml(u.name)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td>${u.role === 'admin' ? t('role_admin') : t('role_customer')}</td>
                <td>${escapeHtml(u.phone || '—')}</td>
                <td>${u.isActive ? '✓' : '—'}</td>
                <td>${escapeHtml(u.createdAt?.slice(0, 10) || '')}</td>
                <td>${toggleBtn}</td>
              </tr>`;
            })
            .join('')}</tbody>
        </table>
      </div>`,
  });

  document.getElementById('users-tbody').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-toggle]');
    if (!btn) return;
    await toggleUserActive(btn.dataset.toggle);
    flash('success', t('flash_profile_saved'));
    window.location.reload();
  });
});
