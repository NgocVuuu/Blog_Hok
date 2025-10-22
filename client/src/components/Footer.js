import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SvgIcon from '@mui/material/SvgIcon';
import './Footer.css';
import useMediaQuery from '@mui/material/useMediaQuery';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const isMobile = useMediaQuery('(max-width:600px)');
  const tiktokUrl = 'https://www.tiktok.com/@blog_hok';

  const TikTokIcon = (props) => (
    // Render the supplied white glyph only, without a background, and scale it slightly to appear slimmer
    <SvgIcon viewBox="0 0 32 32" {...props}>
      <g transform="translate(16,16) scale(0.85,0.78) translate(-16,-16)">
  <path fill="currentColor" stroke="currentColor" d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z" />
      </g>
    </SvgIcon>
  );

  return (
    <Box component="footer" className="footer">
      {isMobile ? (
        <Box className="footer-bottom" sx={{ p: 0.5, m: 0, textAlign: 'center' }}>
          {/* Legal links row (mobile) */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mb: 0.5,
          }}>
            <Link href="/privacy" underline="always" color="inherit" sx={{ fontSize: '0.75rem' }}>
              {t('footer.privacy', 'Privacy Policy')}
            </Link>
            <Link href="/terms" underline="always" color="inherit" sx={{ fontSize: '0.75rem' }}>
              {t('footer.terms', 'Terms of Use')}
            </Link>
            <Link href="/contact" underline="always" color="inherit" sx={{ fontSize: '0.75rem' }}>
              {t('footer.contact.title', 'Contact')}
            </Link>
          </Box>
          {/* TikTok icon above the contact email on mobile */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 0.25 }}>
            <IconButton component="a" href={tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="social-icon">
              <TikTokIcon />
            </IconButton>
          </Box>
          <Typography variant="caption" align="center" sx={{ fontSize: '0.68rem', mb: 0.25, color: '#ffe066', display: 'block', wordBreak: 'break-all' }}>
            {t('footer.contact.email', 'paulvu@swqpz.onmicrosoft.com')}
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
                {/* Only TikTok icon is shown per request */}
                <IconButton component="a" href={tiktokUrl} target="_blank" rel="noopener noreferrer" color="inherit" aria-label="TikTok" className="social-icon">
                  <TikTokIcon />
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