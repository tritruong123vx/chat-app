import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  ChatBubble,
  Group,
  Security,
  Bolt
} from '@mui/icons-material';
import authService from '../services/authService';

const HomePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/chat');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 12,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom fontWeight="bold">
            Welcome to Chat App
          </Typography>
          <Typography variant="h5" paragraph>
            Kết nối và trò chuyện với mọi người một cách an toàn và nhanh chóng
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleGetStarted}
            sx={{ mt: 4, px: 6, py: 1.5 }}
          >
            {isAuthenticated ? 'Vào Chat ngay' : 'Bắt đầu ngay'}
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Tính năng nổi bật
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <ChatBubble color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Chat thời gian thực
                </Typography>
                <Typography color="text.secondary">
                  Tin nhắn được gửi và nhận ngay lập tức với WebSocket
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Security color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Bảo mật JWT
                </Typography>
                <Typography color="text.secondary">
                  Xác thực an toàn với JSON Web Token, token tự động refresh
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Group color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Quản lý nhóm
                </Typography>
                <Typography color="text.secondary">
                  Tạo và quản lý nhiều phòng chat, mời bạn bè tham gia
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Bolt color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Hiệu suất cao
                </Typography>
                <Typography color="text.secondary">
                  Tối ưu cho AWS, tải nhanh, trải nghiệm mượt mà
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* API Demo Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container>
          <Typography variant="h3" align="center" gutterBottom>
            Cách thức hoạt động
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    1. Đăng nhập & Lấy Token
                  </Typography>
                  <Typography>
                    Frontend gửi credentials đến backend, nhận về JWT token
                  </Typography>
                  <Box component="pre" sx={{ mt: 2, p: 2, bgcolor: 'black', color: 'lime' }}>
                    POST /api/auth/login<br/>
                    {"{"}<br/>
                    &nbsp;&nbsp;"username": "user123",<br/>
                    &nbsp;&nbsp;"password": "password123"<br/>
                    {"}"}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    2. Gọi API với Token
                  </Typography>
                  <Typography>
                    Token được tự động thêm vào header mỗi request
                  </Typography>
                  <Box component="pre" sx={{ mt: 2, p: 2, bgcolor: 'black', color: 'lime' }}>
                    GET /api/messages<br/>
                    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    3. Real-time với WebSocket
                  </Typography>
                  <Typography>
                    Kết nối WebSocket với token để nhận tin nhắn thời gian thực
                  </Typography>
                  <Box component="pre" sx={{ mt: 2, p: 2, bgcolor: 'black', color: 'lime' }}>
                    WebSocket: ws://server/ws?token=eyJhb...
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;