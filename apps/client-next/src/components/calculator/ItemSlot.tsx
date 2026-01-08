import React from 'react';
import { Box, IconButton } from '@mui/material';
import { MdClose, MdAdd } from 'react-icons/md';

interface ItemSlotProps {
    item: any | null;
    onClick: () => void;
    onRemove?: () => void;
}

export default function ItemSlot({ item, onClick, onRemove }: ItemSlotProps) {
    return (
        <Box sx={{ position: 'relative', width: 64, height: 64 }}>
            <Box
                onClick={onClick}
                sx={{
                    width: '100%', height: '100%',
                    bgcolor: item ? 'transparent' : 'rgba(255,255,255,0.05)',
                    border: item ? 'none' : '1px dashed rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    transition: '0.2s'
                }}
            >
                {item ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                ) : (
                    <MdAdd size={24} color="gray" />
                )}
            </Box>

            {/* Remove Button (Hover only) */}
            {item && onRemove && (
                <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    sx={{
                        position: 'absolute', top: -8, right: -8,
                        bgcolor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        p: 0.5,
                        '&:hover': { bgcolor: '#f44336' }
                    }}
                >
                    <MdClose size={12} color="white" />
                </IconButton>
            )}
        </Box>
    );
}
