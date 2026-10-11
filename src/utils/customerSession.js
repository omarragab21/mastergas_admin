const TOKEN_KEY = 'c_token';

const getStorage = (kind) => {
  if (kind === 'session') {
    return typeof sessionStorage !== 'undefined' ? sessionStorage : globalThis.sessionStorage || null;
  }
  return typeof localStorage !== 'undefined' ? localStorage : globalThis.localStorage || null;
};

export const getCustomerToken = () => {
  if (typeof window !== 'undefined' && window.location && window.location.search && window.location.search.includes('mockAuth=true')) {
    return 'preview_token';
  }
  return getStorage('local')?.getItem(TOKEN_KEY) || getStorage('session')?.getItem(TOKEN_KEY) || null;
};

export const setCustomerToken = (token, remember = true) => {
  const local = getStorage('local');
  const session = getStorage('session');
  local?.removeItem(TOKEN_KEY);
  session?.removeItem(TOKEN_KEY);
  (remember ? local : session)?.setItem(TOKEN_KEY, token);
};

export const clearCustomerToken = () => {
  getStorage('local')?.removeItem(TOKEN_KEY);
  getStorage('session')?.removeItem(TOKEN_KEY);
};
