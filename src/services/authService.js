import { STORAGE_KEYS } from '../utils/constants';

class AuthService {
  // Lấy access token từ localStorage
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  // Lấy user info từ idToken (JWT)
  getCurrentUser() {
    const idToken = localStorage.getItem(STORAGE_KEYS.USER);
    if (!idToken) return null;

    try {
      // JWT có dạng: header.payload.signature
      const payload = JSON.parse(atob(idToken.split('.')[1]));

      return {
        id: payload.sub, // user id
        username: payload['cognito:username'] || payload.email || 'Unknown',
        email: payload.email,
      };
    } catch (error) {
      console.error('Error decoding idToken:', error);
      return null;
    }
  }

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated() {
    return !!this.getToken();
  }

  // Đăng xuất (frontend)
  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('refresh_token');

    // Redirect về login
    window.location.href = '/login';
  }

  // Xóa dữ liệu auth (dùng khi token hết hạn hoặc lỗi 401)
  clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('refresh_token');
  }
}

export default new AuthService();
