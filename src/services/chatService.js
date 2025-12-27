import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

class ChatService {
  // Lấy danh sách tin nhắn
  async getMessages(roomId = null, page = 1, limit = 50) {
    const endpoint = roomId 
      ? API_ENDPOINTS.MESSAGE.GET_BY_ROOM.replace(':roomId', roomId)
      : API_ENDPOINTS.MESSAGE.GET_ALL;
    
    return await api.get(`${endpoint}?page=${page}&limit=${limit}`);
  }

  // Gửi tin nhắn
  async sendMessage(messageData) {
    return await api.post(API_ENDPOINTS.MESSAGE.SEND, messageData);
  }

  // Lấy danh sách user online
  async getOnlineUsers() {
    return await api.get(API_ENDPOINTS.USER.GET_ONLINE);
  }

  // Lấy tất cả user
  async getAllUsers() {
    return await api.get(API_ENDPOINTS.USER.GET_ALL);
  }

  // Lấy danh sách phòng
  async getRooms() {
    return await api.get(API_ENDPOINTS.ROOM.GET_ALL);
  }

  // Tạo phòng mới
  async createRoom(roomData) {
    return await api.post(API_ENDPOINTS.ROOM.CREATE, roomData);
  }

  // Tham gia phòng
  async joinRoom(roomId) {
    const endpoint = API_ENDPOINTS.ROOM.JOIN.replace(':roomId', roomId);
    return await api.post(endpoint);
  }

  // Upload file
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export default new ChatService();