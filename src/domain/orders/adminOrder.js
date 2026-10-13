// Tijara orders contract, verified live in reports/tijara-orders-api-qa-2026-10-13.md.

export const ORDER_STEPS = ['pending', 'paid_confirmed', 'processing', 'shipped', 'delivered'];
export const ORDER_STATUSES = [...ORDER_STEPS, 'cancelled'];

const STATUS_LABELS = {
  pending: 'قيد الانتظار',
  paid_confirmed: 'تم تأكيد الدفع',
  processing: 'قيد المعالجة',
  shipped: 'قيد الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const PAYMENT_STATUS_LABELS = {
  unpaid: 'غير مدفوع',
  paid: 'مدفوع',
  refunded: 'مسترجع',
};

const PAYMENT_METHOD_LABELS = {
  cash_on_delivery: 'دفع عند الاستلام',
  cod: 'دفع عند الاستلام',
  cash: 'دفع عند الاستلام',
  credit_card: 'بطاقة ائتمان',
  card: 'بطاقة ائتمان',
  paytabs: 'بطاقة ائتمان (Paytabs)',
  wallet: 'المحفظة الإلكترونية',
  bank_transfer: 'تحويل بنكي',
};

// The backend accepts any status from any status, so the admin enforces the
// lifecycle itself: forward one step at a time, cancel only before shipping.
const TRANSITIONS = {
  pending: ['paid_confirmed', 'cancelled'],
  paid_confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const statusLabel = (status) => STATUS_LABELS[status] || status;
export const paymentStatusLabel = (status) => PAYMENT_STATUS_LABELS[status] || status || 'غير محدد';
export const paymentMethodLabel = (method) => {
  if (!method) return 'غير محدد';
  return PAYMENT_METHOD_LABELS[String(method).toLowerCase().trim()] || method;
};

export const nextStatuses = (status) => TRANSITIONS[status] || [];
export const canTransition = (from, to) => nextStatuses(from).includes(to);
export const isFinalStatus = (status) => ORDER_STATUSES.includes(status) && nextStatuses(status).length === 0;

// `paid_confirmed` does not touch payment_status on the backend, so send both.
export const toStatusPayload = (from, to) => {
  if (!canTransition(from, to)) {
    throw new Error(`لا يمكن تغيير حالة الطلب من "${statusLabel(from)}" إلى "${statusLabel(to)}"`);
  }
  return to === 'paid_confirmed' ? { status: to, payment_status: 'paid' } : { status: to };
};

// Money fields arrive as raw floats (876.8500000000000227…).
export const money = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round((number + Number.EPSILON) * 100) / 100 : 0;
};

const pad = (value) => String(value).padStart(2, '0');
const localDateTime = (iso) => {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return { date: '', time: '' };
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
};

// The orders endpoint returns /storage/… (HTTP 403) while the same file is
// served at /public/storage/… (the form the products endpoint already uses).
export const normalizeImageUrl = (url) => {
  const value = String(url ?? '').trim();
  return value.replace(/^(https?:\/\/[^/]+)\/storage\//i, '$1/public/storage/');
};

const productImage = (product = {}) => {
  const images = Array.isArray(product.images) ? product.images : [];
  const primary = images.find((image) => image?.is_primary) || images[0];
  return normalizeImageUrl(product.image_url || primary?.image_url || primary?.url);
};

const firstFilled = (...values) => values.map((value) => String(value ?? '').trim()).find(Boolean) || '';

const toOrderProduct = (item = {}) => ({
  id: item.id,
  productId: item.product_id ?? item.product?.id,
  name: item.product?.name ?? '',
  image: productImage(item.product || {}),
  quantity: Number(item.quantity) || 0,
  price: money(item.unit_price),
  total: money(item.total_price),
});

export const toOrder = (raw) => {
  const order = raw || {};
  const user = order.user || {};
  return {
    id: order.id,
    orderNumber: order.order_number ?? '',
    status: order.status ?? '',
    paymentStatus: order.payment_status ?? '',
    paymentMethod: order.payment_method ?? '',
    paymentTime: order.payment_time ?? null,
    transactionId: order.transaction_id ?? '',
    couponCode: order.coupon_code ?? '',
    customerName: user.name ?? '',
    customerEmail: user.email ?? '',
    customerPhone: user.phone_number ?? user.phone ?? '',
    customerAddress: firstFilled(order.shipping_address, order.billing_address),
    billingAddress: order.billing_address ?? '',
    notes: order.notes ?? '',
    products: Array.isArray(order.items) ? order.items.map(toOrderProduct) : [],
    subtotal: money(order.subtotal),
    discount: money(order.discount),
    shipping: money(order.shipping_cost),
    tax: money(order.tax_amount),
    total: money(order.total_amount),
    ...localDateTime(order.created_at),
    shippedAt: order.shipped_at ?? null,
    deliveredAt: order.delivered_at ?? null,
    estimatedDelivery: order.estimated_delivery ?? null,
  };
};
