import React, { useState, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, TextField, Tabs, Tab, Typography, InputAdornment } from '@mui/material';
import { MdSearch } from 'react-icons/md';

interface ItemSelectorModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (item: any) => void;
    equipment: any[];
}

const CATEGORIES = ['All', 'Physical', 'Magic', 'Defense', 'Movement', 'Jungle', 'Support'];

export default function ItemSelectorModal({ open, onClose, onSelect, equipment = [] }: ItemSelectorModalProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [query, setQuery] = useState('');

    const filteredItems = useMemo(() => {
        let items = equipment;
        // Filter by Tab (Category)
        if (activeTab !== 0) {
            const cat = CATEGORIES[activeTab].toLowerCase();
            items = items.filter(i => i.category && i.category.toLowerCase().includes(cat));
        }
        // Filter by Query
        if (query) {
            const lower = query.toLowerCase();
            items = items.filter(i => i.name.toLowerCase().includes(lower));
        }
        return items;
    }, [equipment, activeTab, query]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#1a1d21', color: '#fff' } }}>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>Select Equipment</DialogTitle>
            <DialogContent sx={{ p: 0, height: '60vh', display: 'flex', flexDirection: 'column' }}>

                {/* Search Bar */}
                <Box p={2} borderBottom="1px solid rgba(255,255,255,0.1)">
                    <TextField
                        fullWidth
                        placeholder="Search equipment..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><MdSearch color="gray" /></InputAdornment>,
                            sx: { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }
                        }}
                        sx={{ '& .MuiInputBase-input': { color: '#fff' } }}
                    />
                </Box>

                {/* Categories */}
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)' },
                        '& .Mui-selected': { color: '#C9A063 !important' }
                    }}
                >
                    {CATEGORIES.map((cat, idx) => (
                        <Tab key={cat} label={cat} />
                    ))}
                </Tabs>

                {/* Grid */}
                <Box p={2} sx={{ overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
                    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(80px, 1fr))" gap={2}>
                        {filteredItems.map((item: any) => (
                            <Box key={item._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box
                                    onClick={() => onSelect(item)}
                                    sx={{
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        width: '100%',
                                        maxWidth: 80,
                                        '&:hover img': { transform: 'scale(1.1)', borderColor: '#C9A063' }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: '100%', aspectRatio: '1', position: 'relative', overflow: 'hidden', borderRadius: 2,
                                            border: '1px solid rgba(255,255,255,0.1)', mb: 0.5
                                        }}
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.2s' }}
                                        />
                                    </Box>
                                    <Typography variant="caption" noWrap display="block" color="rgba(255,255,255,0.7)" sx={{ fontSize: '0.7rem' }}>{item.name}</Typography>
                                    <Typography variant="caption" color="#C9A063" fontWeight="bold">{item.price}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                    {filteredItems.length === 0 && (
                        <Typography textAlign="center" mt={4} color="rgba(255,255,255,0.5)">No items found.</Typography>
                    )}
                </Box>  </DialogContent>
        </Dialog>
    );
}
