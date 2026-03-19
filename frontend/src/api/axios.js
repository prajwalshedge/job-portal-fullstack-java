import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// ── Request: attach access token ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: silent token refresh on 401 ────────────────────────────────────
let refreshing = false;
let waitQueue  = [];   // requests that arrived while a refresh was in flight

const flushQueue = (error, token = null) => {
  waitQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  waitQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    const is401          = err.response?.status === 401;
    const alreadyRetried = original._retry;
    const isRefreshCall  = original.url?.includes('/auth/refresh');

    if (!is401 || alreadyRetried || isRefreshCall) {
      return Promise.reject(err);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) { clearAndRedirect(); return Promise.reject(err); }

    // If a refresh is already running, queue this request
    if (refreshing) {
      return new Promise((resolve, reject) => waitQueue.push({ resolve, reject }))
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
    }

    original._retry = true;
    refreshing      = true;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
        { refresh_token: refreshToken }
      );
      const newAccess = data.accessToken;
      localStorage.setItem('accessToken', newAccess);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      flushQueue(null, newAccess);

      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (refreshErr) {
      flushQueue(refreshErr, null);
      clearAndRedirect();
      return Promise.reject(refreshErr);
    } finally {
      refreshing = false;
    }
  }
);

function clearAndRedirect() {
  localStorage.clear();
  window.location.href = '/login';
}

export default api;
