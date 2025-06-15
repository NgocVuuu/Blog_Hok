import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Grid, Card, CardContent, CardMedia, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllHeroes, deleteHero } from '../services/heroService';

const HeroList = ({ onEdit }) => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const data = await getAllHeroes();
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
      <Grid container spacing={2}>
        {heroes.map((hero) => (
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