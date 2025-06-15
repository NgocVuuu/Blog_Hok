import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Alert, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from 'react-i18next';

const AdminArcanaForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    color: 'red',
    tier: 1,
    description: '',
    effects: '',
    usage: '',
    recommendedFor: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  const colors = [
    { value: 'red', label: t('arcana.colors.red', 'Đỏ') },
    { value: 'blue', label: t('arcana.colors.blue', 'Xanh dương') },
    { value: 'green', label: t('arcana.colors.green', 'Xanh lá') }
  ];

  // Roles removed - not used in current form

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
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formDataUpload,
    });
    if (!res.ok) {
      throw new Error('Upload ảnh thất bại');
    }
    const data = await res.json();
    return data.imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await handleUpload(imageFile);
      }

      const effectsArray = formData.effects.split('\n').filter(effect => effect.trim());
      const recommendedForArray = formData.recommendedFor;

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/arcana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          effects: effectsArray,
          recommendedFor: recommendedForArray
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Thêm arcana thành công!' });
        // Reset form
        setFormData({
          name: '',
          color: 'red',
          tier: 1,
          description: '',
          effects: '',
          usage: '',
          recommendedFor: []
        });
        setImageFile(null);
        setImagePreview('');
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra khi thêm arcana' });
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

        <Grid item xs={12} md={3}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Cấp độ</InputLabel>
            <Select
              value={formData.tier}
              onChange={e => handleInputChange('tier', e.target.value)}
              label="Cấp độ"
            >
              <MenuItem value={1}>Cấp 1</MenuItem>
              <MenuItem value={2}>Cấp 2</MenuItem>
              <MenuItem value={3}>Cấp 3</MenuItem>
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



        <Grid item xs={12}>
          <TextField
            label="Hiệu ứng (mỗi dòng một hiệu ứng)"
            value={formData.effects}
            onChange={e => handleInputChange('effects', e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Cách sử dụng"
            value={formData.usage}
            onChange={e => handleInputChange('usage', e.target.value)}
            fullWidth
            multiline
            rows={2}
            margin="normal"
          />
        </Grid>

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
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Thêm Arcana'}
      </Button>
    </Box>
  );
};

export default AdminArcanaForm;
