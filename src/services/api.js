import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../utils/constants';

// Tạo instance axios cho AWS API Gateway
const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
  timeout: 15000, // AWS có thể chậm hơn local
  headers: {
    'Content-Type': 'application/json',
    // Header cho AWS API Gateway
    'X-Amz-Date': new Date().toISOString(),
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response cho AWS
api.interceptors.response.use(
  (response) => {
    return response.data; // Trả về data thay vì response object
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Thử refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (response.data.token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
          // Thử lại request ban đầu
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token thất bại, đăng xuất
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    // Xử lý lỗi đặc biệt từ AWS
    if (error.response) {
      const { status, data } = error.response;
      
      // Các lỗi AWS thường gặp
      switch (status) {
        case 403:
          console.error('AWS 403: Check IAM permissions or CORS configuration');
          break;
        case 429:
          console.error('AWS Rate limit exceeded');
          break;
        case 502:
        case 503:
        case 504:
          console.error('AWS Service temporarily unavailable');
          break;
      }
    }
    
    // Network error - thường do CORS
    if (error.message === 'Network Error') {
      console.error('Network Error: Kiểm tra CORS configuration trên AWS API Gateway');
      return Promise.reject({
        message: 'Không thể kết nối đến server AWS. Vui lòng kiểm tra CORS configuration.',
        status: 0,
        data: null
      });
    }
    
    // Xử lý lỗi khác
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