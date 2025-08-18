import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Grid, Card, CardContent, CardMedia, CardActions, TextField, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllHeroesAll, deleteHero } from '../services/heroService';

const HeroList = ({ onEdit }) => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
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
          // Token không hợp lệ, chuyển về trang đăng nhập
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

  const handleDelete = async (id) => {
    try {
      await deleteHero(id);
      setHeroes(heroes.filter(hero => hero._id !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        // Token không hợp lệ, chuyển về trang đăng nhập
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
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <TextField
          size="small"
          label="Tìm kiếm theo tên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 240 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="role-filter-label">Lọc theo vai trò</InputLabel>
          <Select
            labelId="role-filter-label"
            value={selectedRole}
            label="Lọc theo vai trò"
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            {rolesList.map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedRole !== 'all' && (
          <Chip label={selectedRole} color="primary" onDelete={() => setSelectedRole('all')} />
        )}
      </Box>
      <Grid container spacing={2}>
        {filteredHeroes.map((hero) => (
          <Grid item xs={12} sm={6} md={4} key={hero._id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={hero.image}
                alt={hero.name}
              />
              <CardContent>
                <Typography variant="h6">{hero.name}</Typography>
                <Typography variant="body2" color="text.secondary">{hero.title}</Typography>
                {Array.isArray(hero.roles) && hero.roles.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {hero.roles.map(role => (
                      <Chip key={role} size="small" label={role} />
                    ))}
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => onEdit(hero)}>Sửa</Button>
                <Button size="small" color="error" onClick={() => handleDelete(hero._id)}>Xóa</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HeroList; 