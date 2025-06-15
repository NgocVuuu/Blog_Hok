import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ArcanaList = () => {
  const [arcana, setArcana] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchArcana = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/arcana`);
      if (res.ok) {
        const response = await res.json();
        // Handle new API response format
        const arcanaData = response.success ? response.data : (Array.isArray(response) ? response : []);
        setArcana(arcanaData);
      } else {
        setError('Không thể tải danh sách arcana');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách arcana');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchArcana();
  }, [fetchArcana]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa arcana này?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/arcana/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setArcana(arcana.filter(item => item._id !== id));
        } else {
          setError('Không thể xóa arcana');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi xóa arcana');
      }
    }
  };

  const getColorChipColor = (color) => {
    switch (color) {
      case 'red': return '#f44336';
      case 'blue': return '#2196f3';
      case 'green': return '#4caf50';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" mb={2}>
        Danh sách Arcana ({arcana.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {arcana.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Chưa có arcana nào
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ảnh</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Màu</TableCell>
                <TableCell>Cấp</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Thuộc tính chính</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {arcana.map((item) => {
                // Get main attributes (non-zero values)
                const mainAttributes = Object.entries(item.attributes || {})
                  .filter(([key, value]) => value > 0)
                  .slice(0, 2)
                  .map(([key, value]) => `${key}: +${value}`)
                  .join(', ');

                return (
                  <TableRow key={item._id}>
                    <TableCell>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: 40, height: 40, objectFit: 'cover' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.color}
                        size="small"
                        sx={{
                          bgcolor: getColorChipColor(item.color),
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`T${item.tier}`}
                        size="small"
                        sx={{
                          bgcolor: '#C9A063',
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {item.description?.substring(0, 100)}
                        {item.description?.length > 100 && '...'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {mainAttributes || 'Không có'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            // TODO: Implement edit functionality
                            console.log('Edit arcana:', item._id);
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(item._id)}
                        >
                          Xóa
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ArcanaList;
