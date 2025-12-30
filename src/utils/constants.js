// src/utils/constants.js

// AWS API GATEWAY CONFIGURATION
export const API_CONFIG = {
  BASE_URL: 'https://0rzoam18wh.execute-api.ap-southeast-2.amazonaws.com', 
  API_PREFIX: '',

  // WebSocket API - Real-time chat
  WS_URL: 'wss://4wkxsg7k66.execute-api.ap-southeast-2.amazonaws.com/production/',

  // AWS Region
  REGION: 'ap-southeast-2'
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    CALLBACK: '/auth/callback'   
  },
  MESSAGE: {
    GET_ALL: '/messages',
    SEND: '/messages'
  },
  CONTACTS: {
    GET_ALL: '/contacts'  
  }
};

// LocalStorage keys
export const STORAGE_KEYS = {
  TOKEN: 'chat_token',
  USER: 'chat_user',
  REFRESH_TOKEN: 'chat_refresh_token' 
};

// Test function
export const testApiConfig = () => {
  console.log('🌐 AWS Endpoints:');
  console.log('- HTTP API:', API_CONFIG.BASE_URL);
  console.log('- WebSocket:', API_CONFIG.WS_URL);
  console.log('- Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`);
};
