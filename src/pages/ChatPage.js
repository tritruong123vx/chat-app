import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Send,
  Logout,
  People,
  Search,
  Add,
  MoreVert,
  Circle,
  AttachFile,
  EmojiEmotions
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import authService from '../services/authService';
import chatService from '../services/chatService';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_CONFIG } from '../utils/constants';


const ChatPage = () => {
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  
  /* ================= HANDLERS ================= */
  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      if (wsRef.current) {
        wsRef.current.close();
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, []);


  /* ================= API FUNCTIONS ================= */
  const fetchMessages = useCallback(async () => {
    try {
      console.log('📡 Fetching messages from AWS...');
      const data = await chatService.getMessages();
      setMessages(data || []);
      console.log(`✅ Loaded ${data?.length || 0} messages`);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showNotification('Không thể tải tin nhắn từ AWS', 'error');
    }
  }, [showNotification]);

  const fetchOnlineUsers = useCallback(async () => {
    try {
      console.log('👥 Fetching online users from AWS...');
      const data = await chatService.getOnlineUsers();
      setUsers(data || []);
      console.log(`✅ Loaded ${data?.length || 0} online users`);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Không hiển thị notification để tránh spam
    }
  }, []);

  /* ================= WEBSOCKET FUNCTION ================= */
  const connectWebSocket = useCallback((token) => {
    try {
      // Sử dụng WebSocket URL từ AWS
      const wsUrl = `${API_CONFIG.WS_URL}?token=${encodeURIComponent(token)}`;
      console.log('🔌 Connecting to AWS WebSocket:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ Connected to AWS WebSocket API Gateway');
        setWsConnected(true);
        showNotification('Đã kết nối real-time chat', 'success');
        
        // Gửi connection message nếu backend yêu cầu
        const connectMessage = {
          action: 'connect',
          token: token,
          userId: currentUser?.id
        };
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(connectMessage));
        }
      };

      wsRef.current.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          console.log('📨 AWS WebSocket message received:', payload);

          // Xử lý các loại message từ AWS
          switch (payload.action || payload.type) {
            case 'NEW_MESSAGE':
            case 'message':
              const messageData = payload.data || payload;
              setMessages(prev => [...prev, messageData]);
              break;

            case 'USER_JOINED':
            case 'user-joined':
              setUsers(prev => [...prev, payload.user || payload.data]);
              break;

            case 'USER_LEFT':
            case 'user-left':
              setUsers(prev => prev.filter(u => u.id !== (payload.userId || payload.data?.userId)));
              break;

            case 'ERROR':
            case 'error':
              console.error('WebSocket error from server:', payload.message);
              break;

            default:
              console.log('Unknown WebSocket message type:', payload);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ AWS WebSocket error:', error);
        setWsConnected(false);
        showNotification('Lỗi kết nối real-time', 'error');
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 AWS WebSocket disconnected:', event.code, event.reason);
        setWsConnected(false);
        
        // Tự động reconnect sau 5 giây nếu không phải là close bình thường
        if (event.code !== 1000 && currentUser) {
          setTimeout(() => {
            console.log('🔄 Reconnecting WebSocket...');
            const newToken = authService.getToken();
            if (newToken) {
              connectWebSocket(newToken);
            }
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }, [currentUser?.id, showNotification]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentUser) return;

    const content = newMessage.trim();
    const tempId = Date.now(); // Temporary ID for optimistic update
    const tempMessage = {
      id: tempId,
      content,
      senderId: currentUser.id,
      sender: { username: currentUser.username },
      timestamp: new Date().toISOString(),
      isTemp: true
    };

    // Optimistic update
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      if (wsRef.current?.readyState === WebSocket.OPEN && wsConnected) {
        // Gửi qua WebSocket
        wsRef.current.send(JSON.stringify({
          action: 'sendmessage',
          data: { content },
          timestamp: new Date().toISOString()
        }));
        
        // Xóa message tạm sau khi gửi thành công
        setTimeout(() => {
          setMessages(prev => prev.filter(m => m.id !== tempId));
        }, 1000);
      } else {
        // Fallback: Gửi qua HTTP API
        console.log('WebSocket not connected, using HTTP API fallback');
        const res = await chatService.sendMessage({ content });
        
        // Thay thế message tạm bằng message thật từ server
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...res, id: res.id || tempId } : m
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Không thể gửi tin nhắn', 'error');
      
      // Đánh dấu message tạm là lỗi
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, error: true } : m
      ));
    }
  }, [newMessage, currentUser, wsConnected, showNotification]);

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      try {
        const user = authService.getCurrentUser();
        const token = authService.getToken();

        if (!user || !token) {
          navigate('/login');
          return;
        }

        setCurrentUser(user);
        console.log('🔑 User authenticated:', user.username);
        console.log('🌐 AWS Endpoint:', API_CONFIG.BASE_URL);
        
        await fetchMessages();
        await fetchOnlineUsers();
        connectWebSocket(token);
      } catch (error) {
        console.error('Initialization error:', error);
        if (error.status === 401) {
          authService.clearAuthData();
          navigate('/login');
        } else if (error.message.includes('Network Error') || error.message.includes('CORS')) {
          showNotification('Không thể kết nối đến AWS. Kiểm tra CORS configuration.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        console.log('🔌 WebSocket disconnected');
      }
    };
  }, [navigate, fetchMessages, fetchOnlineUsers, connectWebSocket, showNotification]);

  /* ================= EFFECTS ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <LoadingSpinner fullScreen />;

  /* ================= RENDER ================= */
  return (
    <Box display="flex" height="100vh">
      {/* Connection Status Bar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 300,
          '& .MuiDrawer-paper': { 
            width: 300,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box p={2} borderBottom={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              <People sx={{ mr: 1, verticalAlign: 'middle' }} /> 
              Online ({users.length})
            </Typography>
            <Box display="flex" alignItems="center">
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  bgcolor: wsConnected ? 'success.main' : 'error.main',
                  mr: 1
                }} 
              />
              <IconButton color="error" onClick={handleLogout} title="Đăng xuất">
                <Logout />
              </IconButton>
            </Box>
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm user..."
            sx={{ mt: 2 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <List sx={{ flex: 1, overflow: 'auto' }}>
          {users.map(user => (
            <ListItem 
              key={user.id} 
              button
              sx={{ 
                bgcolor: currentUser?.id === user.id ? 'action.selected' : 'transparent'
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={<Circle sx={{ fontSize: 10, color: 'success.main' }} />}
                >
                  <Avatar>
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography fontWeight={currentUser?.id === user.id ? 'bold' : 'normal'}>
                    {user.username}
                    {currentUser?.id === user.id && ' (Bạn)'}
                  </Typography>
                }
                secondary={user.email}
              />
              <IconButton size="small">
                <MoreVert fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>

        <Box p={2} borderTop={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Đang đăng nhập: {currentUser?.username}
          </Typography>
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<Add />}
            sx={{ mt: 1 }}
          >
            Tạo nhóm mới
          </Button>
        </Box>
      </Drawer>

      {/* Main Chat Area */}
      <Box flex={1} display="flex" flexDirection="column">
        {/* Chat Header */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            G
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">Global Chat</Typography>
            <Typography variant="body2" color="textSecondary">
              {users.length} thành viên online • {wsConnected ? '🟢 Real-time' : '🔴 Reconnecting...'}
            </Typography>
          </Box>
          <IconButton>
            <People />
          </IconButton>
        </Paper>

        {/* Messages Container */}
        <Box 
          flex={1} 
          p={2} 
          sx={{ 
            overflow: 'auto',
            background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)'
          }}
        >
          {messages.map((message) => {
            const isOwn = message.senderId === currentUser?.id;
            const isTemp = message.isTemp;
            
            return (
              <Box
                key={message.id || message.tempId}
                display="flex"
                justifyContent={isOwn ? 'flex-end' : 'flex-start'}
                mb={2}
              >
                {!isOwn && (
                  <Avatar sx={{ mr: 1, mt: 'auto' }}>
                    {message.sender?.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                )}
                
                <Box 
                  sx={{ 
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start'
                  }}
                >
                  {!isOwn && (
                    <Typography variant="caption" sx={{ ml: 1, mb: 0.5 }}>
                      {message.sender?.username || 'Unknown'}
                    </Typography>
                  )}
                  
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: isOwn ? 'primary.main' : 'grey.100',
                      color: isOwn ? 'white' : 'text.primary',
                      borderRadius: 2,
                      borderTopLeftRadius: isOwn ? 16 : 4,
                      borderTopRightRadius: isOwn ? 4 : 16,
                      opacity: isTemp ? 0.8 : 1,
                      border: message.error ? '1px solid red' : 'none'
                    }}
                  >
                    <Typography>{message.content}</Typography>
                    {isTemp && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                        Đang gửi...
                      </Typography>
                    )}
                  </Paper>
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mt: 0.5, 
                      mx: 1,
                      color: 'text.secondary'
                    }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider' 
          }}
        >
          <Box display="flex" alignItems="center">
            <IconButton disabled={!wsConnected}>
              <AttachFile />
            </IconButton>

            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={wsConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!wsConnected}
              sx={{ mx: 1 }}
            />

            <IconButton disabled={!wsConnected}>
              <EmojiEmotions />
            </IconButton>
            <IconButton 
              color="primary" 
              onClick={sendMessage}
              disabled={!newMessage.trim() || !wsConnected}
            >
              <Send />
            </IconButton>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {wsConnected ? 'Kết nối AWS WebSocket thành công' : 'Đang kết nối với AWS...'}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatPage;