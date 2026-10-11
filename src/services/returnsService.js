import api from '../config/axios';

const unwrapList = (payload) => {
  const body = payload?.data ?? payload;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
};

const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

export const normalizeReturn = (raw = {}) => ({
  ...raw,
  id: first(raw.id, raw.return_id, raw.returnId),
  returnNumber: first(raw.return_number, raw.returnNumber, raw.number, raw.id),
  orderId: first(raw.order_id, raw.order?.id),
  orderNumber: first(raw.order_number, raw.order?.order_number, raw.order?.number),
  customerName: first(raw.customer_name, raw.customer?.name, raw.user?.name, '—'),
  customerEmail: first(raw.customer_email, raw.customer?.email, raw.user?.email, '—'),
  productName: first(raw.product_name, raw.product?.name, raw.order_item?.product_name, raw.order_item?.name, 'منتج غير محدد'),
  productImage: first(raw.product_image, raw.product?.image, raw.order_item?.image),
  reason: first(raw.reason, raw.customer_note, '—'),
  adminNotes: first(raw.admin_notes, raw.admin_note, raw.adminNote),
  refundAmount: first(raw.refund_amount, raw.refundAmount, raw.order_item?.total_price, 0),
  status: String(first(raw.status, 'pending')).toLowerCase(),
  date: first(raw.date, raw.created_at, raw.createdAt),
});

export const returnsService = {
  async listMine() {
    const response = await api.get('/frontend/returns');
    return unwrapList(response.data).map(normalizeReturn);
  },

  async create(payload) {
    const response = await api.post('/frontend/returns', payload);
    return response.data;
  },

  async listAll() {
    const response = await api.get('/dashboard/returns');
    return unwrapList(response.data).map(normalizeReturn);
  },

  async updateStatus(id, payload) {
    const response = await api.patch(`/dashboard/returns/${id}/status`, payload);
    return response.data;
  },
};

export default returnsService;
