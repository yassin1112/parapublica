const catalog = { categories: [], products: [], users: [] };
let apiOnline = true;

async function initDb() {
  try {
    await refreshCatalog();
    apiOnline = true;
    if (getToken()) await refreshCurrentUser();
  } catch (e) {
    apiOnline = false;
    console.error(e);
  }
}

function isApiOnline() {
  return apiOnline;
}

async function refreshCatalog() {
  const [categories, products] = await Promise.all([
    api('/categories'),
    api('/products'),
  ]);
  catalog.categories = categories;
  catalog.products = products;
}

function getCategories() {
  return catalog.categories;
}

function getCategoryName(id) {
  if (!id) return '';
  const cid = normId(id);
  const c = catalog.categories.find((x) => normId(x.id) === cid);
  return c ? c.name : '';
}

function getProducts(activeOnly = false) {
  let list = catalog.products;
  if (activeOnly) list = list.filter((p) => p.isActive);
  return list;
}

function getProductBySlug(slug) {
  return getProducts().find((p) => p.slug === slug && p.isActive);
}

function getProductById(id) {
  const pid = normId(id);
  return getProducts().find((p) => normId(p.id) === pid);
}

async function getUsers() {
  catalog.users = await api('/users');
  return catalog.users;
}

function getUserById(id) {
  return catalog.users.find((u) => normId(u.id) === normId(id));
}

async function getStockMovements(limit = 50) {
  return api(`/stock/movements?limit=${limit}`);
}

async function getOrdersForUser() {
  return api('/orders');
}

async function getAllOrders() {
  return api('/orders/all');
}

async function trackOrder(orderId, email) {
  const q = new URLSearchParams({ orderId, email });
  const { order } = await api(`/orders/track?${q}`);
  return order;
}

async function updateOrderStatus(orderId, status) {
  await api(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return true;
}

async function createOrder(payload) {
  try {
    const { order } = await api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        items: payload.items.map((i) => ({
          productId: normId(i.productId),
          quantity: i.quantity,
        })),
        paymentMethod: t('payment_label'),
        deliveryNote: t('delivery_note'),
      }),
    });
    await refreshCatalog();
    return { order };
  } catch (e) {
    return { error: e.message };
  }
}

async function updateUserProfile(name, phone) {
  const { user } = await api('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify({ name, phone }),
  });
  setSession(user, getToken());
  return true;
}

async function toggleUserActive(userId) {
  await api(`/users/${userId}/toggle`, { method: 'PATCH' });
}

async function addProduct(data) {
  const product = await api('/products', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      slug: data.slug || undefined,
      categoryId: data.categoryId || null,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold,
    }),
  });
  await refreshCatalog();
  return product;
}

async function toggleProductActive(id) {
  await api(`/products/${id}/toggle`, { method: 'PATCH' });
  await refreshCatalog();
}

async function deleteProduct(id) {
  await api(`/products/${id}`, { method: 'DELETE' });
  await refreshCatalog();
}

async function updateProduct(id, data) {
  await api(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  await refreshCatalog();
}

async function setProductStock(productId, quantity, note = 'Stock update') {
  return adjustStock(productId, 'adjustment', quantity, note);
}

async function adjustStock(productId, type, quantity, note) {
  try {
    await api('/stock/adjust', {
      method: 'POST',
      body: JSON.stringify({
        productId: normId(productId),
        movementType: type,
        quantity,
        note,
      }),
    });
    await refreshCatalog();
    return true;
  } catch (e) {
    return e.message;
  }
}

async function getStats() {
  return api('/stats/dashboard');
}

async function getHomeStats() {
  return api('/stats/home');
}

function getHomeStatsFromCatalog() {
  const products = getProducts(true);
  return {
    products: products.length,
    clients: 0,
    lowStock: products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length,
  };
}

async function getOrdersStats() {
  return api('/stats/orders-summary');
}

function productActionsHtml(p) {
  const out = p.stockQuantity <= 0;
  const dis = out ? 'disabled' : '';
  return `
    <div class="product-actions">
      <button type="button" class="btn btn-sm btn-outline" data-add-cart="${p.id}" ${dis}>🛒 ${t('btn_add_cart')}</button>
      <button type="button" class="btn btn-sm btn-primary" data-buy-now="${p.id}" ${dis}>${t('btn_buy')}</button>
    </div>`;
}

function productPriceHtml(p) {
  const hasSale = p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price);
  if (hasSale) {
    const save = Number(p.compareAtPrice) - Number(p.price);
    return `
      <div class="price-row">
        <span class="price-old">${escapeHtml(formatPrice(p.compareAtPrice))}</span>
        <span class="price-current">${escapeHtml(formatPrice(p.price))}</span>
      </div>
      <span class="badge-sale" style="margin-top:.35rem;display:inline-block">-${escapeHtml(formatPrice(save))}</span>`;
  }
  return `<div class="price-row"><span class="price-current">${escapeHtml(formatPrice(p.price))}</span></div>`;
}

function productCardHtml(p, base) {
  const st = stockStatus(p.stockQuantity, p.lowStockThreshold);
  const cat = getCategoryName(p.categoryId);
  const desc = (p.description || '').slice(0, 72);
  const hasSale = p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price);
  const out = p.stockQuantity <= 0;
  return `
    <article class="product-card" data-animate>
      <a href="${base}/product.html?slug=${encodeURIComponent(p.slug)}" class="product-card-image">
        <div class="product-card-badges">
          ${hasSale ? '<span class="badge-sale">Promo</span>' : ''}
          ${out ? `<span class="badge-sale badge-new">${escapeHtml(t('stock_out'))}</span>` : ''}
        </div>
        <img src="${escapeHtml(p.imageUrl || 'https://via.placeholder.com/400x400?text=ParaPublic')}" alt="${escapeHtml(p.name)}" loading="lazy">
        <div class="product-card-actions-overlay">
          <button type="button" class="btn btn-sm btn-primary" data-add-cart="${p.id}" ${out ? 'disabled' : ''}>🛒</button>
          <button type="button" class="btn btn-sm btn-outline" data-buy-now="${p.id}" ${out ? 'disabled' : ''}>${t('btn_buy')}</button>
        </div>
      </a>
      <div class="product-card-body">
        ${cat ? `<span class="badge badge-cat">${escapeHtml(cat)}</span>` : ''}
        <h3><a href="${base}/product.html?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.name)}</a></h3>
        ${desc ? `<p style="font-size:.82rem;color:var(--text-muted);line-height:1.45;margin:.25rem 0 .5rem">${escapeHtml(desc)}${(p.description || '').length > 72 ? '…' : ''}</p>` : ''}
        <span class="badge ${st.class}" style="font-size:.68rem">${escapeHtml(st.label)}${p.showQty ? ' · ' + p.stockQuantity : ''}</span>
        ${productPriceHtml(p)}
        ${p.showQty !== false ? productActionsHtml(p) : ''}
      </div>
    </article>`;
}

function renderApiBanner() {
  if (isApiOnline()) return '';
  return `<div class="api-offline-banner">${escapeHtml(t('err_api'))}</div>`;
}
