// wsClient.js
const WebSocket = require('ws');
const AuthService = require('./AuthService'); // nếu bạn có file này

const API_CONFIG = {
  WS_URL: 'wss://4wkxsg7k66.execute-api.ap-southeast-2.amazonaws.com/production',
};

// Lấy id_token từ AuthService hoặc localStorage
const token = AuthService.getIdToken(); // ✅ dùng id_token

const ws = new WebSocket(API_CONFIG.WS_URL, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

ws.on('open', () => {
  console.log('✅ Connected to AWS WebSocket API Gateway');
});

ws.on('message', (msg) => {
  console.log('📨 Message:', msg.toString());
});

ws.on('error', (err) => {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', (code, reason) => {
  console.log('🔌 Disconnected:', code, reason.toString());
});
