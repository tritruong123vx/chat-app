import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

class ChatService {
  // Lấy danh sách tin nhắn
  async getMessages(roomId = null, page = 1, limit = 50) {
    const endpoint = roomId
      ? API_ENDPOINTS.MESSAGE.GET_BY_ROOM.replace(':roomId', roomId)
      : API_ENDPOINTS.MESSAGE.GET_ALL;

    const res = await api.get(`${endpoint}?page=${page}&limit=${limit}`);
    return res || []; // interceptor đã trả về response.data
  }

  // Gửi tin nhắn
  async sendMessage(messageData) {
    const res = await api.post(API_ENDPOINTS.MESSAGE.SEND, messageData);
    return res; // interceptor đã trả về response.data
  }

  // Lấy danh sách user online
  async getOnlineUsers() {
    const res = await api.get(API_ENDPOINTS.USER.GET_ONLINE);
    return res || [];
  }

  // Lấy tất cả user
  async getAllUsers() {
    const res = await api.get(API_ENDPOINTS.USER.GET_ALL);
    return res || [];
  }

  // Lấy danh sách contacts
  async getContacts() {
    const res = await api.get(API_ENDPOINTS.CONTACTS.GET_ALL);
    return res || [];
  }

  // Lấy danh sách phòng
  async getRooms() {
    const res = await api.get(API_ENDPOINTS.ROOM.GET_ALL);
    return res || [];
  }

  // Tạo phòng mới
  async createRoom(roomData) {
    const res = await api.post(API_ENDPOINTS.ROOM.CREATE, roomData);
    return res;
  }

  // Tham gia phòng
  async joinRoom(roomId) {
    const endpoint = API_ENDPOINTS.ROOM.JOIN.replace(':roomId', roomId);
    const res = await api.post(endpoint);
    return res;
  }

  // Upload file
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  }
}

export default new ChatService();
