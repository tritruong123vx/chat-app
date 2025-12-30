import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { STORAGE_KEYS } from '../utils/constants';

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const idToken = params.get('id_token');
    const accessToken = params.get('access_token');

    console.log('Tokens from URL:', { idToken, accessToken });

    if (!idToken || !accessToken) {
      console.error('No token found in URL');
      navigate('/login', { replace: true });
      return;
    }

    // ✅ Lưu token đúng key
    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    localStorage.setItem("id_token", idToken);

    navigate('/chat', { replace: true });
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2 }} color="text.secondary">
        Đang xác thực đăng nhập...
      </Typography>
    </Box>
  );
}

export default Callback;
