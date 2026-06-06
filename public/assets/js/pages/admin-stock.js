runPage(async () => {
  if (!requireAdmin()) return;
  const products = getProducts().sort((a, b) => a.name.localeCompare(b.name));

  const productOpts = products
    .map((p) => `<option value="${p.id}">${escapeHtml(p.name)} — ${p.stockQuantity}</option>`)
    .join('');

  const types = ['in', 'out', 'sale', 'return', 'adjustment'];
  const typeOpts = types
    .map((k) => `<option value="${k}">${escapeHtml(movementLabel(k))}</option>`)
    .join('');

  const rawMovements = await getStockMovements(50);
  await getUsers();
  const movements = rawMovements.map((m) => {
    const p = getProductById(m.productId);
    const u = m.userId ? getUserById(m.userId) : null;
    return { ...m, productName: p?.name || '—', userName: u?.name || '—' };
  });

  mountLayout({
    title: t('admin_stock'),
    adminPage: 'stock',
    mainHtml: `
      <h1 style="margin-bottom:1.5rem">${t('admin_stock')}</h1>
      <div class="card" style="margin-bottom:2rem" data-animate>
        <form id="stock-form">
          <div id="stock-error" class="alert alert-error" style="display:none"></div>
          <div class="form-row">
            <div class="form-group">
              <label>${t('nav_products')}</label>
              <select name="productId" required>${productOpts}</select>
            </div>
            <div class="form-group">
              <label>Type</label>
              <select name="movementType">${typeOpts}</select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>${t('qty')}</label>
              <input type="number" name="quantity" min="0" required value="1">
            </div>
            <div class="form-group">
              <label>Note</label>
              <input name="note">
            </div>
          </div>
          <button type="submit" class="btn btn-primary">${t('btn_save')}</button>
        </form>
      </div>
      <div class="table-wrap" data-animate>
        <table>
          <thead>
            <tr><th>#</th><th>${t('nav_products')}</th><th>Type</th><th>Δ</th><th>Before</th><th>After</th><th>${t('date')}</th></tr>
          </thead>
          <tbody>${movements
            .map(
              (m) =>
                `<tr>
                  <td>${m.id.slice(-6)}</td>
                  <td>${escapeHtml(m.productName)}</td>
                  <td>${escapeHtml(movementLabel(m.movementType))}</td>
                  <td>${m.quantity}</td>
                  <td>${m.stockBefore}</td>
                  <td>${m.stockAfter}</td>
                  <td>${escapeHtml(m.createdAt?.slice(0, 16).replace('T', ' ') || '')}</td>
                </tr>`
            )
            .join('')}</tbody>
        </table>
      </div>`,
  });

  document.getElementById('stock-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const result = await adjustStock(
      fd.get('productId'),
      fd.get('movementType'),
      fd.get('quantity'),
      fd.get('note')
    );
    const err = document.getElementById('stock-error');
    if (result !== true) {
      err.textContent = result;
      err.style.display = 'block';
      return;
    }
    flash('success', t('flash_order_status'));
    window.location.reload();
  });
});
