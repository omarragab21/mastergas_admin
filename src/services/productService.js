import api from '../config/axios';
import {
  API_TTL,
  getCached,
  getStaleCached,
  parseCollectionResponse,
  parseDataResponse,
} from './apiClient';
import { products as fallbackProducts, categories as fallbackCategories, offers as fallbackOffers, getProductById as getCatalogProductById } from '../data/catalogData';

const productParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
);

const staleProducts = (params) => {
  const stale = getStaleCached('/frontend/products', productParams(params));
  return stale ? { ...parseCollectionResponse(stale), stale: true, source: 'last-success' } : null;
};

const buildStaticFallback = (params) => {
  let list = [...fallbackProducts];
  if (params.category_id) list = list.filter((product) => Number(product.category_id) === Number(params.category_id));
  if (params.search && String(params.search).length >= 2) {
    const query = String(params.search).toLowerCase();
    list = list.filter((product) => [product.name, product.name_ar, product.name_en, product.description].filter(Boolean).join(' ').toLowerCase().includes(query));
  }
  if (params.in_stock === 1 || params.in_stock === '1') list = list.filter((product) => Number(product.stock || product.quantity) > 0);
  if (params.origin) list = list.filter((product) => String(product.origin || '').toLowerCase().includes(String(params.origin).toLowerCase().replace('italy', 'ital')));
  if (params.has_discount || params.has_offer) {
    list = list.filter((product) => {
      const salePrice = Number(product.sale_price) || 0;
      const price = Number(product.price) || 0;
      const offer = fallbackOffers.some((item) => (item.selected_products || item.applied_ids || []).some((id) => Number(id) === Number(product.id)));
      return (salePrice > 0 && salePrice < price) || Number(product.discount) > 0 || offer;
    });
  }
  if (params.sort_by === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price));
  if (params.sort_by === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price));
  if (params.sort_by === 'newest') list.sort((a, b) => Number(b.id) - Number(a.id));
  const perPage = Math.max(1, Number(params.per_page) || list.length || 1);
  const page = Math.max(1, Number(params.page) || 1);
  const total = list.length;
  return {
    items: list.slice((page - 1) * perPage, page * perPage),
    total,
    current_page: page,
    last_page: Math.max(1, Math.ceil(total / perPage)),
    per_page: perPage,
    meta: {},
    data: list,
    raw: list,
  };
};

export const productService = {
  async getProducts(params = {}, options = {}) {
    const cleanParams = productParams(params);
    try {
      const body = await getCached('/frontend/products', cleanParams, {
        ttl: options.ttl ?? API_TTL.products,
        signal: options.signal,
        retries: options.retries ?? 2,
        timeout: options.timeout ?? 6000,
      });
      return { ...parseCollectionResponse(body), stale: false, source: 'api' };
    } catch (error) {
      if (error?.code === 'ERR_CANCELED' || error?.name === 'AbortError') throw error;
      const stale = staleProducts(cleanParams);
      if (stale) return { ...stale, error };
      return { ...buildStaticFallback(cleanParams), stale: true, source: 'static-fallback', error };
    }
  },

  async getProductById(id, options = {}) {
    const endpoint = `/frontend/products/${encodeURIComponent(id)}`;
    try {
      const body = await getCached(endpoint, {}, {
        ttl: options.ttl ?? API_TTL.productDetail,
        signal: options.signal,
        retries: options.retries ?? 2,
        timeout: options.timeout ?? 6000,
      });
      const product = parseDataResponse(body);
      if (product && typeof product === 'object' && !Array.isArray(product) && product.id !== undefined) {
        return product;
      }
      throw new Error('Product detail response did not contain a product');
    } catch (error) {
      if (error?.code === 'ERR_CANCELED' || error?.name === 'AbortError') throw error;
      const stale = getStaleCached(endpoint, {});
      const staleProduct = stale ? parseDataResponse(stale) : null;
      return staleProduct || getCatalogProductById(id) || null;
    }
  },

  async getCategories(params = { is_active: 1 }, options = {}) {
    const cleanParams = productParams(params);
    try {
      const body = await getCached('/frontend/categories', cleanParams, {
        ttl: options.ttl ?? API_TTL.categories,
        signal: options.signal,
        retries: options.retries ?? 2,
        timeout: options.timeout ?? 4000,
      });
      return parseCollectionResponse(body).items;
    } catch (_) {
      const stale = getStaleCached('/frontend/categories', cleanParams);
      return stale ? parseCollectionResponse(stale).items : fallbackCategories;
    }
  },

  async getBrands(params = { is_active: 1 }, options = {}) {
    const cleanParams = productParams(params);
    try {
      const body = await getCached('/frontend/brands', cleanParams, {
        ttl: options.ttl ?? API_TTL.categories,
        signal: options.signal,
        retries: options.retries ?? 2,
      });
      return parseCollectionResponse(body).items;
    } catch (_) {
      return [];
    }
  },

  async getOffers(params = { is_active: 1 }, options = {}) {
    const cleanParams = productParams(params);
    try {
      const body = await getCached('/frontend/offers', cleanParams, {
        ttl: options.ttl ?? API_TTL.offers,
        signal: options.signal,
        retries: options.retries ?? 2,
        timeout: options.timeout ?? 4000,
      });
      return parseCollectionResponse(body).items;
    } catch (_) {
      const stale = getStaleCached('/frontend/offers', cleanParams);
      return stale ? parseCollectionResponse(stale).items : fallbackOffers;
    }
  },

  async getProductReviews(productId, options = {}) {
    const body = await getCached('/frontend/reviews', { product_id: productId }, {
      ttl: options.ttl ?? 60 * 1000,
      signal: options.signal,
      retries: options.retries ?? 2,
    });
    return parseCollectionResponse(body).items;
  },

  async submitReview(productId, reviewData) {
    const response = await api.post(`/frontend/products/${productId}/reviews`, reviewData);
    return response.data;
  },
};

export default productService;
