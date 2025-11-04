import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

// Minimal navbar: keep only the logo per request
const Navbar = () => {
  return (
    <AppBar position="fixed" sx={{ background: 'transparent', boxShadow: 'none', top: 0 }}>
      <Toolbar sx={{ minHeight: 56, px: 2 }}>
        <Typography variant="h6" component="div" sx={{ color: '#fff', fontWeight: 700 }} className="logo">
          BlogHok
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;