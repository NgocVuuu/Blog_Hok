import React, { useMemo } from 'react';
import { Box, Typography, Select, MenuItem, IconButton, Slider, Paper } from '@mui/material';
import { MdAdd, MdRemove, MdDelete } from 'react-icons/md';

const COLORS: ('red' | 'green' | 'blue')[] = ['red', 'green', 'blue'];
const MAX_PER_COLOR = 10;

interface ArcanaSelectorProps {
    arcanaList: any[];
    build: any[]; // { arcanaId, count, arcana: fullObj }
    onUpdate: (newBuild: any[]) => void;
}

export default function ArcanaSelector({ arcanaList, build, onUpdate }: ArcanaSelectorProps) {

    // Helper to get total count for a color
    const getCount = (color: string) => {
        return build
            .filter(b => b.arcana.color === color)
            .reduce((sum, b) => sum + b.count, 0);
    };

    const handleAdd = (arcanaId: string) => {
        const arcana = arcanaList.find(a => a._id === arcanaId);
        if (!arcana) return;

        if (getCount(arcana.color) >= MAX_PER_COLOR) return;

        const existing = build.find(b => b.arcanaId === arcanaId);
        if (existing) {
            // Increment
            const newBuild = build.map(b => b.arcanaId === arcanaId ? { ...b, count: b.count + 1 } : b);
            onUpdate(newBuild);
        } else {
            // Add new
            onUpdate([...build, { arcanaId, count: 1, arcana }]);
        }
    };

    const handleChangeCount = (arcanaId: string, newCount: number) => {
        const b = build.find(x => x.arcanaId === arcanaId);
        if (!b) return;

        const otherCount = getCount(b.arcana.color) - b.count;
        if (otherCount + newCount > MAX_PER_COLOR) return; // Cap at 10

        if (newCount <= 0) {
            onUpdate(build.filter(x => x.arcanaId !== arcanaId));
        } else {
            onUpdate(build.map(x => x.arcanaId === arcanaId ? { ...x, count: newCount } : x));
        }
    };

    return (
        <Box>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                {COLORS.map(color => {
                    const colorBuild = build.filter(b => b.arcana.color === color);
                    const currentTotal = getCount(color);
                    const available = arcanaList.filter(a => a.color === color);

                    return (
                        <Box key={color} flex={1}>
                            <Paper sx={{ p: 2, bgcolor: 'background.paper', borderTop: `4px solid ${color === 'red' ? '#ff5252' : color === 'green' ? '#00c853' : '#448aff'}` }}>
                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Typography fontWeight={700} sx={{ textTransform: 'capitalize' }}>{color}</Typography>
                                    <Typography color={currentTotal === 10 ? 'success.main' : 'text.secondary'}>{currentTotal}/10</Typography>
                                </Box>

                                {/* Add Dropdown */}
                                <Select
                                    size="small"
                                    fullWidth
                                    displayEmpty
                                    value=""
                                    onChange={(e) => handleAdd(e.target.value)}
                                    disabled={currentTotal >= 10}
                                    sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.05)' }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300,
                                                bgcolor: '#1a1d21',
                                                '& .MuiMenuItem-root': { color: '#fff' },
                                                '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="" disabled>Add {color} arcana...</MenuItem>
                                    {available.map(a => (
                                        <MenuItem key={a._id} value={a._id} disabled={build.some(b => b.arcanaId === a._id)}>
                                            {a.name}
                                        </MenuItem>
                                    ))}
                                </Select>

                                {/* List Active */}
                                <Box display="flex" flexDirection="column" gap={2}>
                                    {colorBuild.map((item) => (
                                        <Box key={item.arcanaId}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="body2" fontWeight={600}>{item.arcana.name}</Typography>
                                                </Box>
                                                <IconButton size="small" onClick={() => handleChangeCount(item.arcanaId, 0)} sx={{ color: 'text.secondary', p: 0.5 }}>
                                                    <MdDelete />
                                                </IconButton>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Slider
                                                    size="small"
                                                    value={item.count}
                                                    min={1} max={10}
                                                    onChange={(_, v) => handleChangeCount(item.arcanaId, v as number)}
                                                    sx={{ color: color === 'red' ? '#ff5252' : color === 'green' ? '#00c853' : '#448aff' }}
                                                />
                                                <Typography width={20} textAlign="right" fontWeight={700}>{item.count}</Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
