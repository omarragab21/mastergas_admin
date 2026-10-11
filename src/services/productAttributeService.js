import api from '../config/axios';
import { normalizeProductAttributes } from '../utils/productAttributes';

const unwrapList = (response) => normalizeProductAttributes(response?.data?.data || []);

export const buildProductAttributePayload = (form) => ({
  name: { en: String(form.name_en || '').trim(), ar: String(form.name_ar || '').trim() },
  label: { en: String(form.label_en || '').trim(), ar: String(form.label_ar || '').trim() },
  type: form.type || 'select',
  values_list: String(form.values_list || '').split(',').map((value) => value.trim()).filter(Boolean),
  is_active: Boolean(form.is_active),
  sort_order: Number(form.sort_order) || 1,
});

export const productAttributeService = {
  async list() {
    const response = await api.get('/dashboard/product-attributes');
    return unwrapList(response);
  },
  async create(form) {
    const response = await api.post('/dashboard/product-attributes/store', buildProductAttributePayload(form));
    return response.data?.data || response.data;
  },
  async delete(attributeId) {
    return api.delete(`/dashboard/product-attributes/${attributeId}/delete`);
  },
  async createValue(attributeId, value) {
    const response = await api.post(`/dashboard/product-attributes/${attributeId}/values`, value);
    return response.data?.data || response.data;
  },
  async updateValue(attributeId, valueId, value) {
    const response = await api.put(`/dashboard/product-attributes/${attributeId}/values/${valueId}`, value);
    return response.data?.data || response.data;
  },
  async deleteValue(attributeId, valueId) {
    return api.delete(`/dashboard/product-attributes/${attributeId}/values/${valueId}`);
  },
};

export default productAttributeService;
