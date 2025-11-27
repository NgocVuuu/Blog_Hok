import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from '../i18nShim';
import { useAuth } from '../contexts/AuthContext';
import MarkdownEditor from './MarkdownEditor';

const API_URL = process.env.REACT_APP_API_URL;

const AdminPostForm = ({ editingPost, onFormSubmit }) => {
  const { t } = useTranslation();
  const { fetchWithAuth, openLogin } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState('');
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

  // Populate form when editingPost changes
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setContent(editingPost.content || '');
      setSummary(editingPost.summary || '');
      setKeywords(editingPost.keywords || '');
      setCategory(editingPost.category || 'guides');
      setAuthor(editingPost.author || 'BlogHok');
      setImageUrl(editingPost.image || '');
      setImagePreview(editingPost.image || '');

      // If content is missing (e.g. from list view), fetch full details
      if (!editingPost.content) {
        const fetchFullPost = async () => {
          try {
            const res = await fetchWithAuth(`${API_URL}/api/news/${editingPost._id}`);
            if (res.ok) {
              const fullPost = await res.json();
              setContent(fullPost.content || '');
              setSummary(fullPost.summary || '');
              setKeywords(fullPost.keywords || '');
            }
          } catch (err) {
            console.error('Error fetching full post details:', err);
          }
        };
        fetchFullPost();
      }
    } else {
      // Reset form
      setTitle('');
      setContent('');
      setSummary('');
      setKeywords('');
      setCategory('guides');
      setAuthor('BlogHok');
      setImageFile(null);
      setImageUrl('');
      setImagePreview('');
    }
  }, [editingPost, fetchWithAuth]);

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
    const res = await fetchWithAuth(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
    if (!res.ok) {
      if (res.status === 401) {
        openLogin();
        return;
      }
      const primaryErr = await res.json().catch(() => ({}));
      // Fallback to local upload when Cloudinary is unavailable
      if (
        res.status === 503 ||
        /Cloudinary/i.test(primaryErr?.error || primaryErr?.message || '') ||
        primaryErr?.code === 'CLOUDINARY_ERROR'
      ) {
        const res2 = await fetchWithAuth(`${API_URL}/api/upload/local`, {
          method: 'POST',
          headers: {},
          body: formData,
        });
        if (!res2.ok) {
          const err2 = await res2.json().catch(() => ({}));
          throw new Error(err2.error || err2.message || `Upload ảnh thất bại (HTTP ${res2.status})`);
        }
        const data2 = await res2.json();
        return data2.imageUrl;
      }
      throw new Error(primaryErr.error || primaryErr.message || `Upload ảnh thất bại (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.imageUrl;
  };

  const handleVideoUpload = async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    const res = await fetchWithAuth(`${API_URL}/api/upload/video`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
    if (!res.ok) {
      if (res.status === 401) {
        openLogin();
        return;
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload video thất bại');
    }
    const data = await res.json();
    return data.videoUrl;
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
      if (imageFile && (!imageUrl || imageFile)) { // Upload if new file selected
        img = await handleUpload(imageFile);
        setImageUrl(img);
      }

      const url = editingPost
        ? `${API_URL}/api/news/${editingPost._id}`
        : `${API_URL}/api/news`;

      const method = editingPost ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          summary,
          keywords,
          category,
          author,
          image: img,
        }),
      });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: editingPost
            ? t('admin.updateSuccess', 'Cập nhật bài viết thành công!')
            : t('admin.addSuccess', 'Thêm bài viết thành công!')
        });

        if (!editingPost) {
          // Reset form only if adding new
          setTitle('');
          setContent('');
          setSummary('');
          setKeywords('');
          setCategory('guides');
          setAuthor('BlogHok');
          setImageFile(null);
          setImageUrl('');
          setImagePreview('');
        }

        if (onFormSubmit) {
          onFormSubmit();
        }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">
          {editingPost ? t('admin.editPost', 'Sửa bài viết') : t('admin.addPost', 'Thêm bài viết mới')}
        </Typography>
        {editingPost && (
          <Button variant="outlined" size="small" onClick={onFormSubmit}>
            {t('common.cancel', 'Hủy')}
          </Button>
        )}
      </Box>

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

      <Typography variant="subtitle1" fontWeight={600} mt={2} mb={1}>{t('news.content', 'Nội dung')}</Typography>
      <MarkdownEditor
        value={content}
        onChange={setContent}
        onImageUpload={handleUpload}
        onVideoUpload={handleVideoUpload}
      />

      <TextField
        label={t('news.summary', 'Mô tả ngắn (SEO)')}
        value={summary}
        onChange={e => setSummary(e.target.value)}
        fullWidth
        multiline
        rows={3}
        margin="normal"
        helperText={t('admin.summaryHelp', 'Mô tả ngắn cho SEO (150-160 ký tự)')}
      />

      <TextField
        label={t('news.keywords', 'Từ khóa (SEO)')}
        value={keywords}
        onChange={e => setKeywords(e.target.value)}
        fullWidth
        margin="normal"
        helperText={t('admin.keywordsHelp', 'Các từ khóa cách nhau bởi dấu phẩy')}
      />

      <Box mt={2} mb={2}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
        >
          {t('admin.uploadImage', 'Upload ảnh bìa')}
          <input type="file" hidden accept="image/*,.avif" onChange={handleImageChange} />
        </Button>
        {imageFile && <Typography ml={2} component="span">{imageFile.name}</Typography>}
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
        {loading ? <CircularProgress size={24} /> : (editingPost ? t('common.update', 'Cập nhật') : t('admin.addPost', 'Thêm bài viết'))}
      </Button>
    </Box>
  );
};

export default AdminPostForm;