import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.REACT_APP_API_URL;

const AdminPostForm = () => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('guides');
  const [author, setAuthor] = useState('BlogHok');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Categories for dropdown
  const categories = [
    { value: 'guides', label: t('news.categories.guides', 'Hướng dẫn') },
    { value: 'updates', label: t('news.categories.updates', 'Cập nhật') },
    { value: 'events', label: t('news.categories.events', 'Sự kiện') },
    { value: 'esports', label: t('news.categories.esports', 'Thể thao điện tử') }
  ];

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
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error('Upload ảnh thất bại');
    }
    const data = await res.json();
    return data.imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    setLoading(true);
    try {
      let img = imageUrl;
      if (imageFile && !imageUrl) {
        img = await handleUpload(imageFile);
        setImageUrl(img);
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          category,
          author,
          image: img,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('admin.addSuccess', 'Thêm bài viết thành công!') });
        // Reset form
        setTitle('');
        setContent('');
        setCategory('guides');
        setAuthor('BlogHok');
        setImageFile(null);
        setImageUrl('');
        setImagePreview('');
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.message || t('common.error', 'Có lỗi xảy ra') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || t('common.error', 'Có lỗi xảy ra') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>{t('admin.addPost', 'Thêm bài viết mới')}</Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <TextField
        label={t('news.title', 'Tiêu đề')}
        value={title}
        onChange={e => setTitle(e.target.value)}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label={t('news.author', 'Tác giả')}
        value={author}
        onChange={e => setAuthor(e.target.value)}
        fullWidth
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="category-label">{t('news.category', 'Phân loại')}</InputLabel>
        <Select
          labelId="category-label"
          value={category}
          onChange={e => setCategory(e.target.value)}
          label={t('news.category', 'Phân loại')}
        >
          {categories.map((cat) => (
            <MenuItem key={cat.value} value={cat.value}>
              {cat.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label={t('news.content', 'Nội dung')}
        value={content}
        onChange={e => setContent(e.target.value)}
        fullWidth
        required
        multiline
        rows={10}
        margin="normal"
        helperText={t('admin.markdownHelp', 'Hỗ trợ Markdown: **bold**, *italic*, [link](url), ![image](url)')}
      />

      <Box mt={2} mb={2}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
        >
          {t('admin.uploadImage', 'Upload ảnh')}
          <input type="file" hidden accept="image/*,.avif" onChange={handleImageChange} />
        </Button>
        {imageFile && <Typography ml={2}>{imageFile.name}</Typography>}
        {(imagePreview || imageUrl) && (
          <Box mt={1}>
            <img
              src={imagePreview || imageUrl}
              alt={t('news.title', 'bài viết')}
              style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }}
            />
          </Box>
        )}
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : t('admin.addPost', 'Thêm bài viết')}
      </Button>
    </Box>
  );
};

export default AdminPostForm; 