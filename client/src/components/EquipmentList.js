import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Box, Typography } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL;

const EquipmentList = ({ onEdit }) => {
  const [equipment, setEquipment] = useState([]);

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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tên trang bị</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Ảnh</TableCell>
            <TableCell>Sửa</TableCell>
            <TableCell>Xóa</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equipment.map(item => (
            <TableRow key={item._id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell><img src={item.image} alt="" width={40} /></TableCell>
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
