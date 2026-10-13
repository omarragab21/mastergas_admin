import api from '../../config/axios';

const multipart = (payload, files = {}) => {
  const body = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => body.append(`${key}[${index}]`, item));
    } else {
      body.append(key, value);
    }
  });
  Object.entries(files).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((file) => body.append(`${key}[]`, file));
    else if (value) body.append(key, value);
  });
  return body;
};

const json = { headers: { 'Content-Type': 'application/json' } };
const formHeaders = { headers: { 'Content-Type': 'multipart/form-data' } };

export const tijaraAdminApi = {
  listCategories: (params = {}) => api.get('/v1/categories', { params }),
  createCategory: (payload, image) => api.post('/v1/categories', multipart(payload, { image_file: image }), formHeaders),
  updateCategory: (id, payload, image) => api.put(`/v1/categories/${id}`, multipart(payload, { image_file: image }), formHeaders),
  deleteCategory: (id) => api.delete(`/v1/categories/${id}`),

  listProducts: (params = {}) => api.get('/v1/products', { params }),
  createProduct: (payload, files = []) => api.post('/v1/products', multipart(payload, { images: files }), formHeaders),
  updateProduct: (id, payload, files = []) => api.put(`/v1/products/${id}`, multipart(payload, { images: files }), formHeaders),
  deleteProduct: (id) => api.delete(`/v1/products/${id}`),

  listAttributes: (params = {}) => api.get('/v1/attributes', { params }),
  createAttribute: (payload) => api.post('/v1/attributes', payload, json),
  updateAttribute: (id, payload) => api.put(`/v1/attributes/${id}`, payload, json),
  deleteAttribute: (id) => api.delete(`/v1/attributes/${id}`),
  createAttributeOption: (attributeId, payload) => api.post(`/v1/attributes/${attributeId}/options`, payload, json),
  updateAttributeOption: (attributeId, optionId, payload) => api.put(`/v1/attributes/${attributeId}/options/${optionId}`, payload, json),
  deleteAttributeOption: (attributeId, optionId) => api.delete(`/v1/attributes/${attributeId}/options/${optionId}`),

  listDiscountCodes: (params = {}) => api.get('/v1/discount_codes', { params }),
  createDiscountCode: (payload) => api.post('/v1/discount_codes', payload, json),
  updateDiscountCode: (id, payload) => api.put(`/v1/discount_codes/${id}`, payload, json),
  deleteDiscountCode: (id) => api.delete(`/v1/discount_codes/${id}`),

  listOrders: (params = {}) => api.get('/v1/orders', { params }),
  getOrder: (id) => api.get(`/v1/orders/${id}`),
  updateOrder: (id, payload) => api.patch(`/v1/orders/${id}`, payload, json),
  deleteOrder: (id) => api.delete(`/v1/orders/${id}`),
};

export default tijaraAdminApi;
