const DELIVERY_FEE = 8;

function normId(id) {
  return String(id);
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

function formatPrice(price) {
  const n = Number(price) || 0;
  const whole = Math.round(n * 1000) / 1000;
  const parts = whole.toFixed(3).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${parts.join(',')} TND`;
}

function calcOrderTotals(items) {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const deliveryFee = DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  return { subtotal, deliveryFee, total };
}

function stockStatus(qty, threshold) {
  if (qty <= 0) return { label: t('stock_out'), class: 'stock-out' };
  if (qty <= threshold) return { label: t('stock_low'), class: 'stock-low' };
  return { label: t('stock_ok'), class: 'stock-ok' };
}

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]+/g, '');
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
