import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button, Box,
  Typography, Chip, Paper, TableContainer, TablePagination, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';
import ConfirmDialog from './ConfirmDialog';

const ExpandableContent = ({ content, isDeleted }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > 150;

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600 }}>
      <Typography
        variant="body2"
        sx={{
          textDecoration: isDeleted ? 'line-through' : 'none',
          color: isDeleted ? 'text.disabled' : 'text.primary',
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: expanded ? 'none' : 3,
          wordBreak: 'break-word'
        }}
      >
        {content}
      </Typography>
      {isLong && (
        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{ textTransform: 'none', p: 0, minWidth: 'auto', mt: 0.5, fontSize: '0.75rem' }}
        >
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </Button>
      )}
      {isDeleted && <Chip label="Deleted" size="small" color="error" variant="outlined" sx={{ mt: 0.5 }} />}
    </Box>
  );
};

const CommentList = () => {
  const { fetchWithAuth } = useAuth();
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState(null);

  const fetchComments = useCallback(async () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';
    try {
      // page is 1-based in API, but 0-based in MUI
      const res = await fetchWithAuth(`${API_URL}/api/comments?page=${page + 1}&limit=${rowsPerPage}`);
      const json = await res.json();
      if (json.success) {
        setComments(json.data);
        if (json.pagination) {
            setTotal(json.pagination.total);
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [page, rowsPerPage, fetchWithAuth]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';
    try {
      await fetchWithAuth(`${API_URL}/api/comments/${deleteId}`, {
        method: 'DELETE'
      });
      setDeleteId(null);
      fetchComments(); // Refresh list
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>User Comments</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {comment.user ? (
                            <>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{comment.user.name}</Typography>
                            </>
                        ) : 'Unknown User'}
                    </Box>
                </TableCell>
                <TableCell>
                  <ExpandableContent content={comment.content} isDeleted={comment.isDeleted} />
                </TableCell>
                <TableCell>
                    <Chip size="small" label={comment.targetType} color="primary" variant="outlined" sx={{ mr: 1 }} />
                    <Typography variant="caption">{comment.targetId}</Typography>
                </TableCell>
                <TableCell>
                  {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  {!comment.isDeleted && (
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    size="small"
                    onClick={() => handleDeleteClick(comment._id)}
                  >
                    Delete
                  </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {comments.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} align="center">No comments found</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[20, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Comment"
        content="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default CommentList;
