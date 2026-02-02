import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from '../i18nShim';
import { useAuth } from '../contexts/AuthContext';
// Import TinyMCE via script loading to avoid bundling issues with self-hosted version
import { Editor } from '@tinymce/tinymce-react';
import TurndownService from 'turndown';
import { strikethrough, taskListItems } from 'turndown-plugin-gfm';
import showdown from 'showdown';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';

const AdminPostForm = ({ editingPost, onFormSubmit, onPostUpdated }) => {
  const { t } = useTranslation();
  const { fetchWithAuth, openLogin } = useAuth();
  const [title, setTitle] = useState('');
  // const [content, setContent] = useState(''); // Content state not needed for uncontrolled editor
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('guides');
  const [author, setAuthor] = useState('BlogHok');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState('draft'); // Default to draft
  const [loading, setLoading] = useState(false);
  
  const editorRef = useRef(null);
  const initialContentRef = useRef('');

  // No getSunEditorInstance needed for TinyMCE

  // Converters
  const turndownService = useMemo(() => {
    const service = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    // Use specific GFM plugins, but EXCLUDE 'tables' so we can keep them as HTML
    // This prevents loss of formatting and potential corruption during Markdown <-> HTML cycles
    service.use([strikethrough, taskListItems]);
    service.keep(['table']); // Keep tables as HTML to preserve structure
    return service;
  }, []);

  const showdownConverter = useMemo(() => {
    return new showdown.Converter({
      tables: true,
      simplifiedAutoLink: true,
      strikethrough: true,
      tasklists: true,
      // Ensure we don't accidentally wrap images in paragraphs inside tables
      // which might confuse the editor
      simpleLineBreaks: false 
    });
  }, []);


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
      setSummary(editingPost.summary || '');
      setKeywords(editingPost.keywords || '');
      setCategory(editingPost.category || 'guides');
      setAuthor(editingPost.author || 'BlogHok');
      setStatus(editingPost.status || 'published');
      setImageUrl(editingPost.image || '');
      setImagePreview(editingPost.image || '');

      const loadContent = (markdown) => {
        const html = showdownConverter.makeHtml(markdown || '');
        // Set initial content for TinyMCE
        initialContentRef.current = html;
        if (editorRef.current) {
           editorRef.current.setContent(html);
        }
      };

      // If content is missing (e.g. from list view), fetch full details
      if (!editingPost.content) {
        const fetchFullPost = async () => {
          try {
            const res = await fetchWithAuth(`${API_URL}/api/news/${editingPost._id}`);
            if (res.ok) {
              const fullPost = await res.json();
              // Only load content if we are still editing the same post
              if (editingPost._id === fullPost._id) {
                loadContent(fullPost.content);
                if (!editingPost.summary) setSummary(fullPost.summary || '');
                if (!editingPost.keywords) setKeywords(fullPost.keywords || '');
              }
            }
          } catch (err) {
            console.error('Error fetching full post details:', err);
          }
        };
        fetchFullPost();
      } else {
        loadContent(editingPost.content);
      }
    } else {
      // Reset form
      setTitle('');
      initialContentRef.current = '';
      if (editorRef.current) {
         editorRef.current.setContent('');
      }
      setSummary('');
      setKeywords('');
      setCategory('guides');
      setAuthor('BlogHok');
      setStatus('draft');
      setImageFile(null);
      setImageUrl('');
      setImagePreview('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPost?._id, fetchWithAuth, showdownConverter]);

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

  const handleUpload = useCallback(async (file) => {
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
  }, [fetchWithAuth, openLogin]);

  // handleVideoUpload removed as unused for now

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get content from TinyMCE
    let finalContentHTML = '';
    if (editorRef.current) {
        finalContentHTML = editorRef.current.getContent();
    }
    
    // Convert to markdown only at submission time
    const finalContentMarkdown = turndownService.turndown(finalContentHTML || '');

    if (!title || !finalContentMarkdown) {
      toast.error('Vui lòng điền đầy đủ thông tin');
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
          content: finalContentMarkdown,
          summary,
          keywords,
          category,
          author,
          status,
          image: img,
        }),
      });

      if (res.ok) {
        toast.success(
          editingPost
            ? t('admin.updateSuccess', 'Cập nhật bài viết thành công!')
            : t('admin.addSuccess', 'Thêm bài viết thành công!')
        );

        if (!editingPost) {
          // Reset form only if adding new
          setTitle('');
          initialContentRef.current = '';
          if (editorRef.current) {
            editorRef.current.setContent('');
          }
          setSummary('');
          setKeywords('');
          setCategory('guides');
          setAuthor('BlogHok');
          setStatus('draft');
          setImageFile(null);
          setImageUrl('');
          setImagePreview('');
        }

        if (onFormSubmit && !editingPost) {
          // Only close/reset if adding new. For editing, keep form open.
          onFormSubmit();
        }

        // Trigger generic update callback (for list refresh) regardless of mode
        if (onPostUpdated) {
          onPostUpdated();
        }
      } else {
        const error = await res.json();
        toast.error(error.message || t('common.error', 'Có lỗi xảy ra'));
      }
    } catch (err) {
      toast.error(err.message || t('common.error', 'Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
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

      <FormControl fullWidth margin="normal">
        <InputLabel id="status-label">{t('news.status', 'Trạng thái')}</InputLabel>
        <Select
          labelId="status-label"
          value={status}
          onChange={e => setStatus(e.target.value)}
          label={t('news.status', 'Trạng thái')}
        >
          <MenuItem value="draft">{t('news.draft', 'Nháp (Draft)')}</MenuItem>
          <MenuItem value="published">{t('news.published', 'Công khai (Published)')}</MenuItem>
        </Select>
      </FormControl>

      <Typography variant="subtitle1" fontWeight={600} mt={2} mb={1}>{t('news.content', 'Nội dung')}</Typography>
      
      <Box sx={{ mb: 2, border: '1px solid #ccc', borderRadius: 1 }}>
        <Editor
          // Point to the CDN version explicitly. This ensures all plugins and skins are loaded correctly
          // without needing complex webpack copy configurations for self-hosting.
          tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js"
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={initialContentRef.current}
          init={{
            min_height: 500,
            menubar: true,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'autoresize'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help | image media table code',
            toolbar_sticky: true,
            toolbar_sticky_offset: 64, 
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; img { max-width: 100%; height: auto; } }',
            images_upload_handler: async (blobInfo) => {
               try {
                   const file = blobInfo.blob();
                   const url = await handleUpload(file);
                   return url;
               } catch (err) {
                   throw new Error("Upload failed: " + err.message);
               }
            }
          }}
        />
      </Box>

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