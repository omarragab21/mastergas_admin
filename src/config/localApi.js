import localSnapshot from '../data/localData.json';
import { getCustomerToken } from '../utils/customerSession.js';

const CUSTOMER_TOKEN_KEY = 'c_token';
const ADMIN_TOKEN_KEY = 'token';
const CUSTOMERS_KEY = 'mastergas_local_customers';
const ADMINS_KEY = 'mastergas_local_admins';
const SESSIONS_KEY = 'mastergas_local_sessions';
const ORDERS_KEY = 'mastergas_local_orders';
const ADDRESSES_KEY = 'mastergas_local_addresses';
const NOTIFICATIONS_KEY = 'mastergas_local_notifications';

const storage = () => (typeof localStorage !== 'undefined' ? localStorage : null);

const readJson = (key, fallback) => {
  try {
    const value = storage()?.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => storage()?.setItem(key, JSON.stringify(value));

const collection = (name) => {
  const value = localSnapshot[name];
  if (!Array.isArray(value)) return [];
  if (name !== 'settings') return value;
  return value.map((setting) => {
    if (setting?.key === 'logo') return { ...setting, value: '/brand/mastergas-logo.png' };
    if (setting?.key === 'footer_logo') return { ...setting, value: '/brand/mastergas-logo-white.png' };
    if (setting?.key === 'favicon') return { ...setting, value: '/brand/mastergas-icon.png' };
    return setting;
  });
};

const stripCredentials = ({ password: _password, ...user }) => user;

const usersFor = (kind) => {
  const isAdmin = kind === 'admin';
  const key = isAdmin ? ADMINS_KEY : CUSTOMERS_KEY;
  const seed = isAdmin ? localSnapshot.admins : localSnapshot.customers;
  const stored = readJson(key, []);
  const list = [...stored];
  for (const item of seed) {
    const index = list.findIndex((c) => c.email?.toLowerCase() === item.email?.toLowerCase());
    if (index === -1) {
      list.push(item);
    } else {
      list[index] = { ...item, ...list[index] };
      if (list[index].name === 'Local Customer' && item.name !== 'Local Customer') {
        list[index].name = item.name;
        list[index].phone = item.phone;
        list[index].country = item.country;
        list[index].city = item.city;
        list[index].address = item.address;
      }
    }
  }
  return list;
};

const sessions = () => readJson(SESSIONS_KEY, {});
const saveSession = (token, kind, userId) => {
  const next = sessions();
  next[token] = { kind, userId };
  writeJson(SESSIONS_KEY, next);
};

const currentSession = (kind) => {
  const token = kind === 'admin' ? storage()?.getItem(ADMIN_TOKEN_KEY) : getCustomerToken();
  const session = token ? sessions()[token] : null;
  return session?.kind === kind ? { token, ...session } : null;
};

const requireSession = (kind) => {
  const session = currentSession(kind);
  if (!session) throw localError(401, 'Authentication required');
  const user = usersFor(kind).find((candidate) => String(candidate.id) === String(session.userId));
  if (!user) throw localError(401, 'Session expired');
  return { session, user };
};

const localError = (status, message, config = null) => {
  const error = new Error(message);
  error.response = { status, data: { message } };
  error.config = config;
  return error;
};

const parseBody = (value) => {
  if (!value) return {};
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return value;
};

const queryValue = (query, key, fallback = undefined) => {
  const value = query?.[key];
  return value === undefined || value === null || value === '' ? fallback : value;
};

const paginate = (items, query = {}) => {
  const page = Math.max(1, Number(queryValue(query, 'page', 1)) || 1);
  const perPage = Math.max(1, Number(queryValue(query, 'per_page', items.length || 1)) || items.length || 1);
  const start = (page - 1) * perPage;
  const total = items.length;
  return {
    data: items.slice(start, start + perPage),
    meta: {
      current_page: page,
      last_page: Math.max(1, Math.ceil(total / perPage)),
      per_page: perPage,
      total,
      from: total ? start + 1 : null,
      to: Math.min(start + perPage, total),
    },
  };
};

const productList = (query = {}) => {
  let products = [...collection('products')];
  if (query.category_id) products = products.filter((product) => String(product.category_id) === String(query.category_id));
  if (query.search) {
    const term = String(query.search).toLowerCase();
    products = products.filter((product) => JSON.stringify(product).toLowerCase().includes(term));
  }
  if (String(query.in_stock) === '1') products = products.filter((product) => Number(product.stock ?? product.quantity) > 0);
  if (query.origin) products = products.filter((product) => JSON.stringify(product).toLowerCase().includes(String(query.origin).toLowerCase()));
  if (String(query.has_discount) === '1' || String(query.has_offer) === '1') {
    const offerIds = collection('offers').flatMap((offer) => offer.selected_products || []);
    products = products.filter((product) => Number(product.discount) > 0 || offerIds.some((id) => String(id) === String(product.id)));
  }
  if (query.sort_by === 'price_asc') products.sort((a, b) => Number(a.price) - Number(b.price));
  if (query.sort_by === 'price_desc') products.sort((a, b) => Number(b.price) - Number(a.price));
  if (query.sort_by === 'newest') products.sort((a, b) => Number(b.id) - Number(a.id));
  return paginate(products, query);
};

const currentCustomer = () => requireSession('customer').user;
const currentAdmin = () => requireSession('admin').user;

const userAddresses = (userId) => {
  const all = readJson(ADDRESSES_KEY, {});
  if (!all[userId] || !Array.isArray(all[userId]) || all[userId].length === 0) {
    const seed = (localSnapshot.addresses || []).filter((item) => String(item.customer_id) === String(userId));
    if (seed.length > 0) {
      all[userId] = seed;
      writeJson(ADDRESSES_KEY, all);
      return { all, list: seed };
    }
  }
  return { all, list: all[userId] || [] };
};

const userWithAddresses = (user) => {
  if (!user) return user;
  const { list } = userAddresses(user.id);
  return { ...user, addresses: list };
};

const saveAddressList = (userId, list) => {
  const all = readJson(ADDRESSES_KEY, {});
  all[userId] = list;
  writeJson(ADDRESSES_KEY, all);
};

const userOrders = (userId) => readJson(ORDERS_KEY, []).filter((order) => String(order.customer_id) === String(userId));

const routeParts = (path) => path.split('/').filter(Boolean);

const handleRequest = (config) => {
  const rawUrl = String(config.url || '');
  const url = new URL(rawUrl, 'http://local.test');
  const path = url.pathname.replace(/^\/api/, '');
  const parts = routeParts(path);
  const method = String(config.method || 'get').toLowerCase();
  const query = { ...Object.fromEntries(url.searchParams.entries()), ...(config.params || {}) };
  const body = parseBody(config.data);

  if (path === '/frontend/login' && method === 'post') {
    const user = usersFor('customer').find((candidate) => candidate.email?.toLowerCase() === String(body.email || '').toLowerCase() && candidate.password === body.password);
    if (!user) throw localError(401, 'Invalid email or password', config);
    const token = `local-customer-${user.id}-${Date.now()}`;
    saveSession(token, 'customer', user.id);
    return { status: 'success', token, customer: stripCredentials(userWithAddresses(user)) };
  }
  if (path === '/frontend/register' && method === 'post') {
    const users = usersFor('customer');
    if (users.some((user) => user.email?.toLowerCase() === String(body.email || '').toLowerCase())) throw localError(422, 'Email already exists', config);
    const user = { id: `local-${Date.now()}`, name: body.name, email: body.email, password: body.password, phone: body.phone || '', country: body.country || 'JO' };
    writeJson(CUSTOMERS_KEY, [...readJson(CUSTOMERS_KEY, []), user]);
    const token = `local-customer-${user.id}-${Date.now()}`;
    saveSession(token, 'customer', user.id);
    return { status: 'success', token, customer: stripCredentials(user) };
  }
  if (path === '/frontend/logout' && method === 'post') return { status: 'success' };
  if (path === '/frontend/user' && method === 'get') return { data: stripCredentials(userWithAddresses(currentCustomer())) };
  if (path === '/frontend/profile' && method === 'put') {
    const user = currentCustomer();
    const updated = { ...user, ...body, id: user.id, password: user.password };
    writeJson(CUSTOMERS_KEY, [...usersFor('customer').filter((candidate) => String(candidate.id) !== String(user.id)), updated]);
    return { data: stripCredentials(updated) };
  }
  if (path === '/frontend/change-password' && method === 'post') {
    const user = currentCustomer();
    if (body.current_password && body.current_password !== user.password) throw localError(422, 'Current password is incorrect', config);
    const updated = { ...user, password: body.password || body.new_password || user.password };
    writeJson(CUSTOMERS_KEY, [...usersFor('customer').filter((candidate) => String(candidate.id) !== String(user.id)), updated]);
    return { status: 'success' };
  }
  if (path === '/frontend/forgot-password' && method === 'post') return { status: 'success', message: 'Local reset link simulated' };

  if (path === '/v1/login' && method === 'post') {
    const user = usersFor('admin').find((candidate) => candidate.email?.toLowerCase() === String(body.email || '').toLowerCase() && candidate.password === body.password);
    if (!user) throw localError(401, 'Invalid email or password', config);
    const token = `local-admin-${user.id}-${Date.now()}`;
    saveSession(token, 'admin', user.id);
    return { status: 'success', token, admin: stripCredentials(user) };
  }

  if (parts[0] === 'frontend') {
    const resource = parts[1];
    if (resource === 'products') {
      if (parts[2] && parts[2] !== 'me') {
        const product = collection('products').find((item) => String(item.id) === String(decodeURIComponent(parts[2])) || item.slug === decodeURIComponent(parts[2]));
        if (!product) throw localError(404, 'Product not found', config);
        return { data: product };
      }
      return productList(query);
    }
    if (resource === 'categories') return paginate(collection('categories').filter((item) => String(item.is_active ?? 1) !== '0'), query);
    if (resource === 'brands') return paginate(collection('brands'), query);
    if (resource === 'offers') return paginate(collection('offers'), query);
    if (resource === 'settings') return { data: collection('settings') };
    if (resource === 'sliders') return paginate(collection('sliders'), query);
    if (resource === 'topics') {
      if (parts[2]) {
        const topic = collection('topics').find((item) => String(item.id) === String(parts[2]) || item.slug === parts[2] || item.title === parts[2]);
        if (!topic) throw localError(404, 'Topic not found', config);
        return { data: topic };
      }
      return paginate(collection('topics'), query);
    }
    if (resource === 'pages') {
      const page = collection('topics').find((item) => String(item.id) === String(parts[2]) || item.slug === parts[2]);
      if (!page) throw localError(404, 'Page not found', config);
      return { data: page };
    }
    if (resource === 'coupons' && parts[2] === 'validate' && method === 'post') {
      const coupon = collection('coupons').find((item) => String(item.code).toLowerCase() === String(body.code || '').toLowerCase() && item.is_active !== 0);
      return coupon ? { success: true, data: coupon, discount: Number(coupon.value) || 0 } : { success: false, message: 'Coupon is not valid' };
    }
    if (resource === 'coupons') return paginate(collection('coupons'), query);
    if (resource === 'filters') return { data: localSnapshot.filters || {} };
    if (resource === 'countries') return paginate(collection('countries'), query);
    if (resource === 'cities') {
      const cities = query.country_id ? collection('cities').filter((city) => String(city.country_id) === String(query.country_id)) : collection('cities');
      if (parts[2] && parts[3] === 'shipping-rate') {
        const rate = collection('shippingRates').find((item) => String(item.city_id) === String(parts[2]));
        return { data: rate || { rate: 0, shipping_rate: 0 } };
      }
      return paginate(cities, query);
    }
    if (resource === 'city-shipping-rates') return paginate(collection('shippingRates'), query);
    if (resource === 'reviews' && method === 'get') return paginate(collection('reviews').filter((review) => !query.product_id || String(review.product_id) === String(query.product_id)), query);
    if (resource === 'reviews' && method === 'post') return { status: 'success', data: { ...body, id: `local-review-${Date.now()}` } };
    if (resource === 'contact' && method === 'post') return { status: 'success', message: 'Message saved locally' };
    if (resource === 'wallet') return { data: { balance: 0, transactions: [] } };
    if (resource === 'notifications') return { data: readJson(NOTIFICATIONS_KEY, []) };
    if (resource === 'wishlist' && method === 'post') return { status: 'success' };
    if (resource === 'addresses') {
      const user = currentCustomer();
      const { list } = userAddresses(user.id);
      if (method === 'get' && !parts[2]) return { data: list };
      if (method === 'post') {
        const address = { ...body, id: `local-address-${Date.now()}`, is_default: list.length === 0 || Boolean(body.is_default) };
        const next = body.is_default ? list.map((item) => ({ ...item, is_default: false })).concat(address) : [...list, address];
        saveAddressList(user.id, next);
        return { data: address };
      }
      if (method === 'put' && parts[2]) {
        const next = list.map((item) => String(item.id) === String(parts[2]) ? { ...item, ...body, id: item.id } : item);
        saveAddressList(user.id, next);
        return { data: next.find((item) => String(item.id) === String(parts[2])) };
      }
      if (method === 'delete' && parts[2]) {
        saveAddressList(user.id, list.filter((item) => String(item.id) !== String(parts[2])));
        return { status: 'success' };
      }
    }
    if (resource === 'orders' && method === 'get') {
      const user = currentCustomer();
      if (parts[2] && parts[2] !== 'me') {
        const order = userOrders(user.id).find((item) => String(item.id) === String(parts[2]));
        if (!order) throw localError(404, 'Order not found', config);
        return { data: order };
      }
      return { data: userOrders(user.id) };
    }
    if (resource === 'orders' && method === 'post') {
      const user = currentCustomer();
      const orders = readJson(ORDERS_KEY, []);
      const order = { ...body, id: `local-order-${Date.now()}`, order_number: `LOCAL-${Date.now()}`, customer_id: user.id, status: 'pending', created_at: new Date().toISOString() };
      writeJson(ORDERS_KEY, [order, ...orders]);
      return { success: true, status: 'success', data: order };
    }
    if (resource === 'orders' && resource !== 'orders' && method === 'post') return { success: true, status: 'success' };
    if (resource === 'paytabs' && parts[2] === 'checkout') {
      return { success: true, status: 'success', data: { redirect_url: '/payment/success?respStatus=A&tranRef=LOCAL-TRANSACTION' } };
    }
    if (resource === 'paytabs' && parts[2] === 'order' && method === 'post') {
      const user = currentCustomer();
      const orders = readJson(ORDERS_KEY, []);
      const order = { ...body, id: `local-paytabs-order-${Date.now()}`, order_number: `LOCAL-${Date.now()}`, customer_id: user.id, status: 'paid', created_at: new Date().toISOString() };
      writeJson(ORDERS_KEY, [order, ...orders]);
      return { success: true, status: 'success', data: order };
    }
    if (resource === 'returns') {
      const user = currentCustomer();
      if (method === 'get') return { data: readJson('mastergas_local_returns', []).filter((item) => String(item.customer_id) === String(user.id)) };
      const returns = readJson('mastergas_local_returns', []);
      const item = { ...body, id: `local-return-${Date.now()}`, customer_id: user.id, status: 'pending' };
      writeJson('mastergas_local_returns', [item, ...returns]);
      return { success: true, data: item };
    }
  }

  if (parts[0] === 'dashboard') {
    currentAdmin();
    if (parts[1] === 'products') return productList(query);
    if (parts[1] === 'categories') return paginate(collection('categories'), query);
    if (parts[1] === 'brands') return paginate(collection('brands'), query);
    if (parts[1] === 'offers') return paginate(collection('offers'), query);
    if (parts[1] === 'coupons') return paginate(collection('coupons'), query);
    if (parts[1] === 'settings') return { data: collection('settings') };
    if (parts[1] === 'sliders') return paginate(collection('sliders'), query);
    if (parts[1] === 'orders') return { data: readJson(ORDERS_KEY, []) };
    if (parts[1] === 'returns') return { data: readJson('mastergas_local_returns', []) };
    if (parts[1] === 'customers') return { data: usersFor('customer').map(stripCredentials) };
    if (parts[1] === 'statistics') return { data: { total_products: collection('products').length, total_orders: readJson(ORDERS_KEY, []).length, total_customers: usersFor('customer').length, total_revenue: 0 } };
    if (parts[1] === 'reviews') return paginate(collection('reviews'), query);
    return { data: [] };
  }

  throw localError(404, `Local endpoint not implemented: ${method.toUpperCase()} ${path}`, config);
};

export const localApiAdapter = (config) => new Promise((resolve, reject) => {
  if (config.signal?.aborted) {
    const error = new Error('Request cancelled');
    error.code = 'ERR_CANCELED';
    error.name = 'CanceledError';
    reject(error);
    return;
  }
  try {
    const data = handleRequest(config);
    resolve({ data, status: 200, statusText: 'OK', headers: { 'x-local-data': 'true' }, config, request: null });
  } catch (error) {
    error.config ||= config;
    reject(error);
  }
});

export const LOCAL_DEMO_CREDENTIALS = Object.freeze({
  customer: { email: 'demo@mastergas.local', password: 'demo123' },
  admin: { email: 'admin@mastergas.local', password: 'admin123' },
});
