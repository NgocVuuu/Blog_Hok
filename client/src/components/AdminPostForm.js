import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

const AdminPostForm = () => {
  const { t } = useTranslation();
  const { fetchWithAuth, openLogin } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('guides');
  const [author, setAuthor] = useState('BlogHok');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [inlineImgSize, setInlineImgSize] = useState('medium');
  const [inlineImgShape, setInlineImgShape] = useState('rectangle');
  const [inlineImgUrl, setInlineImgUrl] = useState('');
  const [inlineImgAlign, setInlineImgAlign] = useState('left');

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

  const onVideoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setVideoUploading(true);
      const url = await handleVideoUpload(file);
      setContent(prev => `${prev}${prev ? '\n\n' : ''}![video](${url})`);
      setMessage({ type: 'success', text: 'Đã tải video và chèn vào nội dung' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Upload video thất bại' });
    } finally {
      setVideoUploading(false);
      // reset input value so same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const appendInlineImageToContent = (url) => {
    const meta = `img|${inlineImgSize}|${inlineImgShape}|${inlineImgAlign}`;
    setContent(prev => `${prev}${prev ? '\n\n' : ''}![${meta}](${url})`);
  };

  const onInlineImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const url = await handleUpload(file);
      appendInlineImageToContent(url);
      setMessage({ type: 'success', text: t('admin.inlineImageInserted', 'Đã chèn ảnh vào nội dung') });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || t('common.error', 'Có lỗi xảy ra') });
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const onInsertInlineFromUrl = () => {
    if (!inlineImgUrl) return;
    appendInlineImageToContent(inlineImgUrl.trim());
    setInlineImgUrl('');
    setMessage({ type: 'success', text: t('admin.inlineImageInserted', 'Đã chèn ảnh vào nội dung') });
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

  const res = await fetchWithAuth(`${API_URL}/api/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        helperText={t('admin.markdownHelp', 'Hỗ trợ Markdown: **bold**, *italic*, [link](url), ![image](url). Khi chèn ảnh bằng nút bên dưới, có thể chọn kích thước (nhỏ/vừa/lớn) và dạng (vuông/chữ nhật).')}
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
        <Button
          sx={{ ml: 2 }}
          variant="outlined"
          component="label"
          disabled={videoUploading}
          startIcon={<UploadIcon />}
        >
          {videoUploading ? t('admin.uploadingVideo', 'Đang upload video...') : t('admin.uploadVideo', 'Upload video')}
          <input type="file" hidden accept="video/*" onChange={onVideoFileChange} />
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

      {/* Inline image insert controls */}
      <Box mt={3} p={2} sx={{ border: '1px dashed #ddd', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>{t('admin.insertInlineImage', 'Chèn ảnh vào nội dung')}</Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="inline-size">{t('admin.imageSize', 'Kích cỡ ảnh')}</InputLabel>
            <Select labelId="inline-size" value={inlineImgSize} label={t('admin.imageSize', 'Kích cỡ ảnh')} onChange={(e) => setInlineImgSize(e.target.value)}>
              <MenuItem value="small">{t('admin.size.small', 'Nhỏ')}</MenuItem>
              <MenuItem value="medium">{t('admin.size.medium', 'Vừa')}</MenuItem>
              <MenuItem value="large">{t('admin.size.large', 'Lớn')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="inline-shape">{t('admin.imageShape', 'Dạng ảnh')}</InputLabel>
            <Select labelId="inline-shape" value={inlineImgShape} label={t('admin.imageShape', 'Dạng ảnh')} onChange={(e) => setInlineImgShape(e.target.value)}>
              <MenuItem value="square">{t('admin.shape.square', 'Vuông')}</MenuItem>
              <MenuItem value="rectangle">{t('admin.shape.rectangle', 'Chữ nhật')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="inline-align">{t('admin.imageAlign', 'Căn ảnh')}</InputLabel>
            <Select labelId="inline-align" value={inlineImgAlign} label={t('admin.imageAlign', 'Căn ảnh')} onChange={(e) => setInlineImgAlign(e.target.value)}>
              <MenuItem value="left">{t('admin.align.left', 'Căn trái')}</MenuItem>
              <MenuItem value="center">{t('admin.align.center', 'Căn giữa')}</MenuItem>
              <MenuItem value="right">{t('admin.align.right', 'Căn phải')}</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
            {t('admin.uploadAndInsert', 'Upload & chèn ảnh')}
            <input type="file" hidden accept="image/*,.avif" onChange={onInlineImageFileChange} />
          </Button>
        </Box>
        <Box display="flex" gap={1.5} mt={2} alignItems="center">
          <TextField size="small" fullWidth label={t('admin.orPasteImageUrl', 'Hoặc dán URL ảnh')} value={inlineImgUrl} onChange={(e) => setInlineImgUrl(e.target.value)} />
          <Button variant="contained" onClick={onInsertInlineFromUrl}>{t('common.insert', 'Chèn')}</Button>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          {t('admin.inlineImageHint', 'Mẹo: Cú pháp sẽ là ![img|kích-cỡ|dạng|căn](url), ví dụ: ![img|small|square|center](https://...)')}
        </Typography>
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