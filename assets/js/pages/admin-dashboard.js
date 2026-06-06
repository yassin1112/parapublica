runPage(async () => {
  if (!requireAdmin()) return;
  const stats = await getStats();
  const lowProducts = getProducts()
    .filter((p) => p.stockQuantity <= p.lowStockThreshold)
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 8);

  const rawMovements = await getStockMovements(10);
  await getUsers();
  const movements = rawMovements.map((m) => {
    const p = getProductById(m.productId);
    const u = m.userId ? getUserById(m.userId) : null;
    return { ...m, productName: p?.name || '—', userName: u?.name || '—' };
  });

  const lowTable =
    lowProducts.length === 0
      ? ''
      : `<div class="card" style="margin-bottom:2rem" data-animate>
          <h3 style="margin-bottom:1rem;color:var(--warning)">⚠ ${t('stock_low')}</h3>
          <div class="table-wrap"><table>
            <thead><tr><th>${t('nav_products')}</th><th>STOCK</th><th>Min</th></tr></thead>
            <tbody>${lowProducts
              .map(
                (lp) =>
                  `<tr><td>${escapeHtml(lp.name)}</td><td>${lp.stockQuantity}</td><td>${lp.lowStockThreshold}</td></tr>`
              )
              .join('')}</tbody>
          </table></div>
        </div>`;

  mountLayout({
    title: t('admin_dashboard'),
    adminPage: 'dashboard',
    mainHtml: `
      <h1 style="margin-bottom:1.5rem">${t('admin_dashboard')}</h1>
      <div class="stats-grid">
        <div class="stat-card"><strong>${stats.totalProducts}</strong><span>${t('stat_products')}</span></div>
        <div class="stat-card"><strong>${stats.totalUnits}</strong><span>STOCK</span></div>
        <div class="stat-card"><strong>${stats.lowStock}</strong><span>${t('stat_alerts')}</span></div>
        <div class="stat-card"><strong>${stats.totalUsers}</strong><span>${t('admin_users')}</span></div>
      </div>
      ${lowTable}
      <div class="card" data-animate>
        <h3 style="margin-bottom:1rem">${t('admin_stock')}</h3>
        <div class="table-wrap"><table>
          <thead><tr><th>${t('nav_products')}</th><th>Type</th><th>Qty</th><th>Before</th><th>After</th><th>User</th><th>${t('date')}</th></tr></thead>
          <tbody>${movements
            .map(
              (m) =>
                `<tr>
                  <td>${escapeHtml(m.productName)}</td>
                  <td>${escapeHtml(movementLabel(m.movementType))}</td>
                  <td>${m.quantity}</td>
                  <td>${m.stockBefore}</td>
                  <td>${m.stockAfter}</td>
                  <td>${escapeHtml(m.userName)}</td>
                  <td>${escapeHtml(m.createdAt?.slice(0, 19).replace('T', ' ') || '')}</td>
                </tr>`
            )
            .join('')}</tbody>
        </table></div>
      </div>`,
  });
});
