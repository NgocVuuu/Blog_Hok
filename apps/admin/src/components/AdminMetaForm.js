import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const AdminMetaForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // const [message, setMessage] = useState(''); // Replaced by toast
  const API_URL = process.env.REACT_APP_API_URL;
  const { fetchWithAuth, openLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetchWithAuth(`${API_URL}/api/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });

    if (res.ok) {
      toast.success('Meta added successfully!');
      setTitle(''); setDescription('');
    } else {
      toast.error('Error adding meta.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>Add new meta</Typography>
      <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth required margin="normal" />
      <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline rows={3} margin="normal" />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Add meta</Button>
      {/* {message && <Typography color="success.main" mt={2}>{message}</Typography>} */}
    </Box>
  );
};

export default AdminMetaForm;