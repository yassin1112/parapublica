runPage(async () => {
  if (!requireAdmin()) return;
  const categories = getCategories();
  const tbody = () => document.getElementById('products-tbody');

  function renderTable() {
    return getProducts()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => {
        const st = stockStatus(p.stockQuantity, p.lowStockThreshold);
        return `<tr data-product-id="${p.id}">
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(getCategoryName(p.categoryId) || '—')}</td>
          <td>${escapeHtml(formatPrice(p.price))}</td>
          <td>
            <form class="stock-inline-form" data-stock-form="${p.id}" style="display:flex;gap:.35rem;align-items:center">
              <input type="number" name="stockQuantity" value="${p.stockQuantity}" min="0" style="width:4.5rem;padding:.35rem .5rem">
              <button type="submit" class="btn btn-sm btn-primary" title="${t('btn_save')}">✓</button>
            </form>
            <span class="badge ${st.class}" style="margin-top:.25rem;display:inline-block">${st.label}</span>
          </td>
          <td>${p.isActive ? '✓' : '—'}</td>
          <td style="white-space:nowrap">
            <button type="button" class="btn btn-sm btn-outline" data-edit="${p.id}">${t('btn_edit')}</button>
            <button type="button" class="btn btn-sm btn-outline" data-toggle="${p.id}">${t('btn_toggle')}</button>
            <button type="button" class="btn btn-sm btn-danger" data-delete="${p.id}">${t('btn_delete')}</button>
          </td>
        </tr>`;
      })
      .join('');
  }

  function refreshTable() {
    const el = tbody();
    if (el) el.innerHTML = renderTable();
  }

  const catOpts = categories
    .map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
    .join('');

  mountLayout({
    title: t('admin_products'),
    adminPage: 'products',
    mainHtml: `
      <h1 style="margin-bottom:1.5rem">${t('admin_products')}</h1>
      <div id="products-page-error" class="alert alert-error" style="display:none;margin-bottom:1rem"></div>
      <div class="card" style="margin-bottom:2rem" data-animate>
        <h3 style="margin-bottom:1rem">${t('btn_add')}</h3>
        <form id="add-product-form">
          <div class="form-row">
            <div class="form-group"><label>${t('name')}</label><input name="name" required></div>
            <div class="form-group"><label>Slug</label><input name="slug" placeholder="${t('slug_auto')}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>${t('category')}</label><select name="categoryId"><option value="">—</option>${catOpts}</select></div>
            <div class="form-group"><label>${t('price')}</label><input type="number" step="0.01" name="price" required min="0"></div>
          </div>
          <div class="form-group"><label>${t('description')}</label><textarea name="description" rows="2"></textarea></div>
          <div class="form-group"><label>${t('image_url')}</label><input name="imageUrl" placeholder="https://..."></div>
          <div class="form-row">
            <div class="form-group"><label>${t('stock_qty')}</label><input type="number" name="stockQuantity" value="0" min="0"></div>
            <div class="form-group"><label>${t('stock_alert')}</label><input type="number" name="lowStockThreshold" value="5" min="0"></div>
          </div>
          <button type="submit" class="btn btn-primary">${t('btn_add')}</button>
        </form>
      </div>
      <div class="table-wrap" data-animate>
        <table>
          <thead><tr><th>${t('name')}</th><th>${t('category')}</th><th>${t('price')}</th><th>${t('stock_qty')}</th><th>${t('active')}</th><th></th></tr></thead>
          <tbody id="products-tbody">${renderTable()}</tbody>
        </table>
      </div>
      <dialog id="edit-product-dialog" class="checkout-modal">
        <form id="edit-product-form" method="dialog">
          <h3 style="margin-bottom:1rem">${t('btn_edit')}</h3>
          <input type="hidden" name="id">
          <div class="form-row">
            <div class="form-group"><label>${t('name')}</label><input name="name" required></div>
            <div class="form-group"><label>Slug</label><input name="slug"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>${t('category')}</label><select name="categoryId"><option value="">—</option>${catOpts}</select></div>
            <div class="form-group"><label>${t('price')}</label><input type="number" step="0.01" name="price" required min="0"></div>
          </div>
          <div class="form-group"><label>${t('description')}</label><textarea name="description" rows="2"></textarea></div>
          <div class="form-group"><label>${t('image_url')}</label><input name="imageUrl"></div>
          <div class="form-row">
            <div class="form-group"><label>${t('stock_qty')}</label><input type="number" name="stockQuantity" min="0"></div>
            <div class="form-group"><label>${t('stock_alert')}</label><input type="number" name="lowStockThreshold" min="0"></div>
          </div>
          <div style="display:flex;gap:.5rem;margin-top:1rem">
            <button type="submit" class="btn btn-primary">${t('btn_save')}</button>
            <button type="button" class="btn btn-outline" data-close-edit>${t('close')}</button>
          </div>
        </form>
      </dialog>`,
  });

  const pageError = document.getElementById('products-page-error');
  const addForm = document.getElementById('add-product-form');

  function showError(msg) {
    pageError.textContent = msg;
    pageError.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function clearError() {
    pageError.style.display = 'none';
    pageError.textContent = '';
  }

  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    const fd = new FormData(e.target);
    const submitBtn = addForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    try {
      const slugRaw = String(fd.get('slug') || '').trim();
      await addProduct({
        name: fd.get('name'),
        slug: slugRaw || slugify(fd.get('name')),
        categoryId: fd.get('categoryId'),
        description: fd.get('description'),
        price: fd.get('price'),
        imageUrl: fd.get('imageUrl'),
        stockQuantity: fd.get('stockQuantity'),
        lowStockThreshold: fd.get('lowStockThreshold'),
      });
      addForm.reset();
      refreshTable();
      flash('success', t('product_added'));
    } catch (err) {
      showError(err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });

  const editDialog = document.getElementById('edit-product-dialog');
  const editForm = document.getElementById('edit-product-form');

  document.querySelector('[data-close-edit]')?.addEventListener('click', () => editDialog.close());

  document.getElementById('products-tbody').addEventListener('click', async (e) => {
    const toggle = e.target.closest('[data-toggle]');
    const del = e.target.closest('[data-delete]');
    const editBtn = e.target.closest('[data-edit]');

    if (editBtn) {
      const p = getProductById(editBtn.dataset.edit);
      if (!p) return;
      editForm.id.value = p.id;
      editForm.name.value = p.name;
      editForm.slug.value = p.slug;
      editForm.categoryId.value = p.categoryId || '';
      editForm.price.value = p.price;
      editForm.description.value = p.description || '';
      editForm.imageUrl.value = p.imageUrl || '';
      editForm.stockQuantity.value = p.stockQuantity;
      editForm.lowStockThreshold.value = p.lowStockThreshold;
      editDialog.showModal();
      return;
    }

    if (toggle) {
      clearError();
      try {
        await toggleProductActive(toggle.dataset.toggle);
        refreshTable();
        flash('success', t('btn_toggle'));
      } catch (err) {
        showError(err.message);
      }
    }

    if (del && confirm(t('confirm_delete'))) {
      clearError();
      try {
        await deleteProduct(del.dataset.delete);
        refreshTable();
        flash('success', t('btn_delete'));
      } catch (err) {
        showError(err.message);
      }
    }
  });

  document.getElementById('products-tbody').addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-stock-form]');
    if (!form) return;
    e.preventDefault();
    clearError();
    const id = form.dataset.stockForm;
    const qty = Number(new FormData(form).get('stockQuantity'));
    try {
      const result = await setProductStock(id, qty);
      if (result !== true) {
        showError(result);
        return;
      }
      refreshTable();
      flash('success', t('stock_updated'));
    } catch (err) {
      showError(err.message);
    }
  });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    const fd = new FormData(editForm);
    try {
      await updateProduct(fd.get('id'), {
        name: fd.get('name'),
        slug: fd.get('slug'),
        categoryId: fd.get('categoryId'),
        description: fd.get('description'),
        price: fd.get('price'),
        imageUrl: fd.get('imageUrl'),
        stockQuantity: fd.get('stockQuantity'),
        lowStockThreshold: fd.get('lowStockThreshold'),
      });
      editDialog.close();
      refreshTable();
      flash('success', t('product_saved'));
    } catch (err) {
      showError(err.message);
    }
  });
});
