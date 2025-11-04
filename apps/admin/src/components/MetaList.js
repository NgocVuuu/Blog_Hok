import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Box, Typography } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL;

const MetaList = ({ onEdit }) => {
  const [meta, setMeta] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/meta`)
      .then(res => res.json())
      .then(data => setMeta(data));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa meta này?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/meta/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setMeta(meta.filter(m => m._id !== id));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" mb={2}>Danh sách meta</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tiêu đề</TableCell>
            <TableCell>Mô tả</TableCell>
            <TableCell>Sửa</TableCell>
            <TableCell>Xóa</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {meta.map(m => (
            <TableRow key={m._id}>
              <TableCell>{m.title}</TableCell>
              <TableCell>{m.description}</TableCell>
              <TableCell>
                <Button variant="outlined" color="primary" onClick={() => onEdit && onEdit(m)}>Sửa</Button>
              </TableCell>
              <TableCell>
                <Button variant="outlined" color="error" onClick={() => handleDelete(m._id)}>Xóa</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default MetaList;