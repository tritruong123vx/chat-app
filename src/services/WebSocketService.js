import { API_CONFIG, STORAGE_KEYS } from '../utils/constants';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageHandler = null;
    this.reconnectTimeout = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  // Kết nối tới WebSocket AWS
  connect() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      console.error('❌ Không có token để kết nối WebSocket');
      return;
    }

    // QUAN TRỌNG: Encode token để tránh lỗi URL
    const encodedToken = encodeURIComponent(token);
    const wsUrl = `${API_CONFIG.WS_URL}?Authorization=${encodedToken}`;
    
    console.log('🔗 Đang kết nối WebSocket với URL:', wsUrl.substring(0, 100) + '...');
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('✅ WebSocket đã kết nối');
      this.reconnectAttempts = 0; // Reset reconnect counter
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Tin nhắn nhận được:', data);
        if (this.messageHandler) {
          this.messageHandler(data);
        }
      } catch (err) {
        console.error('❌ Lỗi parse tin nhắn:', err, 'Raw data:', event.data);
      }
    };

    this.socket.onerror = (error) => {
      console.error('❌ Lỗi WebSocket:', error);
    };

    this.socket.onclose = (event) => {
      console.warn(`🔌 WebSocket đã đóng. Code: ${event.code}, Reason: ${event.reason}`);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(5000 * this.reconnectAttempts, 30000); // Exponential backoff
        console.warn(`🔄 Thử kết nối lại sau ${delay/1000}s (lần ${this.reconnectAttempts})...`);
        this.reconnectTimeout = setTimeout(() => this.connect(), delay);
      } else {
        console.error('🚫 Đã vượt quá số lần thử kết nối lại tối đa');
      }
    };
  }

  // Gửi tin nhắn tới backend
  sendMessage({ roomId, content }) {
    const payload = {
      action: 'sendMessage',
      roomId,
      content
    };
    this._sendPayload(payload, 'tin nhắn');
  }

  // Gửi tin nhắn nhóm
  sendGroupMessage({ groupId, content }) {
    const payload = {
      action: 'sendGroupMessage',
      groupId,
      content
    };
    this._sendPayload(payload, 'tin nhắn nhóm');
  }

  // Gửi ping để giữ kết nối
  sendPing() {
    const payload = { action: 'ping' };
    this._sendPayload(payload, 'ping');
  }

  // Helper method để gửi payload
  _sendPayload(payload, type = 'dữ liệu') {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log(`📤 Gửi ${type}:`, payload);
      this.socket.send(JSON.stringify(payload));
      return true;
    } else {
      console.warn(`⚠️ WebSocket chưa sẵn sàng để gửi ${type}. State: ${this.socket?.readyState}`);
      return false;
    }
  }

  // Đăng ký hàm xử lý tin nhắn
  onMessage(callback) {
    this.messageHandler = callback;
  }

  // Lấy trạng thái kết nối
  getState() {
    if (!this.socket) return 'DISCONNECTED';
    const states = {
      0: 'CONNECTING',
      1: 'OPEN',
      2: 'CLOSING',
      3: 'CLOSED'
    };
    return states[this.socket.readyState] || 'UNKNOWN';
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Ngắt kết nối bởi người dùng');
      clearTimeout(this.reconnectTimeout);
      this.socket = null;
      this.reconnectAttempts = 0;
      console.log('👋 WebSocket đã ngắt kết nối');
    }
  }
}

export default new WebSocketService();