import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, Alert, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, Container
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from 'react-i18next';

const EditPost = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('guides');
  const [author, setAuthor] = useState('BlogHok');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  // Categories for dropdown
  const categories = [
    { value: 'guides', label: t('news.categories.guides', 'Hướng dẫn') },
    { value: 'updates', label: t('news.categories.updates', 'Cập nhật') },
    { value: 'events', label: t('news.categories.events', 'Sự kiện') },
    { value: 'esports', label: t('news.categories.esports', 'Thể thao điện tử') }
  ];

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/news/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const post = await res.json();
          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category || 'guides');
          setAuthor(post.author || 'BlogHok');
          setImageUrl(post.image || '');
          setImagePreview(post.image || '');
        } else {
          setMessage({ type: 'error', text: t('common.error', 'Không thể tải bài viết') });
        }
      } catch (err) {
        setMessage({ type: 'error', text: t('common.error', 'Có lỗi xảy ra khi tải bài viết') });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPost();
  }, [id, API_URL, t]);

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
      setMessage({ type: 'error', text: t('admin.fillRequired', 'Vui lòng điền đầy đủ thông tin') });
      return;
    }

    setLoading(true);
    try {
      let img = imageUrl;
      if (imageFile) {
        img = await handleUpload(imageFile);
        setImageUrl(img);
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/news/${id}`, {
        method: 'PATCH',
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
        setMessage({ type: 'success', text: t('admin.updateSuccess', 'Cập nhật bài viết thành công!') });
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
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

  if (fetchLoading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" mb={3}>{t('admin.editPost', 'Chỉnh sửa bài viết')}</Typography>

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
          rows={8}
          margin="normal"
          helperText={t('admin.markdownHelp', 'Hỗ trợ Markdown: **bold**, *italic*, [link](url), ![image](url)')}
        />

        <Box mt={2} mb={2}>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
          >
            {imageFile ? t('admin.changeImage', 'Thay đổi ảnh') : t('admin.uploadNewImage', 'Upload ảnh mới')}
            <input type="file" hidden accept="image/*,.avif" onChange={handleImageChange} />
          </Button>
          {imageFile && <Typography ml={2}>{imageFile.name}</Typography>}
          {imagePreview && (
            <Box mt={1}>
              <img
                src={imagePreview}
                alt={t('news.title', 'bài viết')}
                style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }}
              />
            </Box>
          )}
        </Box>

        <Box display="flex" gap={2} mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('common.update', 'Cập nhật bài viết')}
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate('/admin')}
          >
            {t('common.cancel', 'Hủy')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default EditPost;
