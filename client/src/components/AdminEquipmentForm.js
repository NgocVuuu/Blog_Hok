import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Grid, Divider,
  IconButton, Tooltip
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import ShieldIcon from '@mui/icons-material/Shield';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { GiBroadsword } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';

const AdminEquipmentForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Attack',
    price: 0,
    image: '',
    description: '',
    tier: 'Basic',
    attributes: {
      attack: 0,
      defense: 0,
      magic: 0,
      health: 0,
      mana: 0,
      speed: 0,
      criticalRate: 0,
      criticalDamage: 0,
      penetration: 0,
      magicPenetration: 0,
      lifeSteal: 0,
      magicLifeSteal: 0,
      cooldownReduction: 0,
      attackSpeed: 0,
      movementSpeed: 0,
      armor: 0,
      magicResist: 0
    },
    passive: { name: '', description: '' },
    active: { name: '', description: '', cooldown: 0 },
    quickStats: [], // Array of quick stats for UI only
    customAttributes: [], // Array of custom attributes for UI only
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  // Categories for equipment
  const categories = [
    { value: 'Attack', label: t('equipment.categories.physical', 'Vật lý') },
    { value: 'Magic', label: t('equipment.categories.magic', 'Phép thuật') },
    { value: 'Defense', label: t('equipment.categories.defense', 'Phòng thủ') },
    { value: 'Movement', label: t('equipment.categories.movement', 'Di chuyển') },
    { value: 'Jungle', label: t('equipment.categories.jungle', 'Jungling') }
  ];

  // Quick stats options
  const quickStatsOptions = [
    {
      value: 'magicArmor',
      label: t('equipment.stats.magicArmor', 'Giáp phép'),
      icon: ShieldIcon,
      color: '#7b2ff2'
    },
    {
      value: 'physicalArmor',
      label: t('equipment.stats.physicalArmor', 'Giáp vật lý'),
      icon: ShieldIcon,
      color: '#ff9800'
    },
    {
      value: 'magicAttack',
      label: t('equipment.stats.magicAttack', 'Tấn công phép'),
      icon: GiBroadsword,
      color: '#7b2ff2'
    },
    {
      value: 'physicalAttack',
      label: t('equipment.stats.physicalAttack', 'Tấn công vật lý'),
      icon: GiBroadsword,
      color: '#ff9800'
    },
    {
      value: 'lifeSteal',
      label: t('equipment.stats.lifeSteal', 'Hồi máu'),
      icon: FavoriteIcon,
      color: '#43a047'
    },
    {
      value: 'movementSpeed',
      label: t('equipment.stats.movementSpeed', 'Tốc chạy'),
      icon: DirectionsRunIcon,
      color: '#43a047'
    },
    {
      value: 'attackSpeed',
      label: t('equipment.stats.attackSpeed', 'Tốc đánh'),
      icon: GiBroadsword,
      color: '#43a047'
    },
    {
      value: 'cooldownReduction',
      label: t('equipment.stats.cooldownReduction', 'Giảm hồi chiêu'),
      icon: AccessTimeIcon,
      color: '#43a047'
    },
    {
      value: 'manaRegen',
      label: t('equipment.stats.manaRegen', 'Hồi mana'),
      icon: LocalFireDepartmentIcon,
      color: '#7b2ff2'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Quick stats handlers
  const addQuickStat = () => {
    if (formData.quickStats.length < 5) {
      setFormData(prev => ({
        ...prev,
        quickStats: [...prev.quickStats, { type: '', value: '', description: '' }]
      }));
    }
  };

  const updateQuickStat = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      quickStats: prev.quickStats.map((stat, i) =>
        i === index ? { ...stat, [field]: value } : stat
      )
    }));
  };

  const removeQuickStat = (index) => {
    setFormData(prev => ({
      ...prev,
      quickStats: prev.quickStats.filter((_, i) => i !== index)
    }));
  };

  // Custom Attributes handlers
  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      customAttributes: [...prev.customAttributes, { type: 'passive', name: '', description: '' }]
    }));
  };

  const updateAttribute = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      customAttributes: prev.customAttributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const removeAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      customAttributes: prev.customAttributes.filter((_, i) => i !== index)
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

  // Rich text formatting functions for attributes
  const insertAttributeFormatting = (attributeIndex, format) => {
    const textareaId = `attributeDescription-${attributeIndex}`;
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.customAttributes[attributeIndex].description;
    const selectedText = currentText.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'text'}*`;
        break;
      case 'green':
        formattedText = `<span style="color: #43a047">${selectedText || 'text'}</span>`;
        break;
      case 'orange':
        formattedText = `<span style="color: #ff9800">${selectedText || 'text'}</span>`;
        break;
      case 'purple':
        formattedText = `<span style="color: #7b2ff2">${selectedText || 'text'}</span>`;
        break;
      default:
        formattedText = selectedText;
    }

    const newText = currentText.substring(0, start) + formattedText + currentText.substring(end);
    updateAttribute(attributeIndex, 'description', newText);

    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      setMessage({ type: 'error', text: t('admin.fillRequired', 'Vui lòng điền đầy đủ thông tin bắt buộc (tên và loại trang bị)') });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await handleUpload(imageFile);
      }

      // Transform data to match backend schema
      const backendData = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        image: imageUrl,
        description: formData.customAttributes.length > 0
          ? formData.customAttributes.map(attr => `${attr.type}: ${attr.name} - ${attr.description}`).join('\n')
          : 'Mô tả trang bị',
        tier: 'Basic',
        attributes: {
          attack: 0,
          defense: 0,
          magic: 0,
          health: 0,
          mana: 0,
          speed: 0,
          criticalRate: 0,
          criticalDamage: 0,
          penetration: 0,
          magicPenetration: 0,
          lifeSteal: 0,
          magicLifeSteal: 0,
          cooldownReduction: 0,
          attackSpeed: 0,
          movementSpeed: 0,
          armor: 0,
          magicResist: 0
        },
        passive: formData.customAttributes.find(attr => attr.type === 'passive') || { name: '', description: '' },
        active: formData.customAttributes.find(attr => attr.type === 'active') || { name: '', description: '', cooldown: 0 }
      };

      console.log('Sending equipment data:', JSON.stringify(backendData, null, 2));

      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Token exists' : 'No token found');

      const res = await fetch(`${API_URL}/api/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(backendData),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('admin.addEquipmentSuccess', 'Thêm trang bị thành công!') });
        // Reset form
        setFormData({
          name: '',
          category: 'Attack',
          price: 0,
          image: '',
          description: '',
          tier: 'Basic',
          attributes: {
            attack: 0,
            defense: 0,
            magic: 0,
            health: 0,
            mana: 0,
            speed: 0,
            criticalRate: 0,
            criticalDamage: 0,
            penetration: 0,
            magicPenetration: 0,
            lifeSteal: 0,
            magicLifeSteal: 0,
            cooldownReduction: 0,
            attackSpeed: 0,
            movementSpeed: 0,
            armor: 0,
            magicResist: 0
          },
          passive: { name: '', description: '' },
          active: { name: '', description: '', cooldown: 0 },
          quickStats: [],
          customAttributes: []
        });
        setImageFile(null);
        setImagePreview('');
      } else {
        const error = await res.json();
        console.error('Server error response:', error);
        setMessage({ type: 'error', text: error.message || t('admin.addEquipmentError', 'Có lỗi xảy ra khi thêm trang bị') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || t('admin.addEquipmentError', 'Có lỗi xảy ra khi thêm trang bị') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={3}>{t('admin.addEquipment', 'Thêm trang bị mới')}</Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" mb={2}>{t('admin.basicInfo', 'Thông tin cơ bản')}</Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label={t('equipment.name', 'Tên trang bị')}
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            fullWidth
            required
            margin="normal"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('equipment.category', 'Loại trang bị')}</InputLabel>
            <Select
              value={formData.category}
              onChange={e => handleInputChange('category', e.target.value)}
              label={t('equipment.category', 'Loại trang bị')}
            >
              {categories.map(cat => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label={t('equipment.price', 'Giá (Gold)')}
            type="number"
            value={formData.price}
            onChange={e => handleInputChange('price', parseInt(e.target.value) || 0)}
            fullWidth
            margin="normal"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
            >
              {t('admin.uploadEquipmentImage', 'Upload ảnh trang bị')}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {(imagePreview || formData.image) && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={imagePreview || formData.image}
                  alt="Preview"
                  style={{ maxHeight: 100, maxWidth: 100, objectFit: 'contain' }}
                />
              </Box>
            )}
          </Box>
        </Grid>

        {/* Quick Stats Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">{t('equipment.quickStats', 'Thông số nhanh')}</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addQuickStat}
              disabled={formData.quickStats.length >= 5}
              size="small"
            >
              {t('equipment.addQuickStat', 'Thêm thông số')} ({formData.quickStats.length}/5)
            </Button>
          </Box>
        </Grid>

        {formData.quickStats.map((stat, index) => (
          <Grid item xs={12} key={index}>
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              p: 2,
              mb: 2,
              position: 'relative'
            }}>
              <IconButton
                onClick={() => removeQuickStat(index)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>{t('equipment.statType', 'Loại thông số')}</InputLabel>
                    <Select
                      value={stat.type}
                      onChange={e => updateQuickStat(index, 'type', e.target.value)}
                      label={t('equipment.statType', 'Loại thông số')}
                    >
                      {quickStatsOptions.map(option => {
                        const IconComponent = option.icon;
                        const isReactIcon = IconComponent === GiBroadsword;
                        return (
                          <MenuItem key={option.value} value={option.value}>
                            <Box display="flex" alignItems="center" gap={1}>
                              {isReactIcon ? (
                                <IconComponent
                                  style={{ color: option.color, fontSize: 20 }}
                                />
                              ) : (
                                <IconComponent
                                  sx={{ color: option.color, fontSize: 20 }}
                                />
                              )}
                              {option.label}
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label={t('equipment.statValue', 'Giá trị')}
                    value={stat.value}
                    onChange={e => updateQuickStat(index, 'value', e.target.value)}
                    fullWidth
                    placeholder="VD: +50, 15%"
                  />
                </Grid>

                <Grid item xs={12} md={5}>
                  <TextField
                    label={t('equipment.statDescription', 'Mô tả')}
                    value={stat.description}
                    onChange={e => updateQuickStat(index, 'description', e.target.value)}
                    fullWidth
                    placeholder="VD: Tăng sức mạnh tấn công"
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ))}

        {/* Attributes Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">{t('equipment.attributes', 'Thuộc tính Active/Passive')}</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addAttribute}
              size="small"
            >
              {t('equipment.addAttribute', 'Thêm thuộc tính')}
            </Button>
          </Box>
        </Grid>

        {formData.customAttributes.map((attribute, index) => (
          <Grid item xs={12} key={index}>
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              p: 3,
              mb: 2,
              position: 'relative'
            }}>
              <IconButton
                onClick={() => removeAttribute(index)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>

              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>{t('equipment.attributeType', 'Loại')}</InputLabel>
                    <Select
                      value={attribute.type}
                      onChange={e => updateAttribute(index, 'type', e.target.value)}
                      label={t('equipment.attributeType', 'Loại')}
                    >
                      <MenuItem value="passive">Passive</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={9}>
                  <TextField
                    label={t('equipment.attributeName', 'Tên thuộc tính')}
                    value={attribute.name}
                    onChange={e => updateAttribute(index, 'name', e.target.value)}
                    fullWidth
                    placeholder="VD: Bùng nổ sức mạnh"
                  />
                </Grid>

                <Grid item xs={12}>
                  {/* Formatting Toolbar for this attribute */}
                  <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ mr: 2, alignSelf: 'center' }}>
                      {t('equipment.formatting', 'Định dạng')}:
                    </Typography>
                    <Tooltip title={t('editor.bold', 'Đậm')}>
                      <IconButton onClick={() => insertAttributeFormatting(index, 'bold')} size="small">
                        <FormatBoldIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('editor.italic', 'Nghiêng')}>
                      <IconButton onClick={() => insertAttributeFormatting(index, 'italic')} size="small">
                        <FormatItalicIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('editor.green', 'Màu xanh lá')}>
                      <IconButton onClick={() => insertAttributeFormatting(index, 'green')} size="small" sx={{ color: '#43a047' }}>
                        <FormatColorTextIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('editor.orange', 'Màu cam')}>
                      <IconButton onClick={() => insertAttributeFormatting(index, 'orange')} size="small" sx={{ color: '#ff9800' }}>
                        <FormatColorTextIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('editor.purple', 'Màu tím')}>
                      <IconButton onClick={() => insertAttributeFormatting(index, 'purple')} size="small" sx={{ color: '#7b2ff2' }}>
                        <FormatColorTextIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <TextField
                    id={`attributeDescription-${index}`}
                    label={t('equipment.attributeDescription', 'Mô tả thuộc tính')}
                    value={attribute.description}
                    onChange={e => updateAttribute(index, 'description', e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="VD: Khi tấn công, có 25% cơ hội gây thêm 200 sát thương phép"
                    helperText={t('equipment.attributeHelp', 'Sử dụng toolbar để định dạng text. Hỗ trợ: **đậm**, *nghiêng*, màu sắc')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ))}

        {/* Submit Button */}
        <Grid item xs={12}>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? t('admin.adding', 'Đang thêm...') : t('admin.addEquipment', 'Thêm trang bị')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminEquipmentForm;


