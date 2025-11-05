"use client";
import React from 'react';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useTheme } from '@mui/material/styles';
import useScrollTrigger from '@mui/material/useScrollTrigger';

export default function ScrollTopButton() {
  const theme = useTheme();
  const trigger = useScrollTrigger({ threshold: 240 });

  const handleClick = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={trigger}>
      <Fab
        onClick={handleClick}
        size="medium"
        aria-label="Back to top"
        sx={{
          position: 'fixed',
          right: { xs: 16, sm: 24 },
          bottom: { xs: 64, sm: 80 },
          zIndex: (theme) => (theme.zIndex?.speedDial ?? 1200),
          bgcolor: '#C9A063',
          color: '#2D1B06',
          boxShadow: 3,
          '&:hover': { bgcolor: '#b8924a' }
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
}
