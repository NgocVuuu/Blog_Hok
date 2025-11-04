"use client";
import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MdLanguage, MdMenu, MdClose } from 'react-icons/md';
import SectionUnderline from '../SectionUnderline';
import './Navbar.css';

const navLinks = [
  { to: '/', label: 'nav.home' },
  { to: '/heroes', label: 'nav.heroes' },
  { to: '/equipment', label: 'nav.equipment' },
  { to: '/arcana', label: 'nav.arcana' },
  { to: '/meta', label: 'nav.meta' },
  { to: '/news', label: 'nav.news' }
];

export default function Navbar(){
  const { t, i18n } = useTranslation();
  const pathname = usePathname() || '/';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoRotated, setLogoRotated] = useState(false);
  const [mobileLangAnchor, setMobileLangAnchor] = useState<null | HTMLElement>(null);
  const [mobileLangRotated, setMobileLangRotated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    handleClose();
  };
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };
  const handleMobileLangMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileLangAnchor(event.currentTarget as HTMLElement);
    setMobileLangRotated(true);
    setTimeout(() => setMobileLangRotated(false), 600);
  };
  const handleMobileLangClose = () => {
    setMobileLangAnchor(null);
  };
  const changeMobileLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    handleMobileLangClose();
  };

  // shrink navbar on scroll
  // Effect 1: listen to scroll and update scrolled state
  useEffect(() => {
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        
        requestAnimationFrame(() => {
          // Use simple comparison, update state only if changed
          const y = window.scrollY || document.documentElement.scrollTop || 0;
          const shouldShrink = y > 24;
          
          setScrolled(prev => {
            if (prev !== shouldShrink) {
              return shouldShrink;
            }
            return prev;
          });
          
          ticking = false;
        });
      }
    };

    // Only listen to window scroll for performance
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial check
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Effect 2: Update CSS variable instead of direct style manipulation
  useEffect(() => {
    // Use CSS variable to avoid forced reflow
    const height = scrolled ? 56 : 72;
    document.documentElement.style.setProperty('--navbar-height', `${height}px`);
  }, [scrolled]);

  // Responsive: Ẩn nav-links khi mobile, hiện Drawer
  return (
    <AppBar className={`navbar ${scrolled ? 'navbar-shrink' : ''}`} position="fixed" sx={{
      background: 'rgba(24,24,24,0.7)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 24px rgba(201,160,99,0.08)',
      borderBottom: '1.5px solid rgba(233,196,106,0.18)',
      zIndex: 1300,
      transition: 'height 0.25s ease, background 0.25s ease, backdrop-filter 0.25s ease',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      '@media (max-width: 960px)': {
        // mobile keeps same fixed treatment but sizes differ via Toolbar sx
        margin: 0,
        padding: 0
      }
    }}>
      <Toolbar sx={{
        minHeight: scrolled ? '56px' : '72px',
        transition: 'min-height 0.22s ease, padding 0.22s ease',
        '@media (max-width: 960px)': {
          minHeight: scrolled ? '48px !important' : '56px !important',
          maxHeight: scrolled ? '48px !important' : '56px !important',
          padding: '0 12px !important',
          margin: 0
        }
      }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: scrolled ? '1rem' : '1.5rem', transition: 'font-size 0.22s ease' }} className="logo">
          BlogHok
        </Typography>
        {/* Nav links - ẩn trên mobile */}
        <Box className="nav-links desktop-only">
          {navLinks.map(link => {
            const isActive = pathname === link.to;
            return (
              <Box key={link.to} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    disableElevation
                    disableRipple
                    color="inherit"
                    component={Link as any}
                    href={link.to}
                    sx={{
                      fontWeight: 400,
                      fontSize: scrolled ? 14 : 16,
                      background: 'none !important',
                      boxShadow: 'none !important',
                      px: 2,
                      position: 'relative',
                      minWidth: 0,
                      color: isActive ? '#FFD700' : '#fff',
                      textTransform: 'none',
                      '&:hover': {
                        color: '#FFD700',
                        background: 'none !important',
                        boxShadow: 'none !important',
                        outline: 'none !important',
                      },
                      '&:active': {
                        background: 'none !important',
                        boxShadow: 'none !important',
                        outline: 'none !important',
                        color: isActive ? '#FFD700' : '#fff',
                      },
                      '&:focus': {
                        background: 'none !important',
                        boxShadow: 'none !important',
                        outline: 'none !important',
                        color: isActive ? '#FFD700' : '#fff',
                      },
                      '&:focus-visible': {
                        background: 'none !important',
                        boxShadow: 'none !important',
                        outline: 'none !important',
                        color: isActive ? '#FFD700' : '#fff',
                      },
                    }}
                  >
                    {t(link.label)}
                  </Button>
                  <Box
                    className="underline-anim"
                    sx={{
                      height: '8px',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      transform: 'scaleX(0)',
                      transformOrigin: 'center',
                      transition: 'transform 0.05s linear',
                      pointerEvents: 'none',
                      '.MuiButton-root:hover + &': {
                        transform: 'scaleX(1)',
                        transition: 'transform 0.6s cubic-bezier(.4,2,.6,1)',
                      }
                    }}
                  >
                    <SectionUnderline width={40} color="#FFD700" style={{ marginTop: 0, marginBottom: 2 }} />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
        {/* Language selector - ẩn trên mobile */}
        <Box className="language-selector desktop-only">
          <IconButton
            size="large"
            aria-label="language selection"
            aria-controls="language-menu"
            aria-haspopup="true"
            onClick={(e) => { handleMenu(e); setLogoRotated(true); setTimeout(() => setLogoRotated(false), 600); }}
            color="inherit"
            className={logoRotated ? 'logo-rotate' : ''}
          >
            <MdLanguage style={{ color: 'white' }} size={20} />
          </IconButton>
          <Menu
            id="language-menu"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => changeLanguage('en')}>English</MenuItem>
            <MenuItem onClick={() => changeLanguage('vi')}>Tiếng Việt</MenuItem>
            <MenuItem onClick={() => changeLanguage('id')}>Bahasa Indonesia</MenuItem>
            <MenuItem onClick={() => changeLanguage('zh')}>中文</MenuItem>
          </Menu>
        </Box>
        {/* Logout - ẩn trên mobile */}
        {user && user.role === 'admin' && (
          <Button
            variant="outlined"
            color="success"
            sx={{ ml: 2, fontWeight: 700 }}
            onClick={handleLogout}
            className="desktop-only"
          >
            {t('logout')}
          </Button>
        )}
        {/* Hamburger menu - chỉ hiện trên mobile */}
        <IconButton
          color="inherit"
          edge="end"
          onClick={() => setDrawerOpen(true)}
          className="mobile-only"
          sx={{ ml: 1 }}
          aria-label="Open navigation menu"
        >
          <MdMenu size={24} style={{ color: 'white' }} />
        </IconButton>
        {/* Drawer cho mobile */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => { setDrawerOpen(false); setMobileLangAnchor(null); }}
          PaperProps={{
            sx: {
              width: 240,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#2D1B06',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              borderLeft: '1px solid rgba(201, 160, 99, 0.2)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: 0 }}>
            <Typography variant="h6" sx={{ flexGrow: 1, color: '#C9A063', fontWeight: 700 }}>BlogHok</Typography>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#2D1B06' }}>
              <MdClose />
            </IconButton>
          </Box>
          <Divider sx={{ my: 1, borderColor: 'rgba(201, 160, 99, 0.3)' }} />
          <List>
            {navLinks.map(link => (
              <ListItem key={link.to} disablePadding>
                <ListItemButton
                  component={Link as any}
                  href={link.to}
                  onClick={() => { setDrawerOpen(false); setMobileLangAnchor(null); }}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(201, 160, 99, 0.1)',
                      borderRadius: '8px',
                      mx: 1
                    }
                  }}
                >
                  <ListItemText
                    primary={t(link.label)}
                    sx={{
                      '& .MuiTypography-root': {
                        color: '#2D1B06',
                      fontWeight: 500
                    }
                  }}
                />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1, borderColor: 'rgba(201, 160, 99, 0.3)' }} />
          <Box sx={{ px: 2, py: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              size="medium"
              aria-label="language selection"
              aria-controls="mobile-language-menu"
              aria-haspopup="true"
              onClick={handleMobileLangMenu}
              className={mobileLangRotated ? 'logo-rotate' : ''}
              sx={{
                border: '1.2px solid #C9A063',
                borderRadius: '10px',
                background: 'rgba(201, 160, 99, 0.1)',
                boxShadow: '0 2px 8px rgba(201, 160, 99, 0.2)',
                p: '4px',
                '&:hover': {
                  background: 'rgba(201, 160, 99, 0.2)'
                }
              }}
            >
              <MdLanguage size={18} style={{ color: '#2D1B06' }} />
            </IconButton>
            <Menu
              id="mobile-language-menu"
              anchorEl={mobileLangAnchor}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              open={Boolean(mobileLangAnchor)}
              onClose={handleMobileLangClose}
              PaperProps={{
                sx: {
                  minWidth: 120,
                  p: 0.5,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(201, 160, 99, 0.3)'
                }
              }}
            >
              <MenuItem
                onClick={() => changeMobileLanguage('en')}
                sx={{ color: '#2D1B06', '&:hover': { backgroundColor: 'rgba(201, 160, 99, 0.1)' } }}
              >
                EN
              </MenuItem>
              <MenuItem
                onClick={() => changeMobileLanguage('vi')}
                sx={{ color: '#2D1B06', '&:hover': { backgroundColor: 'rgba(201, 160, 99, 0.1)' } }}
              >
                VI
              </MenuItem>
              <MenuItem
                onClick={() => changeMobileLanguage('id')}
                sx={{ color: '#2D1B06', '&:hover': { backgroundColor: 'rgba(201, 160, 99, 0.1)' } }}
              >
                ID
              </MenuItem>
              <MenuItem
                onClick={() => changeMobileLanguage('zh')}
                sx={{ color: '#2D1B06', '&:hover': { backgroundColor: 'rgba(201, 160, 99, 0.1)' } }}
              >
                中文
              </MenuItem>
            </Menu>
          </Box>
          {user && user.role === 'admin' && (
            <Box sx={{ px: 2, py: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  color: '#2D1B06',
                  borderColor: '#C9A063',
                  '&:hover': {
                    backgroundColor: 'rgba(201, 160, 99, 0.1)',
                    borderColor: '#C9A063'
                  }
                }}
              >
                {t('logout')}
              </Button>
            </Box>
          )}
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
