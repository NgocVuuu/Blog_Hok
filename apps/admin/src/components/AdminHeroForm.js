import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../i18nShim';
import { Box, TextField, Button, Typography, MenuItem, Select, InputLabel, FormControl, Chip, OutlinedInput, Grid, CircularProgress, Alert } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UploadIcon from '@mui/icons-material/Upload';
import { getAllHeroesAll } from '../services/heroService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';
const rolesList = ['Marksman', 'Mage', 'Tank', 'Fighter', 'Assassin', 'Support'];
const lanesList = ['Farm Lane', 'Mid Lane', 'Roam', 'Jungle', 'Clash Lane'];
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
  const { t } = useTranslation();
  const { id: routeHeroId } = useParams();
  const { fetchWithAuth, openLogin } = useAuth();
  // Derived id for eslint-safe dependencies
  const editingHeroId = editingHero ? editingHero._id : undefined;
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
  // Skill builds (1..3). Build 1 is canonical for backward-compatible 'skills'.
  const [skillBuilds, setSkillBuilds] = useState([
    { name: 'Bộ 1', skills: defaultSkills.map(s => ({ ...s })) }
  ]);
  const [activeSkillBuild, setActiveSkillBuild] = useState(1); // 1..3
  const [allHeroes, setAllHeroes] = useState([]);
  // Shared filters for hero selection lists
  const [heroRoleFilter, setHeroRoleFilter] = useState('all');
  const [heroSearch, setHeroSearch] = useState('');
  const [allies, setAllies] = useState([]);
  const [counters, setCounters] = useState([]);
  const [goodAgainst, setGoodAgainst] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [lore, setLore] = useState('');
  // Back-compat combo is derived at submit time from comboBuilds[0]
  const [comboBuilds, setComboBuilds] = useState([ { name: 'Bộ 1', steps: [] } ]);
  const [skins, setSkins] = useState([]);
  const [fetchedHero, setFetchedHero] = useState(null);
  // New state for suggested builds
  const [allArcana, setAllArcana] = useState([]);
  const [arcanaCache, setArcanaCache] = useState({}); // id -> arcana object
  const [arcanaBuilds, setArcanaBuilds] = useState([]); // { name, description, items:[{arcanaId,count}], totals }
  // Suggested Equipment state
  const [allEquipment, setAllEquipment] = useState([]);
  // Store all suggestions in a flat array with build index
  const [suggestedEquipment, setSuggestedEquipment] = useState([]); // { equipmentId, equipment?, note, order, build }
  // Remove text search per request; keep value-only state to avoid unused setter
  const [eqSearch] = useState('');
  const [eqCategory, setEqCategory] = useState('all');
  const [activeBuild, setActiveBuild] = useState(1); // 1..3

  // ... (removed unused largeMenuProps and scroll handlers; Autocomplete listboxes handle scrolling)

  const equipmentCategories = useMemo(() => {
    const set = new Set();
    (allEquipment || []).forEach(e => { if (e && e.category) set.add(e.category); });
    return ['all', ...Array.from(set)];
  }, [allEquipment]);

  const filteredEquipmentOptions = useMemo(() => {
    const term = (eqSearch || '').toLowerCase();
    return (allEquipment || []).filter(e => {
      if (!e) return false;
      if (eqCategory !== 'all' && e.category !== eqCategory) return false;
      if (!term) return true;
      return (e.name || '').toLowerCase().includes(term) || (e.description || '').toLowerCase().includes(term);
    });
  }, [allEquipment, eqCategory, eqSearch]);

  // Derived list for current build
  const currentBuildList = useMemo(() => {
    return (suggestedEquipment || [])
      .filter(it => (it.build || 1) === activeBuild)
      .sort((a,b) => (a.order||0) - (b.order||0));
  }, [suggestedEquipment, activeBuild]);
  // Use fetchedHero (full detail) to override initial partial editingHero from list
  const editingHeroData = fetchedHero || editingHero;

  // Flat filtered hero options for Autocomplete
  const filteredHeroOptions = useMemo(() => {
    const term = (heroSearch || '').trim().toLowerCase();
    const list = Array.isArray(allHeroes) ? allHeroes : [];
    return list.filter(h => {
      if (!h) return false;
      if (editingHeroData && editingHeroData._id && h._id === editingHeroData._id) return false;
      if (heroRoleFilter !== 'all' && !(Array.isArray(h.roles) && h.roles.includes(heroRoleFilter))) return false;
      if (term) {
        const nm = (h.name || '').toLowerCase();
        if (!nm.includes(term)) return false;
      }
      return true;
    });
  }, [allHeroes, heroRoleFilter, heroSearch, editingHeroData]);

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
  // Fetch all heroes (paginate client-side to bypass server limit <= 100)
  const data = await getAllHeroesAll({ page: 1, limit: 100, sort: 'name' });
  // Ensure array and sort by name for stable grouping
  const list = Array.isArray(data) ? data.slice().sort((a,b) => (a.name||'').localeCompare(b.name||'')) : [];
  setAllHeroes(list);
      } catch (err) {
        console.error('Error fetching heroes:', err);
        setMessage({ type: 'error', text: 'Không thể tải danh sách tướng' });
        setAllHeroes([]);
      }
    };
    fetchHeroes();
  // Fetch arcana list only
    (async () => {
      try {
        const arcRes = await fetch(`${API_URL}/api/arcana`);
        if (arcRes.ok) {
          const data = await arcRes.json();
          const arcList = data?.success ? data.data : (Array.isArray(data) ? data : []);
          console.log('Loaded arcana:', arcList);
          setAllArcana(arcList);
          // Warm the cache
          const cache = {};
          arcList.forEach(a => { if (a && a._id) cache[a._id] = a; });
          setArcanaCache(prev => ({ ...cache, ...prev }));
        }
      } catch (e) { console.warn('Fetch arcana failed', e); }
    })();
    // Fetch equipment list for suggested equipment editor
    (async () => {
      try {
        const eqRes = await fetch(`${API_URL}/api/equipment`);
        if (eqRes.ok) {
          const list = await eqRes.json();
          setAllEquipment(Array.isArray(list) ? list : []);
        }
      } catch (e) { console.warn('Fetch equipment failed', e); }
    })();
  }, []);

  // Fetch any missing arcana objects by ID for preview
  useEffect(() => {
    const ids = new Set();
    arcanaBuilds.forEach(b => (b.items||[]).forEach(it => {
      const id = typeof it.arcanaId === 'string' && it.arcanaId ? it.arcanaId
        : (typeof it.arcana === 'string' ? it.arcana : (it.arcana && it.arcana._id));
      if (id && !arcanaCache[id] && !allArcana.find(a => a._id === id)) ids.add(id);
    }));
    if (ids.size === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(Array.from(ids).map(async (id) => {
          try {
            const res = await fetch(`${API_URL}/api/arcana/${id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data && data._id ? data : null;
          } catch { return null; }
        }));
        if (cancelled) return;
        const add = {};
        results.filter(Boolean).forEach(a => { add[a._id] = a; });
        if (Object.keys(add).length) setArcanaCache(prev => ({ ...prev, ...add }));
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [arcanaBuilds, allArcana, arcanaCache]);

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
  // Map legacy lane name to new name
  setLanes(Array.isArray(editingHeroData.lanes) ? editingHeroData.lanes.map(l => l === 'Abyssal Lane' ? 'Clash Lane' : l) : []);
      setMetaTier(editingHeroData.metaTier || 'S');
      setWinRate(editingHeroData.winRate != null ? String(editingHeroData.winRate) : '');
      setPickRate(editingHeroData.pickRate != null ? String(editingHeroData.pickRate) : '');
      setBanRate(editingHeroData.banRate != null ? String(editingHeroData.banRate) : '');
      setImageUrl(editingHeroData.image || '');
  // Skills & skill builds
  const mapToFive = (arr) => {
        let list = Array.isArray(arr) ? arr.map(s => ({ ...s, iconPreview: s.icon })) : [];
        while (list.length < 5) list.push({ icon: '', description: '', iconPreview: '', name: '' });
        if (list.length > 5) list = list.slice(0,5);
        return list;
      };
      if (Array.isArray(editingHeroData.skillBuilds) && editingHeroData.skillBuilds.length) {
        const b = editingHeroData.skillBuilds.slice(0,3).map((sb, i) => ({
          name: sb.name || `Bộ ${i+1}`,
          skills: mapToFive(sb.skills)
        }));
  setSkillBuilds(b);
  setActiveSkillBuild(1);
      } else {
        const one = mapToFive(editingHeroData.skills);
        setSkillBuilds([{ name: 'Bộ 1', skills: one }]);
        setActiveSkillBuild(1);
      }
  const alliesArr = Array.isArray(editingHeroData.allies) ? editingHeroData.allies : [];
  setAllies(alliesArr.map(a => (typeof a === 'string' ? a : (a.hero?._id || a.hero || a._id || ''))).filter(Boolean));
  const countersArr = Array.isArray(editingHeroData.counters) ? editingHeroData.counters : [];
  setCounters(countersArr.map(c => (typeof c === 'string' ? c : (c.hero?._id || c.hero || c._id || ''))).filter(Boolean));
  const goodAgainstArr = Array.isArray(editingHeroData.goodAgainst) ? editingHeroData.goodAgainst : [];
  setGoodAgainst(goodAgainstArr.map(g => (typeof g === 'string' ? g : (g.hero?._id || g.hero || g._id || ''))).filter(Boolean));
      setLore(editingHeroData.lore || '');
      // Combo builds
      if (Array.isArray(editingHeroData.comboBuilds) && editingHeroData.comboBuilds.length) {
        setComboBuilds(editingHeroData.comboBuilds.slice(0,3).map((b,i)=>({ name: b.name || `Bộ ${i+1}`, steps: Array.isArray(b.steps)? b.steps.map(s=>({ skills: Array.isArray(s.skills)? s.skills.slice():[], description: s.description||'' })) : [] })));
      } else {
        setComboBuilds([{ name: 'Bộ 1', steps: Array.isArray(editingHeroData.combo) ? editingHeroData.combo.map(s=>({ skills: Array.isArray(s.skills)? s.skills.slice():[], description: s.description||'' })) : [] }]);
      }
  // legacy combo not kept in state; we derive from comboBuilds[0] when submitting
      setSkins(Array.isArray(editingHeroData.skins) ? editingHeroData.skins : []);
  // Removed suggestedArcana and suggestedEquipment population
  // Populate suggested equipment if available (flattened by API)
      if (Array.isArray(editingHeroData.suggestedEquipment)) {
        const se = editingHeroData.suggestedEquipment
          .filter(it => it && (it._id || it.equipment))
          .map(it => ({
            equipmentId: typeof it === 'string' ? it : (it._id || it.equipment?._id || it.equipment || ''),
            equipment: typeof it === 'object' ? it : undefined,
            note: (it.note || ''),
    order: typeof it.order === 'number' ? it.order : 0,
    build: typeof it.build === 'number' ? it.build : 1,
          }));
        setSuggestedEquipment(se);
      } else {
        setSuggestedEquipment([]);
      }
      if (Array.isArray(editingHeroData.arcanaBuilds)) {
        console.log('[DEBUG] loaded arcanaBuilds:', editingHeroData.arcanaBuilds);
        // Normalize to keep id (string) and optional object for preview
        setArcanaBuilds(editingHeroData.arcanaBuilds.map(b => ({
          name: b.name,
          description: b.description || '',
          items: (b.items||[]).map(it => {
            // Case 1: API returned flattened item: { _id, name, image, color, tier, count }
            if (it && typeof it === 'object' && typeof it._id === 'string' && (it.name || it.image || it.color)) {
              return {
                arcanaId: it._id,
                arcana: { _id: it._id, name: it.name, image: it.image, color: it.color, tier: it.tier },
                color: it.color || '',
                count: it.count || 1
              };
            }
            // Case 2: Legacy/nested: { arcana: ObjectId | {..}, count }
            const obj = (it && it.arcana && typeof it.arcana === 'object') ? it.arcana : undefined;
            const id = obj?._id || (typeof it.arcana === 'string' ? it.arcana : (typeof it.arcanaId === 'string' ? it.arcanaId : ''));
            return {
              arcanaId: id || '',
              arcana: obj,
              color: it.color || obj?.color || '',
              count: it.count || 1
            };
          })
        })));
      }
    }
  }, [editingHeroData]);

  // Keep comboBuilds length and names in sync with skillBuilds
  useEffect(() => {
    setComboBuilds(prev => {
      let out = prev.slice(0, skillBuilds.length);
      while (out.length < skillBuilds.length) {
        const idx = out.length;
        out.push({ name: skillBuilds[idx]?.name || `Bộ ${idx+1}`, steps: [] });
      }
      // Sync names with skill builds
      out = out.map((b, i) => ({ ...b, name: (skillBuilds[i]?.name || b.name) }));
      return out;
    });
  }, [skillBuilds]);

  // Always fetch full hero details when editing to ensure suggestedArcana / equipment / arcanaBuilds populated
  useEffect(() => {
    if (!editingHeroId) return; // not editing
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/heroes/${editingHeroId}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setFetchedHero(data);
        }
      } catch (err) {
        console.error('Failed to fetch full hero details', err);
      }
    })();
    return () => { ignore = true; };
  }, [editingHeroId]);

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
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSkillBuilds(list => {
        const copy = list.map(b => ({ ...b, skills: b.skills.map(s => ({ ...s })) }));
        const bIdx = Math.max(0, Math.min(copy.length - 1, activeSkillBuild - 1));
        if (!copy[bIdx]) return list;
        copy[bIdx].skills[idx] = { ...copy[bIdx].skills[idx], icon: file, iconPreview: reader.result };
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Vui lòng đăng nhập lại');

    // Helper to sleep
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    // Try cloud upload with up to 2 retries on 429 using exponential backoff
    let attempt = 0;
    let lastErr;
    while (attempt < 3) {
      const res = await fetchWithAuth(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {},
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        return data.imageUrl;
      }
      if (res.status === 401) { openLogin(); return; }
      const body = await res.json().catch(() => ({}));
      if (res.status === 429) {
        // Respect Retry-After if provided, else 1s * 2^attempt
        const retryAfterSec = Number(body?.retryAfter) || Number(res.headers.get('retry-after')) || 0;
        const backoff = retryAfterSec > 0 ? retryAfterSec * 1000 : (1000 * Math.pow(2, attempt));
        attempt += 1;
        if (attempt >= 3) { lastErr = body; break; }
        await wait(backoff);
        continue;
      }
      // On provider failure, fallback to local
      if (
        res.status === 503 ||
        /Cloudinary/i.test(body?.error || body?.message || '') ||
        body?.code === 'CLOUDINARY_ERROR'
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
      lastErr = body;
      break;
    }
    throw new Error(lastErr?.error || lastErr?.message || 'Upload ảnh thất bại. Vui lòng thử lại.');
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

  // Chỉ cần >=1 skill (ở Bộ 1) có name hoặc description
  const primarySkills = (skillBuilds[0]?.skills || []).map(s => s || {});
  const fullSkills = primarySkills.filter(s => {
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
    setSkillBuilds(list => {
      const copy = list.map(b => ({ ...b, skills: b.skills.map(s => ({ ...s })) }));
      const bIdx = Math.max(0, Math.min(copy.length - 1, activeSkillBuild - 1));
      if (!copy[bIdx]) return list;
      if (!copy[bIdx].skills[idx]) copy[bIdx].skills[idx] = { name: '', icon: '', description: '', iconPreview: '' };
      copy[bIdx].skills[idx] = { ...copy[bIdx].skills[idx], [field]: value };
      return copy;
    });
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

  // Use Bộ 1 as canonical 'skills' for backward compatibility
  const baseSkills = (skillBuilds[0]?.skills || []).map(s => s || {});
  const processedSkills = await Promise.all(baseSkills.map(async (skill) => {
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

      // Process all skill builds (optional)
      const processedSkillBuilds = await Promise.all(
        (skillBuilds || []).map(async (build) => {
          const items = await Promise.all((build.skills || []).map(async (skill) => {
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
          return { name: build.name || '', skills: items.filter(Boolean) };
        })
      );

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
  skillBuilds: processedSkillBuilds,
        allies: allies.map(id => ({ hero: id })),
        counters: counters.map(id => ({ hero: id })),
        goodAgainst: goodAgainst.map(id => ({ hero: id })),
        lore,
        skins: skins.filter(s => s.name.trim() && s.image),
  // Back-compat top-level combo uses Bộ 1
  combo: (comboBuilds[0]?.steps || []).map(s => ({ skills: s.skills, description: s.description })),
  comboBuilds: (comboBuilds || []).map(b => ({ name: b.name || '', steps: (b.steps||[]).map(s => ({ skills: s.skills, description: s.description })) })),
        suggestedEquipment: suggestedEquipment
          .filter(it => it && (it.equipmentId || (it.equipment && it.equipment._id)))
          .map(it => ({ equipment: it.equipmentId || it.equipment._id, note: it.note || '', order: typeof it.order === 'number' ? it.order : 0, build: typeof it.build === 'number' ? it.build : 1 })),
        arcanaBuilds: arcanaBuilds.map(build => ({
          name: build.name,
          description: build.description,
          items: build.items && Array.isArray(build.items)
            ? build.items
                .filter(it => (typeof it.arcanaId === 'string' && it.arcanaId) || (it.arcana && it.arcana._id))
                .map(it => ({ arcana: (typeof it.arcanaId === 'string' && it.arcanaId) ? it.arcanaId : it.arcana._id, count: it.count }))
            : [],
        })),
      };
      console.log('[DEBUG] arcanaBuilds payload:', payload.arcanaBuilds);

      // Debug: log derived counts to help identify validation issues
      console.log('[DEBUG] Prepared hero payload', {
        name, rolesCount: roles.length, lanesCount: lanes.length, skillsProvided: (skillBuilds[0]?.skills || []).length, skillsSent: filteredSkills.length,
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
  setSkillBuilds([{ name: 'Bộ 1', skills: defaultSkills.map(s => ({ ...s })) }]);
  setActiveSkillBuild(1);
        setAllies([]);
        setCounters([]);
        setLore('');
  // no combo state to reset
  setComboBuilds([ { name: 'Bộ 1', steps: [] } ]);
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
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="subtitle1">Kỹ năng</Typography>
          <Box sx={{ ml: 'auto' }}>
            {[1,2,3].map(b => (
              <Button key={b} size="small" variant={activeSkillBuild===b?'contained':'outlined'} onClick={()=> setActiveSkillBuild(b)} sx={{ mr: 1 }}>
                Bộ {b}
              </Button>
            ))}
            <Button size="small" variant="outlined" onClick={()=> {
              setSkillBuilds(list => {
                if (list.length >= 3) return list;
                const next = [...list, { name: `Bộ ${list.length+1}`, skills: defaultSkills.map(s => ({ ...s })) }];
                // comboBuilds will be synced by effect, but push immediately for responsiveness
                setComboBuilds(cb => [...cb, { name: `Bộ ${next.length}`, steps: [] }]);
                return next;
              });
            }}>Thêm bộ</Button>
            {skillBuilds.length > 1 && (
              <Button size="small" color="error" onClick={()=> {
                setSkillBuilds(list => {
                  if (list.length <= 1) return list;
                  const newList = list.slice(0, -1);
                  if (activeSkillBuild > newList.length) setActiveSkillBuild(newList.length);
                  // Keep combo builds aligned
                  setComboBuilds(cb => cb.slice(0, newList.length));
                  return newList;
                });
              }} sx={{ ml: 1 }}>Xóa bộ cuối</Button>
            )}
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <TextField size="small" label={`Tên bộ ${activeSkillBuild}`} value={skillBuilds[Math.max(0, Math.min(skillBuilds.length - 1, activeSkillBuild - 1))]?.name || ''}
            onChange={e => {
              const value = e.target.value;
              setSkillBuilds(list => list.map((b,i) => (i === (activeSkillBuild-1) ? { ...b, name: value } : b)));
              setComboBuilds(list => list.map((b,i) => (i === (activeSkillBuild-1) ? { ...b, name: value } : b)));
            }}
            sx={{ maxWidth: 300 }}
          />
        </Box>
    {(skillBuilds[Math.max(0, Math.min(skillBuilds.length - 1, activeSkillBuild - 1))]?.skills || []).map((skill, idx) => {
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
              <input type="file" hidden accept="image/*,.avif" onChange={e => handleSkillIconChange(idx, e.target.files[0])} />
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

      {/* Shared role filter for all hero selection lists below */}
      <Box mt={2} mb={1} display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo vai trò</InputLabel>
          <Select
            label="Lọc theo vai trò"
            value={heroRoleFilter}
            onChange={e => setHeroRoleFilter(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            {rolesList.map(role => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Tìm tướng"
          value={heroSearch}
          onChange={e => setHeroSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
      </Box>

      <Box mt={1} mb={2}>
        <Typography variant="h6">Đồng minh</Typography>
        <Autocomplete
          multiple
          options={filteredHeroOptions}
          disableCloseOnSelect
          value={(Array.isArray(allies) ? allies : []).map(id => (allHeroes || []).find(h => h && h._id === id)).filter(Boolean)}
          getOptionLabel={(option) => option?.name || ''}
          isOptionEqualToValue={(opt, val) => opt._id === val._id}
          onChange={(e, newValue) => setAllies(newValue.map(h => h._id))}
          renderInput={(params) => <TextField {...params} placeholder="Chọn đồng minh" />}
          renderOption={(props, option) => (
            <li {...props} key={option._id}>
              <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                {option.image && <img src={option.image} alt="" width={28} height={28} style={{ borderRadius: '50%' }} />}
                <Typography variant="body2">{option.name}</Typography>
              </Box>
            </li>
          )}
          ListboxProps={{
            style: { maxHeight: 420, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }
          }}
          fullWidth
        />
      </Box>

      <Box mt={2} mb={2}>
        <Typography variant="h6">Khắc chế bởi</Typography>
        <Autocomplete
          multiple
          options={filteredHeroOptions}
          disableCloseOnSelect
          value={(Array.isArray(counters) ? counters : []).map(id => (allHeroes || []).find(h => h && h._id === id)).filter(Boolean)}
          getOptionLabel={(option) => option?.name || ''}
          isOptionEqualToValue={(opt, val) => opt._id === val._id}
          onChange={(e, newValue) => setCounters(newValue.map(h => h._id))}
          renderInput={(params) => <TextField {...params} placeholder="Chọn tướng khắc chế" />}
          renderOption={(props, option) => (
            <li {...props} key={option._id}>
              <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                {option.image && <img src={option.image} alt="" width={28} height={28} style={{ borderRadius: '50%' }} />}
                <Typography variant="body2">{option.name}</Typography>
              </Box>
            </li>
          )}
          ListboxProps={{
            style: { maxHeight: 420, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }
          }}
          fullWidth
        />
        {counters.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Chip label="Xóa tất cả" color="error" onClick={() => setCounters([])} />
          </Box>
        )}
      </Box>

      <Box mt={2} mb={2}>
        <Typography variant="h6">Đối đầu tốt</Typography>
        <Autocomplete
          multiple
          options={filteredHeroOptions}
          disableCloseOnSelect
          value={(Array.isArray(goodAgainst) ? goodAgainst : []).map(id => (allHeroes || []).find(h => h && h._id === id)).filter(Boolean)}
          getOptionLabel={(option) => option?.name || ''}
          isOptionEqualToValue={(opt, val) => opt._id === val._id}
          onChange={(e, newValue) => setGoodAgainst(newValue.map(h => h._id))}
          renderInput={(params) => <TextField {...params} placeholder="Chọn tướng đối đầu tốt" />}
          renderOption={(props, option) => (
            <li {...props} key={option._id}>
              <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                {option.image && <img src={option.image} alt="" width={28} height={28} style={{ borderRadius: '50%' }} />}
                <Typography variant="body2">{option.name}</Typography>
              </Box>
            </li>
          )}
          ListboxProps={{
            style: { maxHeight: 420, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }
          }}
          fullWidth
        />
        {goodAgainst.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Chip label="Xóa tất cả" color="error" onClick={() => setGoodAgainst([])} />
          </Box>
        )}
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
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="subtitle1">Combo Kill</Typography>
          <Box sx={{ ml: 'auto' }}>
            {[1,2,3].map(b => (
              <Button key={b} size="small" variant={activeSkillBuild===b?'contained':'outlined'} onClick={()=> setActiveSkillBuild(b)} sx={{ mr: 1 }}>
                Bộ {b}
              </Button>
            ))}
          </Box>
        </Box>
        {(comboBuilds[Math.max(0, Math.min(comboBuilds.length - 1, activeSkillBuild - 1))]?.steps || []).map((step, idx) => (
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
                    ) : (skillBuilds[Math.max(0, Math.min(skillBuilds.length - 1, activeSkillBuild - 1))]?.skills?.[skillIdx]?.iconPreview) ? (
                      <img src={skillBuilds[Math.max(0, Math.min(skillBuilds.length - 1, activeSkillBuild - 1))].skills[skillIdx].iconPreview} alt={skillBuilds[Math.max(0, Math.min(skillBuilds.length - 1, activeSkillBuild - 1))].skills[skillIdx].name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    ) : skillLabels[skillIdx]}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    sx={{ position: 'absolute', top: -8, right: -8, minWidth: 20, p: 0, fontSize: 12 }}
                    onClick={() => setComboBuilds(list => list.map((b,i)=> i===(activeSkillBuild-1) ? { ...b, steps: b.steps.map((s, j) => j === idx ? { ...s, skills: s.skills.filter((_, k) => k !== sidx) } : s) } : b))}
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
                onClick={() => setComboBuilds(list => list.map((b,i)=> i===(activeSkillBuild-1) ? { ...b, steps: b.steps.map((s, j) => j === idx ? { ...s, skills: [...s.skills, skillIdx] } : s) } : b))}
              >
  {skillIdx === BASIC_ATTACK_INDEX ? (
                  <span role="img" aria-label={BASIC_ATTACK_LABEL}>🗡️</span>
  ) : (skillBuilds[Math.max(0, Math.min(skillBuilds.length - 1, activeSkillBuild - 1))]?.skills?.[skillIdx]?.iconPreview) ? (
          <img src={skillBuilds[Math.max(0, Math.min(skillBuilds.length - 1, activeSkillBuild - 1))].skills[skillIdx].iconPreview} alt={skillBuilds[Math.max(0, Math.min(skillBuilds.length - 1, activeSkillBuild - 1))].skills[skillIdx].name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                ) : skillLabels[skillIdx] || BASIC_ATTACK_LABEL}
              </Button>
            ))}
            <TextField
              label="Mô tả bước"
              value={step.description}
              onChange={e => setComboBuilds(list => list.map((b,i)=> i===(activeSkillBuild-1) ? { ...b, steps: b.steps.map((s, j) => j === idx ? { ...s, description: e.target.value } : s) } : b))}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <Button color="error" onClick={() => setComboBuilds(list => list.map((b,i)=> i===(activeSkillBuild-1) ? { ...b, steps: b.steps.filter((_, j) => j !== idx) } : b))}>Xóa</Button>
          </Box>
        ))}
        <Button variant="outlined" onClick={() => setComboBuilds(list => list.map((b,i)=> i===(activeSkillBuild-1) ? { ...b, steps: [...b.steps, { skills: [], description: '' }] } : b))}>Thêm bước combo</Button>
      </Box>

      <Box mt={2} mb={2}>
  <Typography variant="h6">{t('hero.suggestedEquipment', 'Suggested Equipment')}</Typography>
        {/* Category only (text search removed) */}
        <Box display="flex" gap={2} flexWrap="wrap" mb={1}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="eq-cat-label">Loại</InputLabel>
            <Select
              labelId="eq-cat-label"
              label="Loại"
              value={eqCategory}
              onChange={e => setEqCategory(e.target.value)}
            >
              {equipmentCategories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat === 'all' ? 'Tất cả' : cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {/* Quick-pick gallery by filtered list */}
        <Box mb={2}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Chọn nhanh theo loại</Typography>
          {filteredEquipmentOptions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Không có trang bị nào phù hợp</Typography>
          ) : (
            <Grid container spacing={1}>
              {filteredEquipmentOptions.map(eq => {
                const selectedInCurrentBuild = (suggestedEquipment || []).some(it => (it.build || 1) === activeBuild && (it.equipmentId === eq._id));
                return (
                  <Grid item key={eq._id} xs={6} sm={4} md={3} lg={2}>
                    <Box
                      onClick={() => {
                        setSuggestedEquipment(list => {
                          const exists = list.some(x => (x.build || 1) === activeBuild && x.equipmentId === eq._id);
                          if (exists) {
                            // remove from current build
                            return list.filter(x => !((x.build || 1) === activeBuild && x.equipmentId === eq._id));
                          }
                          const nextOrder = Math.max(-1, ...list.filter(x => (x.build || 1) === activeBuild).map(x => (typeof x.order === 'number' ? x.order : 0))) + 1;
                          return [...list, { equipmentId: eq._id, equipment: eq, note: '', order: nextOrder, build: activeBuild }];
                        });
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        border: '1px solid',
                        borderColor: selectedInCurrentBuild ? 'success.main' : 'divider',
                        borderRadius: 1,
                        p: 1,
                        cursor: 'pointer',
                        opacity: 1,
                        transition: 'background-color 0.2s ease',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                      title={selectedInCurrentBuild ? 'Bỏ chọn khỏi build hiện tại' : 'Thêm vào build hiện tại'}
                   >
                      <Box sx={{ width: 36, height: 36, borderRadius: 1, overflow: 'hidden', flexShrink: 0, border: '1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {eq.image ? (
                          <img src={eq.image} alt={eq.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.100' }} />
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap title={eq.name} sx={{ fontWeight: 600 }}>{eq.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{eq.category}</Typography>
                      </Box>
                      <Box sx={{ ml: 'auto', display:'flex', alignItems:'center', gap:1 }}>
                        {selectedInCurrentBuild ? (
                          <Chip label="Bỏ" color="error" size="small" />
                        ) : (
                          <Chip label="Thêm" color="primary" size="small" />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
        {/* Build selector */}
        <Box display="flex" gap={1} mb={1}>
          {[1,2,3].map(b => (
            <Button key={b} variant={activeBuild===b?'contained':'outlined'} size="small" onClick={()=> setActiveBuild(b)}>
              {t('hero.equipmentSet', { number: b, defaultValue: `Build ${b}` })}
            </Button>
          ))}
        </Box>
        {/* Current build items */}
        {currentBuildList.map((it, idx) => {
          const selected = it.equipment || allEquipment.find(e => e._id === it.equipmentId);
          // Find the absolute index in the flat array for mutation mapping
          const absIndex = suggestedEquipment.findIndex(x => x === it);
          return (
            <Box key={absIndex} display="flex" alignItems="center" gap={2} mb={1}>
              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel id={`eq-label-${absIndex}`}>Chọn trang bị</InputLabel>
                <Select
                  labelId={`eq-label-${absIndex}`}
                  label="Chọn trang bị"
                  value={it.equipmentId || ''}
                  onChange={e => setSuggestedEquipment(list => list.map((x,i) => i===absIndex ? ({ ...x, equipmentId: e.target.value, equipment: allEquipment.find(eq => eq._id === e.target.value) }) : x))}
                >
                  <MenuItem value=""><em>-- Chọn --</em></MenuItem>
                  {filteredEquipmentOptions.map(eq => (
                    <MenuItem key={eq._id} value={eq._id}>{eq.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Note removed per request */}
              <TextField
                size="small"
                type="number"
                label="Thứ tự"
                value={it.order ?? 0}
                onChange={e => setSuggestedEquipment(list => list.map((x,i)=> i===absIndex ? ({ ...x, order: parseInt(e.target.value)||0 }) : x))}
                sx={{ width: 110 }}
              />
              {selected && selected.image && (
                <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                  <img src={selected.image} alt={selected.name} style={{ width:40, height:40, objectFit:'cover', borderRadius:6 }} />
                  <Typography variant="body2" sx={{ fontWeight:600 }}>{selected.name}</Typography>
                </Box>
              )}
              <Button color="error" size="small" onClick={() => setSuggestedEquipment(list => list.filter((_,i)=> i!==absIndex))}>Xóa</Button>
              {/* Remove-from-build button removed per request */}
            </Box>
          );
        })}
        <Button variant="outlined" size="small" onClick={() => setSuggestedEquipment(list => [...list, { equipmentId:'', note:'', order: currentBuildList.length, build: activeBuild }] )}>Thêm trang bị</Button>
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

  {/* Gợi ý Arcana và Gợi ý Trang Bị sections removed as requested */}

      <Box mt={4} mb={2}>
        <Typography variant="h6">Bảng Arcana</Typography>
        {arcanaBuilds.map((build, bIdx) => (
          <Box key={bIdx} sx={{ border: '1px solid #ddd', borderRadius: 2, p:2, mb:2 }}>
            <Box display="flex" gap={2} flexWrap="wrap" mb={1}>
              <TextField label="Tên bảng" size="small" value={build.name} onChange={e => setArcanaBuilds(list => list.map((b,i)=> i===bIdx?{...b,name:e.target.value}:b))} sx={{ minWidth:200 }} />
              <TextField label="Mô tả" size="small" value={build.description} onChange={e => setArcanaBuilds(list => list.map((b,i)=> i===bIdx?{...b,description:e.target.value}:b))} fullWidth multiline minRows={2} />
              <Button color="error" size="small" onClick={() => setArcanaBuilds(list => list.filter((_,i)=> i!==bIdx))}>Xóa bảng</Button>
            </Box>
            {build.items.map((it, iIdx) => {
              // Resolve arcana object for preview (prefer inline arcana, then list)
              const selectedId = (typeof it.arcanaId === 'string' ? it.arcanaId : (typeof it.arcana === 'string' ? it.arcana : (it.arcana?._id || '')));
              let arcanaObj = (it.arcana && typeof it.arcana === 'object') ? it.arcana : undefined;
              if (!arcanaObj && selectedId) {
                arcanaObj = arcanaCache[selectedId] || allArcana.find(a => a._id === selectedId);
              }
              return (
                <Box key={iIdx} display="flex" gap={2} alignItems="center" mb={1}>
                  <FormControl size="small" sx={{ minWidth:120 }}>
                    <Select value={it.color || (arcanaObj && arcanaObj.color) || ''} onChange={e => setArcanaBuilds(list => list.map((b,i)=> i===bIdx ? { ...b, items: b.items.map((x,j)=> j===iIdx ? { ...x, color:e.target.value, arcanaId:'', arcana: undefined } : x) } : b))} displayEmpty>
                      <MenuItem value=""><em>Chọn màu</em></MenuItem>
                      <MenuItem value="red">Đỏ</MenuItem>
                      <MenuItem value="green">Lục</MenuItem>
                      <MenuItem value="blue">Xanh</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth:160 }}>
                    <Select
                      value={selectedId}
                      onChange={e => setArcanaBuilds(list => list.map((b,i)=> {
                        if (i !== bIdx) return b;
                        const id = e.target.value;
                        const obj = allArcana.find(a => a._id === id);
                        return {
                          ...b,
                          items: b.items.map((x,j)=> j===iIdx ? { ...x, arcanaId:id, arcana: obj, color: obj?.color || x.color } : x)
                        };
                      }))}
                      displayEmpty
                      disabled={!it.color && !(arcanaObj && arcanaObj.color)}
                    >
                      <MenuItem value=""><em>Chọn Arcana</em></MenuItem>
                      {allArcana.filter(a => a.color === (it.color || (arcanaObj && arcanaObj.color))).map(a => (
                        <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField type="number" size="small" label="Số lượng" inputProps={{ min:1, max:10 }} value={it.count} onChange={e => setArcanaBuilds(list => list.map((b,i)=> i===bIdx ? { ...b, items: b.items.map((x,j)=> j===iIdx ? { ...x, count:parseInt(e.target.value)||1 } : x) } : b))} sx={{ width:100 }} />
                  {/* Hiển thị ảnh, tên, màu arcana nếu có */}
                  {arcanaObj && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width:40, height:40, border:'1px solid #ddd', borderRadius:1, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <img src={arcanaObj.image} alt={arcanaObj.name} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'cover' }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight:600 }}>{arcanaObj.name}</Typography>
                      <Chip label={arcanaObj.color} size="small" sx={{ bgcolor: arcanaObj.color === 'red' ? '#ffcccc' : arcanaObj.color === 'green' ? '#ccffcc' : '#cce5ff', color: '#333' }} />
                    </Box>
                  )}
                  <Button size="small" color="error" onClick={() => setArcanaBuilds(list => list.map((b,i)=> i===bIdx ? { ...b, items: b.items.filter((_,j)=> j!==iIdx) } : b))}>X</Button>
                </Box>
              );
            })}
            <Button size="small" variant="outlined" onClick={()=> setArcanaBuilds(list => list.map((b,i)=> i===bIdx?{...b, items:[...b.items,{ arcanaId:'', count:1 }]}:b))}>Thêm Arcana</Button>
          </Box>
        ))}
        <Button variant="contained" size="small" onClick={() => setArcanaBuilds(list => [...list, { name:'', description:'', items:[] }])}>Thêm bảng Arcana</Button>
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