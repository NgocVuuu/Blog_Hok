import React from 'react';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AdminLogin from './AdminLogin';
import { useAuth } from '../contexts/AuthContext';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  width: '100%',
  maxWidth: 420,
};

const LoginModal = () => {
  const { showLoginModal, closeLogin } = useAuth();
  return (
    <Modal open={showLoginModal} onClose={closeLogin} aria-labelledby="admin-login-modal">
      <Box sx={style}>
        <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={closeLogin}>
          <CloseIcon />
        </IconButton>
        <AdminLogin />
      </Box>
    </Modal>
  );
};

export default LoginModal;
