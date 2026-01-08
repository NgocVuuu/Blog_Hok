import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Collapse,
    Alert
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Check, Close } from '@mui/icons-material';
import axios from 'axios';
// Simple toast implementation if not available globally, or assume existing toast usage
// adapting to minimal deps.

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';

function Row({ row, onAction }) {
    const [open, setOpen] = useState(false);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.targetHeroName}
                </TableCell>
                <TableCell>
                    <Chip
                        label={row.type}
                        color={row.type === 'NEW_HERO' ? 'primary' : 'secondary'}
                        size="small"
                    />
                </TableCell>
                <TableCell>{new Date(row.discoveredAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Check />}
                        onClick={() => onAction(row._id, 'approve')}
                        sx={{ mr: 1 }}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Close />}
                        onClick={() => onAction(row._id, 'reject')}
                    >
                        Reject
                    </Button>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Payload Details
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                <pre style={{ margin: 0, overflow: 'auto' }}>
                                    {JSON.stringify(row.payload, null, 2)}
                                </pre>
                            </Paper>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default function DraftChangesPage() {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDrafts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/drafts`);
            setDrafts(res.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch drafts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, []);

    const handleAction = async (id, action) => {
        try {
            if (!window.confirm(`Are you sure you want to ${action} this draft?`)) return;

            await axios.post(`${API_URL}/api/drafts/${id}/${action}`);
            // Refresh list
            fetchDrafts();
            alert(`Draft ${action}d successfully`);
        } catch (err) {
            alert(`Failed to ${action} draft: ${err.message}`);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Draft Changes (Pending Review)
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {drafts.length === 0 && !loading ? (
                <Alert severity="info">No pending drafts found.</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Target Hero</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Discovered At</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {drafts.map((draft) => (
                                <Row key={draft._id} row={draft} onAction={handleAction} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
