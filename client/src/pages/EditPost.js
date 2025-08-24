import React, { useState, useEffect, useRef } from 'react';
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
  const [videoUploading, setVideoUploading] = useState(false);
  // Inline image controls
  const [inlineImgSize, setInlineImgSize] = useState('medium');
  const [inlineImgShape, setInlineImgShape] = useState('rectangle');
  const [inlineImgUrl, setInlineImgUrl] = useState('');
  const [inlineImgAlign, setInlineImgAlign] = useState('left');
  // Inline video controls
  const [inlineVideoSize, setInlineVideoSize] = useState('medium');
  const [inlineVideoAlign, setInlineVideoAlign] = useState('center');
  const [inlineVideoUrl, setInlineVideoUrl] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;
  const contentRef = useRef(null);

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

  // removed: duplicate handleUpload without auth

  const handleVideoUpload = async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/upload/video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload video thất bại');
    }
    const data = await res.json();
    return data.videoUrl;
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('token');
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    let attempt = 0; let lastErr;
    while (attempt < 3) {
      let res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) { const data = await res.json(); return data.imageUrl; }
      const body = await res.json().catch(()=>({}));
      if (res.status === 429) {
        const retryAfterSec = Number(body?.retryAfter) || Number(res.headers.get('retry-after')) || 0;
        const backoff = retryAfterSec > 0 ? retryAfterSec * 1000 : (1000 * Math.pow(2, attempt));
        attempt += 1; if (attempt >= 3) { lastErr = body; break; }
        await wait(backoff); continue;
      }
      if (res.status === 503 || /Cloudinary/i.test(body?.error || body?.message || '') || body?.code === 'CLOUDINARY_ERROR') {
        const res2 = await fetch(`${API_URL}/api/upload/local`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (!res2.ok) { const err2 = await res2.json().catch(() => ({})); throw new Error(err2.error || err2.message || `Upload ảnh thất bại (HTTP ${res2.status})`); }
        const data2 = await res2.json(); return data2.imageUrl;
      }
      lastErr = body; break;
    }
    throw new Error(lastErr?.error || lastErr?.message || `Upload ảnh thất bại`);
  };

  // Insert arbitrary text into content at current caret or selection
  const insertAtCursor = (insertText) => {
    const el = contentRef.current;
    if (!el) {
      setContent((prev) => `${prev}${insertText}`);
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const next = `${before}${insertText}${after}`;
    setContent(next);
    const newPos = start + insertText.length;
    setTimeout(() => {
      try {
        el.focus();
        el.setSelectionRange(newPos, newPos);
      } catch {}
    }, 0);
  };

  const appendInlineImageToContent = (url) => {
    const meta = `img|${inlineImgSize}|${inlineImgShape}|${inlineImgAlign}`;
    insertAtCursor(`![${meta}](${url})`);
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

        {/* Cover image upload moved above content */}
        <Box mt={2} mb={2}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>{t('admin.coverImage', 'Ảnh bìa bài viết')}</Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
          >
            {imageFile ? t('admin.changeImage', 'Thay đổi ảnh bìa') : t('admin.uploadNewImage', 'Upload ảnh bìa')}
            <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" onChange={handleImageChange} />
          </Button>
          {imageFile && <Typography ml={2} component="span">{imageFile.name}</Typography>}
          {imagePreview && (
            <Box mt={1}>
              <img
                src={imagePreview}
                alt={t('news.title', 'bài viết')}
                style={{ maxHeight: 220, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
              />
            </Box>
          )}
        </Box>

        <TextField
          label={t('news.content', 'Nội dung')}
          value={content}
          onChange={e => setContent(e.target.value)}
          inputRef={contentRef}
          fullWidth
          required
          multiline
          rows={24}
          margin="normal"
          helperText={t('admin.markdownHelp', 'Hỗ trợ Markdown: **bold**, *italic*, [link](url), ![image](url), ![video](https://...mp4). Khi chèn ảnh bằng nút bên dưới, có thể chọn kích thước (nhỏ/vừa/lớn) và dạng (vuông/chữ nhật).')}
        />

        

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
              <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" onChange={onInlineImageFileChange} />
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

        {/* Inline video insert controls */}
        <Box mt={3} p={2} sx={{ border: '1px dashed #ddd', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>{t('admin.insertInlineVideo', 'Chèn video vào nội dung')}</Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="inline-video-size">{t('admin.videoSize', 'Kích cỡ video')}</InputLabel>
              <Select labelId="inline-video-size" value={inlineVideoSize} label={t('admin.videoSize', 'Kích cỡ video')} onChange={(e) => setInlineVideoSize(e.target.value)}>
                <MenuItem value="small">{t('admin.size.small', 'Nhỏ')}</MenuItem>
                <MenuItem value="medium">{t('admin.size.medium', 'Vừa')}</MenuItem>
                <MenuItem value="large">{t('admin.size.large', 'Lớn')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="inline-video-align">{t('admin.videoAlign', 'Căn video')}</InputLabel>
              <Select labelId="inline-video-align" value={inlineVideoAlign} label={t('admin.videoAlign', 'Căn video')} onChange={(e) => setInlineVideoAlign(e.target.value)}>
                <MenuItem value="left">{t('admin.align.left', 'Căn trái')}</MenuItem>
                <MenuItem value="center">{t('admin.align.center', 'Căn giữa')}</MenuItem>
                <MenuItem value="right">{t('admin.align.right', 'Căn phải')}</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" component="label" startIcon={<UploadIcon />} disabled={videoUploading}>
              {videoUploading ? t('admin.uploadingVideo', 'Đang upload video...') : t('admin.uploadAndInsertVideo', 'Upload & chèn video')}
              <input type="file" hidden accept="video/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setVideoUploading(true);
                  const url = await handleVideoUpload(file);
                  const meta = `video|${inlineVideoSize}|${inlineVideoAlign}`;
                  insertAtCursor(`![${meta}](${url})`);
                  setMessage({ type: 'success', text: t('admin.inlineVideoInserted', 'Đã chèn video vào nội dung') });
                } catch (err) {
                  setMessage({ type: 'error', text: err.message || t('common.error', 'Có lỗi xảy ra') });
                } finally {
                  setVideoUploading(false);
                  e.target.value = '';
                }
              }} />
            </Button>
          </Box>
          <Box display="flex" gap={1.5} mt={2} alignItems="center">
            <TextField size="small" fullWidth label={t('admin.orPasteVideoUrl', 'Hoặc dán URL video')} value={inlineVideoUrl} onChange={(e) => setInlineVideoUrl(e.target.value)} />
            <Button variant="contained" onClick={() => {
              if (!inlineVideoUrl) return;
              const meta = `video|${inlineVideoSize}|${inlineVideoAlign}`;
              setContent(prev => `${prev}${prev ? '\n\n' : ''}![${meta}](${inlineVideoUrl.trim()})`);
              setInlineVideoUrl('');
              setMessage({ type: 'success', text: t('admin.inlineVideoInserted', 'Đã chèn video vào nội dung') });
            }}>{t('common.insert', 'Chèn')}</Button>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            {t('admin.inlineVideoHint', 'Mẹo: Cú pháp sẽ là ![video|kích-cỡ|căn](url), ví dụ: ![video|medium|center](https://...)')}
          </Typography>
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
