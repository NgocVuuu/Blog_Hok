import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

const AdminMetaForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });
    if (res.ok) {
      setMessage('Thêm meta thành công!');
      setTitle(''); setDescription('');
    } else {
      setMessage('Có lỗi xảy ra khi thêm meta.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>Thêm meta mới</Typography>
      <TextField label="Tiêu đề" value={title} onChange={e => setTitle(e.target.value)} fullWidth required margin="normal" />
      <TextField label="Mô tả" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline rows={3} margin="normal" />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Thêm meta</Button>
      {message && <Typography color="success.main" mt={2}>{message}</Typography>}
    </Box>
  );
};

export default AdminMetaForm;