// Tijara orders contract, verified live in reports/tijara-orders-api-qa-2026-10-13.md.

export const ORDER_STEPS = ['pending', 'paid_confirmed', 'processing', 'shipped', 'delivered'];
export const ORDER_STATUSES = [...ORDER_STEPS, 'cancelled'];

// Keep the admin order timeline identical to the customer website timeline.
export const ORDER_TRACKING_STEPS = [
  { key: 'received', rank: 1, label: 'تم استلام الطلب', icon: 'fas fa-inbox', dateField: 'createdAt' },
  { key: 'confirmed', rank: 2, label: 'تم تأكيد الطلب', icon: 'fas fa-clipboard-check', dateField: 'paymentTime' },
  { key: 'processing', rank: 3, label: 'تم تجهيز الطلب', icon: 'fas fa-box-open', dateField: 'updatedAt' },
  { key: 'shipped', rank: 4, label: 'تم الشحن', icon: 'fas fa-box', dateField: 'shippedAt' },
  { key: 'transit', rank: 5, label: 'الطلب في الطريق', icon: 'fas fa-truck', dateField: 'shippedAt', note: 'طلبك في طريقه إليك' },
  { key: 'delivered', rank: 6, label: 'تم الاستلام', icon: 'fas fa-house', dateField: 'deliveredAt' },
];

const TRACKING_STATUS_RANKS = {
  pending: 1,
  confirmed: 2,
  paid_confirmed: 2,
  processing: 3,
  shipped: 4,
  shipping: 5,
  delivering: 5,
  in_delivery: 5,
  delivered: 6,
  completed: 6,
};

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
export const trackingStatusLabel = (status) => {
  const normalized = String(status || '').toLowerCase();
  const rank = TRACKING_STATUS_RANKS[normalized] || 0;
  return ORDER_TRACKING_STEPS.find((step) => step.rank === rank)?.label || statusLabel(status);
};
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
    createdAt: order.created_at ?? null,
    updatedAt: order.updated_at ?? null,
    shippedAt: order.shipped_at ?? null,
    deliveredAt: order.delivered_at ?? null,
    estimatedDelivery: order.estimated_delivery ?? null,
  };
};

export const trackingRank = (order = {}) => {
  const status = String(order.status || 'pending').toLowerCase();
  const statusRank = TRACKING_STATUS_RANKS[status] || 0;
  if (statusRank > 0) return statusRank;
  if (order.deliveredAt) return 6;
  if (order.shippedAt) return 5;
  return order.createdAt || order.date ? 1 : 0;
};

export const trackingStepState = (order, step) => {
  const rank = trackingRank(order);
  if (rank >= step) return rank === step ? 'active' : 'completed';
  return 'pending';
};

export const trackingStepIcon = (step, state) => state === 'pending' ? step.icon : 'fas fa-check';
