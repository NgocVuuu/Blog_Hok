import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, MenuItem, Select, InputLabel, FormControl, Chip, OutlinedInput, Grid, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UploadIcon from '@mui/icons-material/Upload';

const API_URL = process.env.REACT_APP_API_URL;
const rolesList = ['Marksman', 'Mage', 'Tank', 'Fighter', 'Assassin', 'Support'];
const lanesList = ['Farm Lane', 'Mid Lane', 'Roam', 'Jungle', 'Abyssal Lane'];
const metaTiers = ['S+', 'S', 'A', 'B', 'C'];

const defaultSkills = [
  { icon: '', description: '', iconPreview: '', name: '' },
  { icon: '', description: '', iconPreview: '', name: '' },
  { icon: '', description: '', iconPreview: '', name: '' },
  { icon: '', description: '', iconPreview: '', name: '' },
  { icon: '', description: '', iconPreview: '', name: '' },
];

const skillLabels = ['Nội tại', 'Chiêu 1', 'Chiêu 2', 'Chiêu 3', 'Chiêu 4', 'Đánh thường'];

const AdminHeroForm = ({ editingHero, onFormSubmit }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [roles, setRoles] = useState([]);
  const [lanes, setLanes] = useState([]);
  const [metaTier, setMetaTier] = useState('S');
  const [winRate, setWinRate] = useState('');
  const [pickRate, setPickRate] = useState('');
  const [banRate, setBanRate] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [skills, setSkills] = useState(defaultSkills);
  const [allHeroes, setAllHeroes] = useState([]);
  const [allies, setAllies] = useState([]);
  const [counters, setCounters] = useState([]);
  const [allyDescs, setAllyDescs] = useState({});
  const [counterDescs, setCounterDescs] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [lore, setLore] = useState('');
  const [combo, setCombo] = useState([]);
  const [skins, setSkins] = useState([]);

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/heroes`);
        if (!res.ok) {
          throw new Error('Failed to fetch heroes');
        }
        const data = await res.json();
        setAllHeroes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching heroes:', err);
        setMessage({ type: 'error', text: 'Không thể tải danh sách tướng' });
        setAllHeroes([]);
      }
    };
    fetchHeroes();
  }, []);

  useEffect(() => {
    if (editingHero) {
      setName(editingHero.name);
      setTitle(editingHero.title);
      setRoles(editingHero.roles);
      setLanes(editingHero.lanes);
      setMetaTier(editingHero.metaTier);
      setWinRate(editingHero.winRate.toString());
      setPickRate(editingHero.pickRate.toString());
      setBanRate(editingHero.banRate.toString());
      setImageUrl(editingHero.image);
      setSkills(editingHero.skills.map(skill => ({
        ...skill,
        iconPreview: skill.icon
      })));
      setAllies(editingHero.allies.map(ally => ally.hero));
      setCounters(editingHero.counters.map(counter => counter.hero));
      setAllyDescs(
        editingHero.allies.reduce((acc, ally) => ({
          ...acc,
          [ally.hero]: ally.description
        }), {})
      );
      setCounterDescs(
        editingHero.counters.reduce((acc, counter) => ({
          ...acc,
          [counter.hero]: counter.description
        }), {})
      );
      setLore(editingHero.lore || '');
      setCombo(editingHero.combo || []);
      setSkins(editingHero.skins || []);
    }
  }, [editingHero]);

  const validateNumber = (value, field) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 100) {
      setErrors(prev => ({ ...prev, [field]: 'Giá trị phải từ 0 đến 100' }));
      return false;
    }
    setErrors(prev => ({ ...prev, [field]: '' }));
    return true;
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

  const handleSkillIconChange = (idx, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSkills = [...skills];
        newSkills[idx].icon = file;
        newSkills[idx].iconPreview = reader.result;
        setSkills(newSkills);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Vui lòng đăng nhập lại');
    }
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      throw new Error('Upload ảnh thất bại');
    }
    const data = await res.json();
    return data.imageUrl;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Vui lòng nhập tên tướng';
    if (!title) newErrors.title = 'Vui lòng nhập danh hiệu';
    if (roles.length === 0) newErrors.roles = 'Vui lòng chọn ít nhất một vai trò';
    if (lanes.length === 0) newErrors.lanes = 'Vui lòng chọn ít nhất một lane';
    if (!imageFile && !imageUrl) newErrors.image = 'Vui lòng upload ảnh tướng';
    if (!metaTier) newErrors.metaTier = 'Vui lòng chọn meta tier';
    if (!validateNumber(winRate, 'winRate')) newErrors.winRate = true;
    if (!validateNumber(pickRate, 'pickRate')) newErrors.pickRate = true;
    if (!validateNumber(banRate, 'banRate')) newErrors.banRate = true;
    
    if (skills.length === 0) {
      newErrors.skills = 'Vui lòng nhập thông tin kỹ năng';
    } else {
      const skillsWithDescription = skills.filter(s => s.description.trim());
      if (skillsWithDescription.length === 0) {
        newErrors.skills = 'Vui lòng nhập mô tả cho ít nhất một kỹ năng';
      } else {
        const invalidSkills = skillsWithDescription.filter(s => !s.name.trim());
        if (invalidSkills.length > 0) {
          newErrors.skills = 'Vui lòng nhập tên cho các kỹ năng đã có mô tả';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSkillChange = (idx, field, value) => {
    const newSkills = [...skills];
    if (!newSkills[idx]) {
      newSkills[idx] = { name: '', icon: '', description: '', iconPreview: '' };
    }
    newSkills[idx][field] = value;
    setSkills(newSkills);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      setMessage({ type: 'error', text: 'Vui lòng kiểm tra lại thông tin' });
      return;
    }
    setLoading(true);
    try {
      let img = imageUrl;
      if (imageFile) {
        img = await handleUpload(imageFile);
        setImageUrl(img);
      }
      
      const processedSkills = await Promise.all(skills.map(async (skill, index) => {
        if (!skill.description || !skill.description.trim()) {
          return null;
        }

        let iconUrl = '';
        if (skill.icon instanceof File) {
          iconUrl = await handleUpload(skill.icon);
        } else if (typeof skill.icon === 'string') {
          iconUrl = skill.icon;
        }
        
        return {
          name: skill.name.trim() || `Skill ${index + 1}`,
          description: skill.description.trim(),
          icon: iconUrl
        };
      }));

      const filteredSkills = processedSkills.filter(skill => skill !== null);
      if (filteredSkills.length === 0) {
        throw new Error('Vui lòng nhập ít nhất một kỹ năng');
      }
      
      const payload = {
        name,
        title,
        image: img,
        roles,
        lanes,
        metaTier,
        winRate: parseFloat(winRate),
        pickRate: parseFloat(pickRate),
        banRate: parseFloat(banRate),
        skills: filteredSkills,
        allies: allies.map(id => ({ hero: id, description: allyDescs[id] || '' })),
        counters: counters.map(id => ({ hero: id, description: counterDescs[id] || '' })),
        lore,
        skins,
        combo,
      };
      
      // Debug log
      console.log('Sending payload:', payload);
      console.log('URL:', editingHero ? `${API_URL}/api/heroes/${editingHero._id}` : `${API_URL}/api/heroes`);
      console.log('Method:', editingHero ? 'PUT' : 'POST');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập lại');
      }
      
      const url = editingHero 
        ? `${API_URL}/api/heroes/${editingHero._id}`
        : `${API_URL}/api/heroes`;
      
      const method = editingHero ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        const error = await res.json();
        throw new Error(error.message || 'Có lỗi xảy ra khi thêm tướng');
      }
      
      setMessage({ type: 'success', text: editingHero ? 'Cập nhật tướng thành công!' : 'Thêm tướng thành công!' });
      
      if (!editingHero) {
        setName('');
        setTitle('');
        setRoles([]);
        setLanes([]);
        setMetaTier('S');
        setWinRate('');
        setPickRate('');
        setBanRate('');
        setImageFile(null);
        setImageUrl('');
        setImagePreview('');
        setSkills(defaultSkills);
        setAllies([]);
        setCounters([]);
        setAllyDescs({});
        setCounterDescs({});
        setLore('');
        setCombo([]);
        setSkins([]);
      }
      
      if (onFormSubmit) {
        onFormSubmit();
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra khi thêm tướng' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>
        {editingHero ? 'Chỉnh sửa tướng' : 'Thêm tướng mới'}
      </Typography>
      
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <TextField 
        label="Tên tướng" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        fullWidth 
        required
        margin="normal"
        error={!!errors.name}
        helperText={errors.name}
      />

      <TextField 
        label="Danh hiệu" 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        fullWidth 
        required 
        margin="normal"
        error={!!errors.title}
        helperText={errors.title}
      />

      <FormControl fullWidth margin="normal" error={!!errors.roles}>
        <InputLabel>Vai trò</InputLabel>
        <Select multiple value={roles} onChange={e => setRoles(e.target.value)} input={<OutlinedInput label="Vai trò" />} renderValue={selected => (<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map(value => (<Chip key={value} label={value} />))}</Box>)}>
          {rolesList.map(role => (<MenuItem key={role} value={role}>{role}</MenuItem>))}
        </Select>
        {errors.roles && <Typography color="error" variant="caption">{errors.roles}</Typography>}
      </FormControl>

      <FormControl fullWidth margin="normal" error={!!errors.lanes}>
        <InputLabel>Lane</InputLabel>
        <Select multiple value={lanes} onChange={e => setLanes(e.target.value)} input={<OutlinedInput label="Lane" />} renderValue={selected => (<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map(value => (<Chip key={value} label={value} />))}</Box>)}>
          {lanesList.map(lane => (<MenuItem key={lane} value={lane}>{lane}</MenuItem>))}
        </Select>
        {errors.lanes && <Typography color="error" variant="caption">{errors.lanes}</Typography>}
      </FormControl>

      <FormControl fullWidth margin="normal" error={!!errors.metaTier}>
        <InputLabel>Mức độ meta</InputLabel>
        <Select value={metaTier} onChange={e => setMetaTier(e.target.value)} label="Mức độ meta">
          {metaTiers.map(tier => (<MenuItem key={tier} value={tier}>{tier}</MenuItem>))}
        </Select>
        {errors.metaTier && <Typography color="error" variant="caption">{errors.metaTier}</Typography>}
      </FormControl>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <TextField label="Tỉ lệ thắng (%)" value={winRate} onChange={e => { setWinRate(e.target.value); validateNumber(e.target.value, 'winRate'); }} fullWidth required margin="normal" type="number" error={!!errors.winRate} helperText={errors.winRate} />
        </Grid>
        <Grid item xs={4}>
          <TextField label="Tỉ lệ pick (%)" value={pickRate} onChange={e => { setPickRate(e.target.value); validateNumber(e.target.value, 'pickRate'); }} fullWidth required margin="normal" type="number" error={!!errors.pickRate} helperText={errors.pickRate} />
        </Grid>
        <Grid item xs={4}>
          <TextField label="Tỉ lệ ban (%)" value={banRate} onChange={e => { setBanRate(e.target.value); validateNumber(e.target.value, 'banRate'); }} fullWidth required margin="normal" type="number" error={!!errors.banRate} helperText={errors.banRate} />
        </Grid>
      </Grid>

      <Box mt={2} mb={2}>
        <Button 
          variant="contained" 
          component="label" 
          startIcon={<UploadIcon />}>
          Upload ảnh tướng
          <input type="file" hidden accept="image/*,.avif" onChange={handleImageChange} />
        </Button>
        {imageFile && <Typography ml={2}>{imageFile.name}</Typography>}
        {(imagePreview || imageUrl) && (
          <Box mt={1}>
            <img
              src={imagePreview || imageUrl}
              alt="tướng"
              style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }}
            />
          </Box>
        )}
        {errors.image && <Typography color="error" variant="caption">{errors.image}</Typography>}
      </Box>

      <Box mt={2}>
        <Typography variant="subtitle1">Kỹ năng</Typography>
        {skills.map((skill, idx) => (
          <Box key={idx} display="flex" gap={2} mb={1} alignItems="center">
            <Typography sx={{ minWidth: 80 }}>{skillLabels[idx]}</Typography>
            <TextField 
              label="Tên kỹ năng" 
              value={skill.name} 
              onChange={e => handleSkillChange(idx, 'name', e.target.value)} 
              required={idx < 4 && !!skill.description}
              error={!!errors.skills && !!skill.description && !skill.name && idx < 4}
              sx={{ minWidth: 200 }}
            />
            <Button 
              variant="outlined" 
              component="label" 
              size="small" 
              startIcon={<UploadIcon />}
            >
              Upload icon
              <input 
                type="file" 
                hidden 
                accept="image/*,.avif" 
                onChange={e => handleSkillIconChange(idx, e.target.files[0])} 
              />
            </Button>
            {(skill.iconPreview || skill.icon) && (
              <Box>
                <img 
                  src={skill.iconPreview || skill.icon} 
                  alt="icon" 
                  style={{ maxHeight: 40, maxWidth: 40, objectFit: 'contain' }} 
                />
              </Box>
            )}
            <TextField 
              label="Mô tả" 
              value={skill.description} 
              onChange={e => handleSkillChange(idx, 'description', e.target.value)} 
              required={idx < 4}
              error={!!errors.skills && !skill.description && idx < 4}
              fullWidth
            />
          </Box>
        ))}
        {errors.skills && (
          <Typography color="error" variant="caption">
            {errors.skills}
          </Typography>
        )}
      </Box>

      <Box mt={2} mb={2}>
        <Typography variant="h6">Đồng minh</Typography>
        <Select 
          multiple 
          value={allies} 
          onChange={e => setAllies(e.target.value)} 
          fullWidth 
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(id => {
                const hero = allHeroes.find(h => h._id === id);
                return hero ? (
                  <Chip 
                    key={id} 
                    label={hero.name} 
                    avatar={<img src={hero.image} alt="" width={24} height={24} />} 
                  />
                ) : null;
              })}
            </Box>
          )}
        >
          {Array.isArray(allHeroes) && allHeroes.map(hero => (
            <MenuItem key={hero._id} value={hero._id}>
              {hero.name}
            </MenuItem>
          ))}
        </Select>
        {allies.map(id => (
          <TextField 
            key={id} 
            label={`Mô tả cho ${allHeroes.find(h => h._id === id)?.name || ''}`} 
            value={allyDescs[id] || ''} 
            onChange={e => setAllyDescs({ ...allyDescs, [id]: e.target.value })} 
            fullWidth 
            margin="dense" 
          />
        ))}
      </Box>

      <Box mt={2} mb={2}>
        <Typography variant="h6">Khắc chế</Typography>
        <Select 
          multiple 
          value={counters} 
          onChange={e => setCounters(e.target.value)} 
          fullWidth 
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(id => {
                const hero = allHeroes.find(h => h._id === id);
                return hero ? (
                  <Chip 
                    key={id} 
                    label={hero.name} 
                    avatar={<img src={hero.image} alt="" width={24} height={24} />} 
                    onDelete={() => setCounters(counters.filter(c => c !== id))}
                  />
                ) : null;
              })}
              {selected.length > 0 && (
                <Chip
                  label="Xóa tất cả"
                  color="error"
                  onClick={() => setCounters([])}
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          )}
        >
          {Array.isArray(allHeroes) && allHeroes.map(hero => (
            <MenuItem key={hero._id} value={hero._id}>
              {hero.name}
            </MenuItem>
          ))}
        </Select>
        {counters.map(id => (
          <TextField 
            key={id} 
            label={`Mô tả cho ${allHeroes.find(h => h._id === id)?.name || ''}`} 
            value={counterDescs[id] || ''} 
            onChange={e => setCounterDescs({ ...counterDescs, [id]: e.target.value })} 
            fullWidth 
            margin="dense" 
          />
        ))}
      </Box>

      <TextField 
        label="Xuất thân/Lore" 
        value={lore} 
        onChange={e => setLore(e.target.value)} 
        fullWidth 
        margin="normal"
        multiline
        minRows={2}
      />

      <Box mt={2} mb={2}>
        <Typography variant="subtitle1">Combo Kill</Typography>
        {combo.map((step, idx) => (
          <Box key={idx} display="flex" alignItems="center" gap={2} mb={1}>
            <Typography>Bước {idx + 1}:</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {step.skills.map((skillIdx, sidx) => (
                <Box key={sidx} sx={{ position: 'relative', display: 'inline-block' }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ minWidth: 40, p: 0.5, mx: 0.5 }}
                    disabled
                  >
                    {skillIdx === 5 ? (
                      <span role="img" aria-label="Đánh thường">🗡️</span>
                    ) : skills[skillIdx]?.iconPreview ? (
                      <img src={skills[skillIdx].iconPreview} alt={skills[skillIdx].name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    ) : skillLabels[skillIdx]}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    sx={{ position: 'absolute', top: -8, right: -8, minWidth: 20, p: 0, fontSize: 12 }}
                    onClick={() => setCombo(combo => combo.map((s, i) => i === idx ? { ...s, skills: s.skills.filter((_, j) => j !== sidx) } : s))}
                  >×</Button>
                </Box>
              ))}
            </Box>
            {[0,1,2,3,4,5].map(skillIdx => (
              <Button
                key={skillIdx}
                variant="outlined"
                size="small"
                sx={{ minWidth: 40, p: 0.5, mx: 0.5 }}
                onClick={() => setCombo(combo => combo.map((s, i) => i === idx ? { ...s, skills: [...s.skills, skillIdx] } : s))}
              >
                {skillIdx === 5 ? (
                  <span role="img" aria-label="Đánh thường">🗡️</span>
                ) : skills[skillIdx]?.iconPreview ? (
                  <img src={skills[skillIdx].iconPreview} alt={skills[skillIdx].name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                ) : skillLabels[skillIdx]}
              </Button>
            ))}
            <TextField
              label="Mô tả bước"
              value={step.description}
              onChange={e => setCombo(combo => combo.map((s, i) => i === idx ? { ...s, description: e.target.value } : s))}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <Button color="error" onClick={() => setCombo(combo => combo.filter((_, i) => i !== idx))}>Xóa</Button>
          </Box>
        ))}
        <Button variant="outlined" onClick={() => setCombo([...combo, { skills: [], description: '' }])}>Thêm bước combo</Button>
      </Box>

      <Box mt={2} mb={2}>
        <Typography variant="subtitle1">Skins (Trang phục)</Typography>
        {skins.map((skin, idx) => (
          <Box key={idx} display="flex" alignItems="center" gap={2} mb={1}>
            <TextField
              label="Tên skin"
              value={skin.name}
              onChange={e => setSkins(skins => skins.map((s, i) => i === idx ? { ...s, name: e.target.value } : s))}
              size="small"
              sx={{ minWidth: 180 }}
            />
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<UploadIcon />}
            >
              Upload ảnh
              <input
                type="file"
                hidden
                accept="image/*,.avif"
                onChange={async e => {
                  const file = e.target.files[0];
                  if (file) {
                    const url = await handleUpload(file);
                    setSkins(skins => skins.map((s, i) => i === idx ? { ...s, image: url } : s));
                  }
                }}
              />
            </Button>
            {skin.image && (
              <Box>
                <img src={skin.image} alt={skin.name} style={{ maxHeight: 40, maxWidth: 40, objectFit: 'contain' }} />
              </Box>
            )}
            <Button color="error" onClick={() => setSkins(skins => skins.filter((_, i) => i !== idx))}>Xóa</Button>
          </Box>
        ))}
        <Button variant="outlined" onClick={() => setSkins([...skins, { name: '', image: '' }])}>Thêm skin</Button>
      </Box>

      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : (editingHero ? 'Cập nhật tướng' : 'Thêm tướng')}
      </Button>
    </Box>
  );
};

export default AdminHeroForm; 