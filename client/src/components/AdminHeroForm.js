import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, MenuItem, Select, InputLabel, FormControl, Chip, OutlinedInput, Grid, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UploadIcon from '@mui/icons-material/Upload';

const API_URL = process.env.REACT_APP_API_URL;
const rolesList = ['Marksman', 'Mage', 'Tank', 'Fighter', 'Assassin', 'Support'];
const lanesList = ['Farm Lane', 'Mid Lane', 'Roam', 'Jungle', 'Abyssal Lane'];
const metaTiers = ['S+', 'S', 'A', 'B', 'C'];

// UI hiển thị tối đa 5 ô kỹ năng. Yêu cầu mới: chỉ cần >= 1 kỹ năng (tên + mô tả) đầy đủ.
// Các kỹ năng khác đều tùy chọn; chỉ gửi những kỹ năng đủ cả tên & mô tả.
// Slug được backend tự sinh từ name nên client không cần gửi.
const defaultSkills = [
  { icon: '', description: '', iconPreview: '', name: '' }, // Nội tại
  { icon: '', description: '', iconPreview: '', name: '' }, // Chiêu 1
  { icon: '', description: '', iconPreview: '', name: '' }, // Chiêu 2
  { icon: '', description: '', iconPreview: '', name: '' }, // Chiêu 3 (Ultimate)
  { icon: '', description: '', iconPreview: '', name: '' }, // Chiêu 4 (Optional)
];

const skillLabels = ['Nội tại', 'Chiêu 1', 'Chiêu 2', 'Chiêu 3', 'Chiêu 4'];
// Basic attack is treated as virtual index after the (up to) 5 skills.
const BASIC_ATTACK_INDEX = 5;
const BASIC_ATTACK_LABEL = 'Đánh thường';

const AdminHeroForm = ({ editingHero, onFormSubmit }) => {
  const { id: routeHeroId } = useParams();
  const { fetchWithAuth, openLogin } = useAuth();
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
  const [goodAgainst, setGoodAgainst] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [lore, setLore] = useState('');
  const [combo, setCombo] = useState([]);
  const [skins, setSkins] = useState([]);
  const [fetchedHero, setFetchedHero] = useState(null);
  // Use fetchedHero (full detail) to override initial partial editingHero from list
  const editingHeroData = fetchedHero || editingHero;

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
  const res = await fetch(`${API_URL}/api/heroes`); // public list
        if (!res.ok) throw new Error('Failed to fetch heroes');
        const response = await res.json();
        const data = response?.success ? response.data : (Array.isArray(response) ? response : []);
        setAllHeroes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching heroes:', err);
        setMessage({ type: 'error', text: 'Không thể tải danh sách tướng' });
        setAllHeroes([]);
      }
    };
    fetchHeroes();
  }, []);

  // Auto fetch hero if route has id and no editingHero prop passed
  useEffect(() => {
    let ignore = false;
    const fetchHero = async () => {
      if (!editingHero && routeHeroId) {
        try {
          const res = await fetch(`${API_URL}/api/heroes/${routeHeroId}`);
          if (!res.ok) throw new Error('Không lấy được dữ liệu tướng');
          const data = await res.json();
          if (!ignore) setFetchedHero(data);
        } catch (e) {
          console.error(e);
          if (!ignore) setMessage({ type: 'error', text: 'Không tải được dữ liệu tướng để sửa' });
        }
      }
    };
    fetchHero();
    return () => { ignore = true; };
  }, [routeHeroId, editingHero]);

  // Populate form when we have editingHeroData
  useEffect(() => {
    if (editingHeroData) {
  console.log('Editing hero data loaded:', editingHeroData);
      setName(editingHeroData.name || '');
      setTitle(editingHeroData.title || '');
      setRoles(Array.isArray(editingHeroData.roles) ? editingHeroData.roles : []);
      setLanes(Array.isArray(editingHeroData.lanes) ? editingHeroData.lanes : []);
      setMetaTier(editingHeroData.metaTier || 'S');
      setWinRate(editingHeroData.winRate != null ? String(editingHeroData.winRate) : '');
      setPickRate(editingHeroData.pickRate != null ? String(editingHeroData.pickRate) : '');
      setBanRate(editingHeroData.banRate != null ? String(editingHeroData.banRate) : '');
      setImageUrl(editingHeroData.image || '');
  // Normalize skills list to always show 5 slots (last one optional)
  let normalizedSkills = Array.isArray(editingHeroData.skills) ? editingHeroData.skills.map(s => ({ ...s, iconPreview: s.icon })) : [];
  while (normalizedSkills.length < 5) normalizedSkills.push({ icon: '', description: '', iconPreview: '', name: '' });
  if (normalizedSkills.length > 5) normalizedSkills = normalizedSkills.slice(0,5);
      setSkills(normalizedSkills);
      const alliesArr = Array.isArray(editingHeroData.allies) ? editingHeroData.allies : [];
      setAllies(alliesArr.map(a => a.hero));
      const countersArr = Array.isArray(editingHeroData.counters) ? editingHeroData.counters : [];
      setCounters(countersArr.map(c => c.hero));
      const goodAgainstArr = Array.isArray(editingHeroData.goodAgainst) ? editingHeroData.goodAgainst : [];
      setGoodAgainst(goodAgainstArr.map(g => g.hero));
      setLore(editingHeroData.lore || '');
      setCombo(Array.isArray(editingHeroData.combo) ? editingHeroData.combo : []);
      setSkins(Array.isArray(editingHeroData.skins) ? editingHeroData.skins : []);
    }
  }, [editingHeroData]);

  // If editingHero prop is partial, fetch full details
  useEffect(() => {
    if (editingHero && (!editingHero.skills || editingHero.skills.length === 0 || editingHero.lore === undefined)) {
      (async () => {
        try {
          const res = await fetch(`${API_URL}/api/heroes/${editingHero._id}`);
          if (res.ok) {
            const data = await res.json();
            setFetchedHero(data);
          }
        } catch (err) {
          console.error('Failed to fetch full hero details', err);
        }
      })();
    }
  }, [editingHero]);

  const validateNumber = (value, field) => {
    // Relaxed: only check not negative; let server enforce 0-100 if still desired
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) { setErrors(p => ({ ...p, [field]: 'Sai định dạng số' })); return false; }
    setErrors(p => ({ ...p, [field]: '' })); return true;
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

    // Chỉ cần >=1 skill có name hoặc description
    const fullSkills = skills.filter(s => {
      if (!s) return false;
      const hasName = !!(s.name && s.name.trim());
      const hasDesc = !!(s.description && s.description.trim());
      return hasName || hasDesc;
    });
    if (fullSkills.length === 0) {
      newErrors.skills = 'Vui lòng nhập ít nhất một kỹ năng (tên hoặc mô tả)';
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
    // Validate skins (each skin must have both name & image if provided)
    const incompleteSkin = skins.find(s => (s.name.trim() && !s.image) || (!s.name.trim() && s.image));
    if (incompleteSkin) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ tên và ảnh cho mỗi trang phục hoặc xóa dòng chưa hoàn chỉnh' });
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
        if (!skill) return null;
        const hasName = !!(skill.name && skill.name.trim());
        const hasDesc = !!(skill.description && skill.description.trim());
        if (!hasName && !hasDesc) return null;
        let iconUrl = '';
        if (skill.icon instanceof File) {
          iconUrl = await handleUpload(skill.icon);
        } else if (typeof skill.icon === 'string') {
          iconUrl = skill.icon;
        }
        return {
          name: hasName ? skill.name.trim() : '',
          description: hasDesc ? skill.description.trim() : '',
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
  allies: allies.map(id => ({ hero: id })),
  counters: counters.map(id => ({ hero: id })),
  goodAgainst: goodAgainst.map(id => ({ hero: id })),
        lore,
  skins: skins.filter(s => s.name.trim() && s.image),
        combo,
      };

      // Debug: log derived counts to help identify validation issues
      console.log('[DEBUG] Prepared hero payload', {
        name, rolesCount: roles.length, lanesCount: lanes.length, skillsProvided: skills.length, skillsSent: filteredSkills.length,
        alliesCount: allies.length, countersCount: counters.length, goodAgainstCount: goodAgainst.length,
        skinsCount: (skins.filter(s => s.name.trim() && s.image)).length,
        winRate, pickRate, banRate
      });

      // Debug log
      console.log('Sending payload:', payload);
  const isEditing = !!editingHeroData;
  console.log('URL:', isEditing ? `${API_URL}/api/heroes/${editingHeroData._id}` : `${API_URL}/api/heroes`);
  console.log('Method:', isEditing ? 'PUT' : 'POST');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập lại');
      }

  const url = isEditing ? `${API_URL}/api/heroes/${editingHeroData._id}` : `${API_URL}/api/heroes`;
  const method = isEditing ? 'PUT' : 'POST';

    const res = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) {
      openLogin();
          return;
        }
  const error = await res.json().catch(() => ({}));
  console.warn('[SERVER VALIDATION ERROR]', error);
  if (error.duplicate && error.field === 'name') {
    setErrors(prev => ({ ...prev, name: 'Tên tướng đã tồn tại' }));
  }
  const detailMsg = error.details ? error.details.join('; ') : '';
  // Map field specific errors for UI
  if (Array.isArray(error.fields) && Array.isArray(error.details)) {
    const fieldErrors = {};
    error.fields.forEach((f, i) => { fieldErrors[f] = error.details[i] || 'Lỗi'; });
    setErrors(prev => ({ ...prev, ...fieldErrors }));
  }
  // Fallback for express-validator style { errors: [ { param, msg } ] }
  if (Array.isArray(error.errors)) {
    const fieldErrors2 = {};
    error.errors.forEach(e => { if (e.param) fieldErrors2[e.param] = e.msg || 'Lỗi'; });
    if (Object.keys(fieldErrors2).length) setErrors(prev => ({ ...prev, ...fieldErrors2 }));
  }
  throw new Error(detailMsg || error.message || (error.duplicate ? 'Tên tướng đã tồn tại' : 'Có lỗi xảy ra khi thêm/cập nhật tướng'));
      }

  setMessage({ type: 'success', text: isEditing ? 'Cập nhật tướng thành công!' : 'Thêm tướng thành công!' });

  if (!isEditing) {
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
        setLore('');
        setCombo([]);
        setSkins([]);
      }

      if (onFormSubmit) {
        onFormSubmit();
      }
    } catch (err) {
  console.error('Error submitting form:', err);
  setMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra khi thêm/cập nhật tướng' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>
        {editingHeroData ? 'Chỉnh sửa tướng' : 'Thêm tướng mới'}
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
    {skills.map((skill, idx) => {
        const hasName = !!(skill.name && skill.name.trim());
        const hasDesc = !!(skill.description && skill.description.trim());
        const nameError = !!errors.skills && !hasName && hasDesc; // desc filled but name missing
        const descError = !!errors.skills && !hasDesc && hasName; // name filled but desc missing
        return (
          <Box key={idx} display="flex" gap={2} mb={1} alignItems="center">
            <Typography sx={{ minWidth: 80 }}>{skillLabels[idx]}</Typography>
            <TextField
              label="Tên kỹ năng"
              value={skill.name}
              onChange={e => handleSkillChange(idx, 'name', e.target.value)}
              required={false}
              error={nameError}
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
              required={false}
              error={descError}
              fullWidth
            />
          </Box>
        );
      })}
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
      </Box>

      <Box mt={2} mb={2}>
        <Typography variant="h6">Khắc chế bởi</Typography>
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
      </Box>

      <Box mt={2} mb={2}>
        <Typography variant="h6">Đối đầu tốt</Typography>
        <Select
          multiple
          value={goodAgainst}
          onChange={e => setGoodAgainst(e.target.value)}
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
                    onDelete={() => setGoodAgainst(goodAgainst.filter(g => g !== id))}
                  />
                ) : null;
              })}
              {selected.length > 0 && (
                <Chip
                  label="Xóa tất cả"
                  color="error"
                  onClick={() => setGoodAgainst([])}
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
      {[0,1,2,3,4,BASIC_ATTACK_INDEX].map(skillIdx => (
              <Button
                key={skillIdx}
                variant="outlined"
                size="small"
                sx={{ minWidth: 40, p: 0.5, mx: 0.5 }}
                onClick={() => setCombo(combo => combo.map((s, i) => i === idx ? { ...s, skills: [...s.skills, skillIdx] } : s))}
              >
        {skillIdx === BASIC_ATTACK_INDEX ? (
                  <span role="img" aria-label={BASIC_ATTACK_LABEL}>🗡️</span>
                ) : skills[skillIdx]?.iconPreview ? (
                  <img src={skills[skillIdx].iconPreview} alt={skills[skillIdx].name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                ) : skillLabels[skillIdx] || BASIC_ATTACK_LABEL}
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
  {loading ? <CircularProgress size={24} /> : (editingHeroData ? 'Cập nhật tướng' : 'Thêm tướng')}
      </Button>
    </Box>
  );
};

export default AdminHeroForm;