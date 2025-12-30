import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../utils/constants';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      // Nếu authorizer yêu cầu Bearer thì giữ nguyên, nếu không thì bỏ Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý response
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.data.token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
      }
    }

    if (error.message === 'Network Error') {
      console.error('Network Error: Kiểm tra CORS configuration trên AWS API Gateway');
      return Promise.reject({
        message: 'Không thể kết nối đến server AWS. Vui lòng kiểm tra CORS configuration.',
        status: 0,
        data: null
      });
    }

    const errorMessage = error.response?.data?.message ||
                         error.response?.data?.error ||
                         error.message ||
                         'Có lỗi xảy ra khi kết nối đến AWS. Vui lòng thử lại!';

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default api;
