import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, CardMedia, TextField, Chip, Tabs, Tab, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { getAllHeroesAll, deleteHero } from '../services/heroService';
import ConfirmDialog from './ConfirmDialog';

const HeroList = ({ onEdit, editingItem }) => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [deleteId, setDeleteId] = useState(null); // ID of item to delete
  const navigate = useNavigate();

  const rolesList = ['Marksman', 'Mage', 'Tank', 'Fighter', 'Assassin', 'Support'];

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const data = await getAllHeroesAll({ page: 1, limit: 100, sort: 'name' });
        setHeroes(data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(err.message);
        }
        setLoading(false);
      }
    };
    fetchHeroes();
  }, [navigate]);

  const filteredHeroes = useMemo(() => {
    let list = Array.isArray(heroes) ? heroes : [];
    const term = (searchTerm || '').toLowerCase();
    if (term) list = list.filter(h => (h.name || '').toLowerCase().includes(term));
    if (selectedRole !== 'all') list = list.filter(h => Array.isArray(h.roles) && h.roles.includes(selectedRole));
    return list;
  }, [heroes, searchTerm, selectedRole]);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHero(deleteId);
      setHeroes(heroes.filter(hero => hero._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Danh sách tướng</Typography>
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={selectedRole}
          onChange={(e, v) => setSelectedRole(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab value="all" label="Tất cả" />
          {rolesList.map(r => (
            <Tab key={r} value={r} label={r} />
          ))}
        </Tabs>
        <TextField
          size="small"
          label="Tìm kiếm theo tên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 240 }}
        />
      </Box>
      <Grid container spacing={2}>
        {filteredHeroes.map((hero) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={hero._id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              outline: editingItem && editingItem._id === hero._id ? '3px solid #1976d2' : 'none',
              boxShadow: editingItem && editingItem._id === hero._id ? '0 0 10px rgba(25, 118, 210, 0.5)' : undefined
            }}>
              {/* Action buttons overlay or at bottom? Let's put them at bottom for clarity but dense */}
              <CardMedia
                component="img"
                height="100"
                image={hero.image}
                alt={hero.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 1.5, flexGrow: 1, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 0.5 }} noWrap title={hero.name}>
                  {hero.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ mb: 1 }}>
                  {hero.title || 'No title'}
                </Typography>

                {Array.isArray(hero.roles) && hero.roles.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {hero.roles.slice(0, 2).map(role => (
                      <Chip
                        key={role}
                        label={role}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          '& .MuiChip-label': { px: 0.5 }
                        }}
                      />
                    ))}
                    {hero.roles.length > 2 && (
                      <Chip label={`+${hero.roles.length - 2}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                    )}
                  </Box>
                )}
              </CardContent>
              <Box sx={{ p: 1, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Tooltip title="Sửa">
                  <IconButton size="small" color="primary" onClick={() => onEdit(hero)} sx={{ p: 0.5, bgcolor: 'action.hover' }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa">
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(hero._id)} sx={{ p: 0.5, bgcolor: 'action.hover' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <ConfirmDialog
        open={!!deleteId}
        title="Xóa tướng"
        content="Bạn có chắc chắn muốn xóa tướng này? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default HeroList; 