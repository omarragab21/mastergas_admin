import axios from 'axios';
import { localApiAdapter } from './localApi';

const serverUrl = 'https://backend-tijara.be-kite.com/api';
const envUrl = import.meta.env.VITE_API_BASE_URL;

const isBrowser = typeof window !== 'undefined';
const frappeMode = import.meta.env.VITE_FRAPPE_MODE === 'true';
// VITE_DATA_MODE=api sends every request to the backend; anything else keeps the local snapshot for catalog/content.
const useLiveApi = import.meta.env.VITE_DATA_MODE === 'api';

// Dashboard data uses the local snapshot for now; authentication remains remote.
const baseURL = envUrl || (import.meta.env.DEV && isBrowser ? '/api' : serverUrl);

const REMOTE_AUTH_PATHS = new Set([
  '/v1/login',
  '/v1/admin/login',
  '/v1/register',
  '/v1/logout',
  '/v1/user',
  '/frontend/login',
  '/frontend/register',
  '/frontend/logout',
  '/frontend/user',
  '/frontend/profile',
  '/frontend/change-password',
  '/frontend/forgot-password',
]);

// These Admin resources are backed by the Tijara API even when the rest of
// the dashboard is running from the local snapshot during development.
const LIVE_ADMIN_PATH_PREFIXES = [
  '/v1/users',
  '/v1/categories',
  '/v1/discount_codes',
  '/v1/products',
  '/v1/attributes',
  '/v1/orders',
];

const normalizePath = (url = '') => String(url).split('?')[0].replace(/^\/api/, '') || '/';

const api = axios.create({
  baseURL,
  timeout: 6000,
  headers: {
    'Accept': 'application/json',
  },
});

const apiMetrics = [];
const MAX_METRICS = 250;

const getStorage = () => (typeof localStorage !== 'undefined' ? localStorage : null);

const getRequestPath = (config = {}) => {
  const rawUrl = config.url || '';
  return rawUrl.split('?')[0].replace(/^\/api/, '') || '/';
};

const sanitizeParameters = (parameters = {}) => Object.fromEntries(
  Object.entries(parameters || {}).map(([key, value]) => {
    const sensitive = /token|password|secret|authorization|email|phone/i.test(key);
    return [key, sensitive ? '[redacted]' : value];
  })
);

export const getRequestTimeout = (url = '') => {
  const path = String(url).split('?')[0].replace(/^\/api/, '');
  if (/^\/frontend\/(settings|categories|offers|sliders)(\/|$)/.test(path)) return 4000;
  if (/^\/frontend\/products\/[^/]+$/.test(path)) return 6000;
  if (/^\/frontend\/products(\/|$)/.test(path)) return 6000;
  return 6000;
};

const performanceMark = (name) => {
  try {
    if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
      performance.mark(name);
    }
  } catch {
    // Performance marks must never affect a customer request.
  }
};

export const recordApiMetric = (metric) => {
  const entry = { ...metric, recorded_at: new Date().toISOString() };
  apiMetrics.push(entry);
  if (apiMetrics.length > MAX_METRICS) apiMetrics.shift();
  if (typeof window !== 'undefined') {
    window.__mastergasApiMetrics = apiMetrics;
  }
  return entry;
};

export const getApiMetrics = () => [...apiMetrics];
export const clearApiMetrics = () => apiMetrics.splice(0, apiMetrics.length);

export const isCancelledRequest = (error) => Boolean(
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'CanceledError' ||
  error?.name === 'AbortError' ||
  (typeof axios.isCancel === 'function' && axios.isCancel(error))
);

export const classifyApiError = (error) => {
  if (isCancelledRequest(error)) return 'cancelled';
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return 'timeout';
  if (!error?.response) return 'network';
  if (error.response.status >= 500) return '5xx';
  if (error.response.status >= 400) return '4xx';
  return 'unknown';
};

/**
 * Attach only the token that belongs to the requested API surface.
 */
api.interceptors.request.use(config => {
  const storage = getStorage();
  const lang = storage?.getItem('lang') || 'ar';
  config.headers['Accept-Language'] = lang;

  const requestId = config.headers['X-Request-ID'] || `mg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  config.headers['X-Request-ID'] = requestId;
  config.timeout = config.timeout ?? getRequestTimeout(config.url);
  config.__mastergasRequest = {
    requestId,
    startedAt: performanceNow(),
    endpoint: getRequestPath(config),
    retryCount: config.__retryCount || 0,
  };
  if (!globalThis.__mastergasFirstApiRequest) {
    globalThis.__mastergasFirstApiRequest = true;
    performanceMark('mastergas:first-api-request');
  }
  performanceMark(`mastergas:api:start:${requestId}`);

  const requestUrl = config.url || '';
  const cleanPath = normalizePath(requestUrl);
  const token = storage?.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const isLiveAdminPath = LIVE_ADMIN_PATH_PREFIXES.some((prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`));
  if (!useLiveApi && !REMOTE_AUTH_PATHS.has(cleanPath) && !isLiveAdminPath) {
    config.__localApi = true;
    config.adapter = localApiAdapter;
  }
  if (frappeMode && cleanPath.startsWith('/frontend') && config.method?.toLowerCase() === 'get') {
    const parts = cleanPath.split('/').filter(Boolean);
    const resource = parts[1];
    const methodMap = { products: 'get_products', categories: 'get_categories', offers: 'get_offers', brands: 'get_brands', settings: 'get_settings', sliders: 'get_sliders', reviews: 'get_product_reviews', coupons: 'get_coupons', topics: 'get_topics' };
    if (resource === 'products' && parts[2]) {
      config.baseURL = '/api';
      config.url = '/method/mastergas_core.api.frontend.get_product_detail';
      config.params = { ...(config.params || {}), id_or_slug: decodeURIComponent(parts[2]) };
    } else if (methodMap[resource]) {
      config.baseURL = '/api';
      config.url = `/method/mastergas_core.api.frontend.${methodMap[resource]}`;
    }
  }
  return config;
});

const performanceNow = () => {
  try {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  } catch {
    return Date.now();
  }
};

const finalizeMetric = (config, overrides = {}) => {
  const request = config?.__mastergasRequest || {};
  const start = request.startedAt || performanceNow();
  const duration = Math.max(0, performanceNow() - start);
  const requestId = request.requestId || config?.headers?.['X-Request-ID'];
  performanceMark(`mastergas:api:end:${requestId || 'unknown'}`);
  return recordApiMetric({
    endpoint: request.endpoint || getRequestPath(config),
    parameters: sanitizeParameters(config?.params || {}),
    start_time: start,
    end_time: start + duration,
    duration,
    status: overrides.status ?? null,
    retry_count: request.retryCount || 0,
    cache: overrides.cache || 'miss',
    aborted: Boolean(overrides.aborted),
    error_type: overrides.errorType,
  });
};

let appRouter = null;
export function setRouter(r) {
  appRouter = r;
}

let isRedirectingToAdminLogin = false;

api.interceptors.response.use(
  response => {
    finalizeMetric(response.config, { status: response.status });
    if (frappeMode && response.data?.message?.success) response.data = response.data.message;
    if (getRequestPath(response.config).startsWith('/frontend/products')) {
      performanceMark('mastergas:products-api-complete');
    }
    return response;
  },
  error => {
    finalizeMetric(error.config, {
      status: error.response?.status || null,
      aborted: isCancelledRequest(error),
      errorType: classifyApiError(error),
    });
    // The Tijara backend currently answers a missing/expired token with HTTP 500 {"message":"Unauthenticated."}
    // instead of 401, so treat that exact payload as an auth failure too.
    const isUnauthenticated = error.response?.status === 401
      || (error.response?.status === 500 && error.response?.data?.message === 'Unauthenticated.');
    if (error.response && isUnauthenticated && !error.config?.__localApi) {
      const url = error.config?.url || '';
      const cleanPath = url.split('?')[0].replace(/^\/api/, '');
      const isFrontendReq = cleanPath.startsWith('/frontend');
      const isAdminReq = !isFrontendReq && (
        cleanPath.startsWith('/dashboard') || 
        cleanPath.startsWith('/v1/admins') || 
        cleanPath.startsWith('/admin')
      );
      const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

      if (isAdminReq || isAdminPath) {
        const storage = getStorage();
        storage?.removeItem('token');
        storage?.removeItem('admin');

        if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login' && !isRedirectingToAdminLogin) {
          isRedirectingToAdminLogin = true;
          if (appRouter && appRouter.currentRoute?.value?.path !== '/admin/login') {
            appRouter.push('/admin/login').finally(() => {
              isRedirectingToAdminLogin = false;
            });
          } else {
            window.location.replace('/admin/login');
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
