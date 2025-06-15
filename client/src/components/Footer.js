import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import './Footer.css';
import useMediaQuery from '@mui/material/useMediaQuery';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Box component="footer" className="footer">
      {isMobile ? (
        <Box className="footer-bottom" sx={{ p: 0.5, m: 0, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" align="center" sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block', fontWeight: 500 }}>
            {t('footer.about.title', 'About BlogHok')}
          </Typography>
          <Typography variant="caption" align="center" sx={{ fontSize: '0.7rem', mb: 0.5, color: '#ffe066', display: 'block', wordBreak: 'break-all' }}>
            {t('footer.contact.email', 'contact@bloghok.com')}
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" sx={{ fontSize: '0.75rem', display: 'block' }}>
            © {currentYear} BlogHok. {t('footer.copyright', 'All rights reserved')}
          </Typography>
        </Box>
      ) : (
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* About Section */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom className="footer-title">
                {t('footer.about.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="footer-description">
                {t('footer.about.description')}
              </Typography>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom className="footer-title">
                {t('footer.links.title')}
              </Typography>
              <Box className="footer-links">
                <Link href="/heroes" color="inherit" className="footer-link">
                  {t('nav.heroes')}
                </Link>
                <Link href="/equipment" color="inherit" className="footer-link">
                  {t('nav.equipment')}
                </Link>
                <Link href="/arcana" color="inherit" className="footer-link">
                  {t('nav.arcana')}
                </Link>
                <Link href="/meta" color="inherit" className="footer-link">
                  {t('nav.meta')}
                </Link>
                <Link href="/news" color="inherit" className="footer-link">
                  {t('nav.news')}
                </Link>
              </Box>
            </Grid>

            {/* Contact & Social */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom className="footer-title">
                {t('footer.contact.title')}
              </Typography>
              <Box className="social-links">
                <IconButton color="inherit" aria-label="Facebook" className="social-icon">
                  <FacebookIcon />
                </IconButton>
                <IconButton color="inherit" aria-label="Twitter" className="social-icon">
                  <TwitterIcon />
                </IconButton>
                <IconButton color="inherit" aria-label="Instagram" className="social-icon">
                  <InstagramIcon />
                </IconButton>
                <IconButton color="inherit" aria-label="YouTube" className="social-icon">
                  <YouTubeIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" className="footer-contact">
                {t('footer.contact.email')}
              </Typography>
            </Grid>
          </Grid>

          {/* Copyright */}
          <Box className="footer-bottom">
            <Typography variant="body2" color="text.secondary" align="center">
              © {currentYear} BlogHok. {t('footer.copyright')}
            </Typography>
            <Box className="footer-legal">
              <Link href="/privacy" color="inherit" className="footer-link">
                {t('footer.privacy')}
              </Link>
              <Link href="/terms" color="inherit" className="footer-link">
                {t('footer.terms')}
              </Link>
              <Link href="/contact" color="inherit" className="footer-link">
                {t('footer.contact.title')}
              </Link>
            </Box>
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default Footer; 