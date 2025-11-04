import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Box, Typography } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { GiBroadsword } from 'react-icons/gi';
import { useTranslation } from '../i18nShim';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';

const EquipmentList = ({ onEdit }) => {
  const [equipment, setEquipment] = useState([]);
  const [category, setCategory] = useState('all');
  const { t } = useTranslation();

  useEffect(() => {
    fetch(`${API_URL}/api/equipment`)
      .then(res => res.json())
      .then(response => {
        // Handle new API response format
        const equipmentData = response.success ? response.data : (Array.isArray(response) ? response : []);
        setEquipment(equipmentData);
      })
      .catch(error => {
        console.error('Error fetching equipment:', error);
        setEquipment([]);
      });
  }, []);

  // Derive quick stats like the public page
  const deriveQuickStats = (item) => {
    if (Array.isArray(item?.quickStats) && item.quickStats.length) {
      return item.quickStats
        .filter(q => q && (q.value || q.description || q.type))
        .slice(0, 5)
  .map(q => ({ label: q.label || q.type || '', value: q.value || '', type: q.type || '' }));
    }
    if (item?.stats && typeof item.stats === 'object') {
      return Object.entries(item.stats)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .slice(0, 5)
  .map(([k, v]) => ({ label: k, value: `+${v}`, type: k }));
    }
    if (item?.attributes && typeof item.attributes === 'object') {
      return Object.entries(item.attributes)
        .filter(([, v]) => typeof v === 'number' && v !== 0)
        .slice(0, 5)
  .map(([k, v]) => ({ label: k, value: `+${v}`, type: k }));
    }
    return [];
  };

  // Normalize labels to avoid prefixes like "passive:"
  const normalizeQuickStatLabel = (raw) => {
    if (!raw) return '';
    let s = String(raw).trim();
    s = s.replace(/^passive\s*:\s*/i, '').replace(/^active\s*:\s*/i, '');
    const parts = s.split(/[-–:]/).map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) s = parts[parts.length - 1];
    return s.replace(/\s+/g, ' ');
  };

  // Map a stat type/label to an icon and color
  const getQuickStatVisual = (type, rawLabel) => {
    const label = normalizeQuickStatLabel(rawLabel).toLowerCase();
    const tNorm = String(type || '').trim().toLowerCase().replace(/\s+/g, '');
    const has = (s) => label.includes(s);
    // Prefer explicit type mapping
    switch (tNorm) {
      case 'healthper5s':
      case 'health/5s':
      case 'hp/5s':
        return { Icon: FavoriteIcon, color: '#43a047', react: false, type: 'healthPer5s', overlayPlus: true };
      case 'maxhealth':
        return { Icon: LocalFireDepartmentIcon, color: '#43a047', react: false, type: 'maxHealth' };
      case 'movementspeed':
        return { Icon: DirectionsRunIcon, color: '#43a047', react: false, type: 'movementSpeed' };
      case 'attackspeed':
        return { Icon: GiBroadsword, color: '#43a047', react: true, type: 'attackSpeed' };
      case 'cooldownreduction':
        return { Icon: AccessTimeIcon, color: '#43a047', react: false, type: 'cooldownReduction' };
      case 'physicallifesteal':
      case 'lifesteal':
        return { Icon: LocalFireDepartmentIcon, color: '#ff7a00', react: false, type: 'physicalLifeSteal' };
      case 'magicarmor':
      case 'magicresist':
        return { Icon: ShieldIcon, color: '#7b2ff2', react: false, type: 'magicArmor' };
      case 'physicalarmor':
      case 'armor':
        return { Icon: ShieldIcon, color: '#ff7a00', react: false, type: 'physicalArmor' };
      case 'magicattack':
        return { Icon: GiBroadsword, color: '#7b2ff2', react: true, type: 'magicAttack' };
      case 'physicalattack':
      case 'attack':
        return { Icon: GiBroadsword, color: '#ff7a00', react: true, type: 'physicalAttack' };
      case 'criticalrate':
      case 'crit':
        return { Icon: GpsFixedIcon, color: '#C9A063', react: false, type: 'criticalRate' };
      case 'manaregen':
      case 'mana':
        return { Icon: LocalFireDepartmentIcon, color: '#7b2ff2', react: false, type: 'manaRegen' };
      default:
        break;
    }
    // Fallback by label heuristics
  if (has('health/5s') || has('hp/5s') || has('hp5') || has('health per 5') || has('health regen') || has('regeneration') || has('hồi máu/5s')) {
  return { Icon: FavoriteIcon, color: '#43a047', react: false, type: 'healthPer5s', overlayPlus: true };
    }
    if (has('max health') || label === 'maxhealth') {
      return { Icon: LocalFireDepartmentIcon, color: '#43a047', react: false, type: 'maxHealth' };
    }
    if (has('movement speed') || label === 'movementspeed' || has('tốc chạy')) {
      return { Icon: DirectionsRunIcon, color: '#43a047', react: false, type: 'movementSpeed' };
    }
    if (has('attack speed') || label === 'attackspeed' || has('tốc đánh')) {
      return { Icon: GiBroadsword, color: '#43a047', react: true, type: 'attackSpeed' };
    }
    if (has('cooldown') || has('giảm hồi chiêu')) {
      return { Icon: AccessTimeIcon, color: '#43a047', react: false, type: 'cooldownReduction' };
    }
    if (has('hút máu vật lý') || (label.includes('life') && label.includes('steal') && label.includes('physical'))) {
      return { Icon: LocalFireDepartmentIcon, color: '#ff7a00', react: false, type: 'physicalLifeSteal' };
    }
    if (has('life steal') || has('lifesteal') || has('hút máu') || has('hồi máu')) {
      return { Icon: LocalFireDepartmentIcon, color: '#ff7a00', react: false, type: 'physicalLifeSteal' };
    }
    if (has('magic armor') || has('magic resist') || has('kháng phép')) {
      return { Icon: ShieldIcon, color: '#7b2ff2', react: false, type: 'magicArmor' };
    }
    if (has('physical armor') || (has('armor') && !has('magic')) || has('giáp vật lý')) {
      return { Icon: ShieldIcon, color: '#ff7a00', react: false, type: 'physicalArmor' };
    }
    if ((has('magic attack') || (has('phép') && !has('kháng'))) && !has('resist')) {
      return { Icon: GiBroadsword, color: '#7b2ff2', react: true, type: 'magicAttack' };
    }
    if (has('physical attack') || (has('attack') && !has('magic')) || has('vật lý')) {
      return { Icon: GiBroadsword, color: '#ff7a00', react: true, type: 'physicalAttack' };
    }
    if (has('critical rate') || has('tỉ lệ chí mạng') || has('ti le chi mang') || has('crit rate')) {
      return { Icon: GpsFixedIcon, color: '#C9A063', react: false, type: 'criticalRate' };
    }
    if (has('mana') || has('hồi mana')) {
      return { Icon: LocalFireDepartmentIcon, color: '#7b2ff2', react: false, type: 'manaRegen' };
    }
    return { Icon: GiBroadsword, color: '#C9A063', react: true, type: 'unknown' };
  };

  const getDisplayLabel = (type, rawFallback) => {
    switch (type) {
      case 'magicArmor':
        return t('equipment.stats.magicArmor', { lng: 'en', defaultValue: 'Magical Defense' });
      case 'physicalArmor':
        return t('equipment.stats.physicalArmor', { lng: 'en', defaultValue: 'Physical Defense' });
      case 'lifeSteal':
        return t('equipment.stats.lifeSteal', { lng: 'en', defaultValue: 'Physical Life Steal' });
      case 'physicalLifeSteal':
        return t('equipment.stats.physicalLifeSteal', { lng: 'en', defaultValue: 'Physical Life Steal' });
      case 'criticalRate':
        return t('equipment.stats.criticalRate', { lng: 'en', defaultValue: 'Critical Rate' });
      case 'movementSpeed':
        return t('equipment.stats.movementSpeed', { lng: 'en', defaultValue: 'Movement Speed' });
      case 'attackSpeed':
        return t('equipment.stats.attackSpeed', { lng: 'en', defaultValue: 'Attack Speed' });
      case 'cooldownReduction':
        return t('equipment.stats.cooldownReduction', { lng: 'en', defaultValue: 'Cooldown Reduction' });
      case 'magicAttack':
        return t('equipment.stats.magicAttack', { lng: 'en', defaultValue: 'Magic Attack' });
      case 'physicalAttack':
        return t('equipment.stats.physicalAttack', { lng: 'en', defaultValue: 'Physical Attack' });
      case 'manaRegen':
        return t('equipment.stats.manaRegen', { lng: 'en', defaultValue: 'Mana Regen' });
      case 'maxHealth':
        return t('equipment.stats.maxHealth', { lng: 'en', defaultValue: 'Max Health' });
      case 'healthPer5s':
        return t('equipment.stats.healthPer5s', { lng: 'en', defaultValue: 'Health/5s' });
      default:
        return normalizeQuickStatLabel(rawFallback || '');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa trang bị này?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/equipment/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setEquipment(equipment.filter(item => item._id !== id));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" mb={2}>Danh sách trang bị</Typography>
      {/* Category filter */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="cat-label">Lọc theo loại</InputLabel>
          <Select
            labelId="cat-label"
            label="Lọc theo loại"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            {Array.from(new Set(equipment.map(it => it.category).filter(Boolean))).map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tên trang bị</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Ảnh</TableCell>
            <TableCell>Thông số nhanh</TableCell>
            <TableCell>Sửa</TableCell>
            <TableCell>Xóa</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(category === 'all' ? equipment : equipment.filter(it => it.category === category)).map(item => (
            <TableRow key={item._id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell><img src={item.image} alt="" width={40} /></TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {deriveQuickStats(item).map((s, i) => {
                    const v = getQuickStatVisual(s.type, s.label);
                    const IconComp = v.Icon;
                    return (
                      <Typography
                        key={i}
                        variant="caption"
                        sx={{
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 1,
                          bgcolor: 'rgba(201,160,99,0.08)',
                          border: '1px solid rgba(201,160,99,0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {v.overlayPlus ? (
                          <Box sx={{ position: 'relative', width: 16, height: 16, display: 'inline-flex' }}>
                            {v.react ? (
                              <IconComp style={{ color: v.color, fontSize: 16 }} />
                            ) : (
                              <IconComp sx={{ color: v.color, fontSize: 16 }} />
                            )}
                            <Box sx={{ position: 'absolute', right: -1, bottom: -1, width: 8, height: 8, bgcolor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                              <Box component="span" sx={{ fontSize: 8, lineHeight: 1, color: '#43a047', fontWeight: 700 }}>+</Box>
                            </Box>
                          </Box>
                        ) : (
                          v.react ? (
                            <IconComp style={{ color: v.color, fontSize: 14 }} />
                          ) : (
                            <IconComp sx={{ color: v.color, fontSize: 14 }} />
                          )
                        )}
                        {s.value} {getDisplayLabel(v.type, s.label)}
                      </Typography>
                    );
                  })}
                </Box>
              </TableCell>
              <TableCell>
                <Button variant="outlined" color="primary" onClick={() => onEdit && onEdit(item)}>Sửa</Button>
              </TableCell>
              <TableCell>
                <Button variant="outlined" color="error" onClick={() => handleDelete(item._id)}>Xóa</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default EquipmentList;
