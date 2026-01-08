import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface StatsPanelProps {
    totals: any;
}

export default function StatsPanel({ totals }: StatsPanelProps) {
    if (!totals) return null;

    return (
        <Paper sx={{ p: 3, height: '100%', position: 'sticky', top: 24 }}>
            <Typography variant="h6" gutterBottom fontWeight={700}>Total Bonus Stats</Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
                {Object.entries(totals).map(([key, val]: [string, any]) => {
                    if (!val) return null;
                    // Pretty Print Keys
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                        <Box key={key} display="flex" justifyContent="space-between" borderBottom="1px solid rgba(255,255,255,0.05)" pb={1}>
                            <Typography color="text.secondary" variant="body2">{label}</Typography>
                            <Typography fontWeight={700} color={val > 0 ? 'success.main' : 'text.primary'}>
                                {key.toLowerCase().includes('rate') || key.includes('Reduction') || key.includes('Steal') ? `${val}%` : `+${val}`}
                            </Typography>
                        </Box>
                    );
                })}
                {Object.values(totals).every(v => !v) && (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">Select items to see stats.</Typography>
                )}
            </Box>
        </Paper>
    );
}
