const CART_KEY = 'parapublic_cart';

function normId(id) {
  return String(id);
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function getCartCount() {
  return getCart().reduce((s, i) => s + i.quantity, 0);
}

function getCartLines() {
  return getCart()
    .map((item) => {
      const pid = normId(item.productId);
      const p = getProductById(pid);
      if (!p || !p.isActive) return null;
      return {
        productId: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.imageUrl,
        price: p.price,
        stockQuantity: p.stockQuantity,
        quantity: Math.min(item.quantity, p.stockQuantity),
      };
    })
    .filter(Boolean);
}

function addToCart(productId, qty = 1) {
  const pid = normId(productId);
  const p = getProductById(pid);
  if (!p || !p.isActive) return t('product_not_found');
  if (p.stockQuantity <= 0) return t('stock_out');
  const quantity = Math.max(1, Number(qty) || 1);
  const cart = getCart();
  const existing = cart.find((i) => normId(i.productId) === pid);
  const newQty = (existing ? existing.quantity : 0) + quantity;
  if (newQty > p.stockQuantity) return `${t('qty')}: max ${p.stockQuantity}`;
  if (existing) existing.quantity = newQty;
  else cart.push({ productId: pid, quantity });
  saveCart(cart);
  return true;
}

function updateCartQty(productId, quantity) {
  const pid = normId(productId);
  const p = getProductById(pid);
  if (!p) return removeFromCart(pid);
  const qty = Number(quantity);
  if (qty <= 0) return removeFromCart(pid);
  if (qty > p.stockQuantity) return t('stock_low');
  const cart = getCart();
  const item = cart.find((i) => normId(i.productId) === pid);
  if (!item) return false;
  item.quantity = qty;
  item.productId = pid;
  saveCart(cart);
  return true;
}

function removeFromCart(productId) {
  const pid = normId(productId);
  saveCart(getCart().filter((i) => normId(i.productId) !== pid));
  return true;
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

function updateCartBadge() {
  const el = document.getElementById('cart-badge');
  if (el) {
    const n = getCartCount();
    el.textContent = n;
    el.style.display = n > 0 ? 'inline-flex' : 'none';
  }
}
