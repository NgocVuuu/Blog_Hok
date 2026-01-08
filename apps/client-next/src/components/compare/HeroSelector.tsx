'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, InputAdornment, IconButton, Typography, Avatar } from '@mui/material';
import { MdSearch as SearchIcon, MdClose as CloseIcon } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

interface HeroSelectorProps {
    heroes: any[];
    selectedHero?: any;
    onSelect: (hero: any) => void;
    label?: string;
    excludeId?: string;
}

export default function HeroSelector({ heroes, selectedHero, onSelect, label, excludeId }: HeroSelectorProps) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const suggestions = React.useMemo(() => {
        const term = (query || '').trim().toLowerCase();

        // Filter heroes: Exclude already selected (excludeId), match name
        const matches = heroes.filter(h =>
            (h._id !== excludeId) &&
            (h.name || '').toLowerCase().includes(term)
        );

        // If no query, show top heroes (or all)
        // Here we just limit to 8 for dropdown performance
        return matches.slice(0, 8);
    }, [query, heroes, excludeId]);

    return (
        <Box ref={wrapperRef} sx={{ position: 'relative', width: '100%' }}>
            {selectedHero ? (
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.1)',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        position: 'relative',
                        animation: 'fadeIn 0.3s ease'
                    }}
                >
                    <Avatar
                        src={selectedHero.image}
                        alt={selectedHero.name}
                        sx={{ width: 48, height: 48, border: '2px solid #C9A063' }}
                    />
                    <Box>
                        <Typography fontWeight={700}>{selectedHero.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{String(t(`roles.${selectedHero.roles?.[0]}`, selectedHero.roles?.[0]))}</Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => onSelect(null)}
                        sx={{ position: 'absolute', right: 8, color: 'text.secondary', '&:hover': { color: '#f44336' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            ) : (
                <>
                    <TextField
                        fullWidth
                        placeholder={label || String(t('common.select_hero', 'Select Hero...'))}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpen(true);
                        }}
                        onClick={() => setOpen(true)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                            ),
                            sx: {
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }
                            }
                        }}
                    />
                    {open && (
                        <Box sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            mt: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 6,
                            zIndex: 10,
                            maxHeight: 300,
                            overflowY: 'auto',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {suggestions.map((h: any) => (
                                <Box
                                    key={h._id}
                                    onClick={() => {
                                        onSelect(h);
                                        setOpen(false);
                                        setQuery('');
                                    }}
                                    sx={{
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' },
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <Avatar src={h.image} sx={{ width: 32, height: 32, borderRadius: 1 }} variant="rounded" />
                                    <Typography variant="body2" fontWeight={600}>{h.name}</Typography>
                                </Box>
                            ))}
                            {suggestions.length === 0 && (
                                <Box p={2} textAlign="center">
                                    <Typography variant="body2" color="text.secondary">{String(t('common.no_results', 'No matches'))}</Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
