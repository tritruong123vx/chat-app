import React from 'react';
import {
  Container,
  Button,
  Typography,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

const LoginPage = () => {

 const handleLogin = () => {
  const COGNITO_DOMAIN = 'https://ap-southeast-23dfuhdvar.auth.ap-southeast-2.amazoncognito.com';
  const CLIENT_ID = '3i4hdqgi291i1i9rtticvk9h3i';
  const REDIRECT_URI = `${window.location.origin}/callback`; // không cần encodeURIComponent ở đây
  const SCOPE = 'email openid phone';

  const loginUrl =
    `${COGNITO_DOMAIN}/login` +
    `?client_id=${CLIENT_ID}` +
    `&response_type=token` + // ✅ đổi từ code sang token
    `&scope=${encodeURIComponent(SCOPE)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  // Debug: in ra URL trước khi redirect
  console.log('Cognito login URL:', loginUrl);

  window.location.href = loginUrl;
};


  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <LoginIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />

              <Typography variant="h4" gutterBottom>
                Đăng nhập
              </Typography>

              <Typography variant="body1" color="text.secondary" mb={4}>
                Đăng nhập bằng AWS Cognito
              </Typography>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleLogin}
                sx={{ py: 1.5 }}
              >
                Đăng nhập với Cognito
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
