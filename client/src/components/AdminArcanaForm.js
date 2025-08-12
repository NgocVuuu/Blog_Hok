import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Alert, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const AdminArcanaForm = () => {
  const { t } = useTranslation();
  const { fetchWithAuth, openLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    color: 'red',
    description: '',
    recommendedFor: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [autoReset, setAutoReset] = useState(true); // auto clear after add
  const [addCount, setAddCount] = useState(0); // count added this session
  const API_URL = process.env.REACT_APP_API_URL;

  const colors = [
    { value: 'red', label: t('arcana.colors.red', 'Đỏ') },
    { value: 'blue', label: t('arcana.colors.blue', 'Xanh dương') },
    { value: 'green', label: t('arcana.colors.green', 'Xanh lá') }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    const res = await fetchWithAuth(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {},
      body: formDataUpload,
    });
    if (!res.ok) {
      if (res.status === 401) {
        openLogin();
        return;
      }
      throw new Error('Upload ảnh thất bại');
    }
    const data = await res.json();
    return data.imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      setMessage({ type: 'error', text: 'Vui lòng điền tên và mô tả' });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await handleUpload(imageFile);
      }

      const recommendedForArray = formData.recommendedFor;
      const payload = { ...formData, image: imageUrl, recommendedFor: recommendedForArray };
      delete payload.tier; // ensure not sent
      console.log('[Arcana][SUBMIT] Payload:', payload);

      const res = await fetchWithAuth(`${API_URL}/api/arcana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Đã thêm arcana #' + (addCount + 1) });
        setAddCount(c => c + 1);
        if (autoReset) {
          setFormData({
            name: '',
            color: 'red',
            description: '',
            recommendedFor: []
          });
          setImageFile(null);
          setImagePreview('');
        }
      } else {
        const error = await res.json().catch(()=>({}));
        console.warn('[Arcana][SUBMIT][ERROR]', error);
        let msg = error.message || 'Có lỗi xảy ra khi thêm arcana';
        if (error.duplicate) msg = 'Tên arcana đã tồn tại';
        if (Array.isArray(error.details)) msg += ' - ' + error.details.join('; ');
        setMessage({ type: 'error', text: msg });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra khi thêm arcana' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>Thêm Arcana mới</Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Tên Arcana"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            fullWidth
            required
            margin="normal"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Màu sắc</InputLabel>
            <Select
              value={formData.color}
              onChange={e => handleInputChange('color', e.target.value)}
              label="Màu sắc"
            >
              {colors.map((color) => (
                <MenuItem key={color.value} value={color.value}>
                  {color.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Mô tả"
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            fullWidth
            required
            multiline
            rows={3}
            margin="normal"
          />
        </Grid>



  {/* Removed effects & usage fields as requested */}

        <Grid item xs={12}>
          <Box mt={2} mb={2}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload ảnh
              <input type="file" hidden accept="image/*,.avif" onChange={handleImageChange} />
            </Button>
            {imageFile && <Typography ml={2}>{imageFile.name}</Typography>}
            {imagePreview && (
              <Box mt={1}>
                <img
                  src={imagePreview}
                  alt="arcana"
                  style={{ maxHeight: 150, maxWidth: '100%', objectFit: 'contain' }}
                />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2, mr: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Thêm Arcana'}
      </Button>
      <Button
        type="button"
        variant="outlined"
        sx={{ mt: 2, mr: 2 }}
        onClick={() => setAutoReset(r => !r)}
      >{autoReset ? 'Giữ lại sau khi thêm' : 'Tự reset sau khi thêm'}</Button>
      <Button
        type="button"
        variant="text"
        sx={{ mt: 2 }}
        onClick={() => setAddCount(0)}
      >Reset bộ đếm ({addCount})</Button>
    </Box>
  );
};

export default AdminArcanaForm;
