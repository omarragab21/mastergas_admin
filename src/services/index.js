export { productService } from './productService';
export { orderService } from './orderService';
export { authService } from './authService';
export { settingsService } from './settingsService';
export {
  API_TTL,
  clearApiCache,
  createRequestKey,
  getCached,
  getCacheState,
  getStaleCached,
  invalidateCache,
  parseCollectionResponse,
  parseDataResponse,
} from './apiClient';

export default {
  product: () => import('./productService').then(m => m.productService),
  order: () => import('./orderService').then(m => m.orderService),
  auth: () => import('./authService').then(m => m.authService),
  settings: () => import('./settingsService').then(m => m.settingsService),
};
