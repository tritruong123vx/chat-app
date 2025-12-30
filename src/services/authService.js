import { STORAGE_KEYS } from '../utils/constants';

class AuthService {
  // Lấy access token (dùng cho REST API)
  getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  // Lấy id token (dùng cho WebSocket hoặc decode user info)
  getIdToken() {
    return localStorage.getItem("id_token"); // ✅ đọc idToken đúng key
  }

  // Lấy user info từ idToken (JWT)
  getCurrentUser() {
    const idToken = this.getIdToken();
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
    // Có thể kiểm tra cả accessToken hoặc idToken tùy nhu cầu
    return !!this.getAccessToken() && !!this.getIdToken();
  }

  // Đăng xuất (frontend)
  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem("id_token"); // ✅ xóa idToken
    localStorage.removeItem('refresh_token');

    // Redirect về login
    window.location.href = '/login';
  }

  // Xóa dữ liệu auth (dùng khi token hết hạn hoặc lỗi 401)
  clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem("id_token");
    localStorage.removeItem('refresh_token');
  }
}

export default new AuthService();
