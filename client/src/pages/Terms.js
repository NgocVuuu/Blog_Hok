import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Terms = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Typography variant="h3" gutterBottom>Terms of Use</Typography>
    <Typography variant="body1" color="text.secondary" paragraph>
      By accessing or using BlogHok you agree to these Terms of Use. If you do not agree, please stop using the site.
    </Typography>
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Acceptable Use</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        You agree not to abuse the service, interfere with its operation, probe or attempt unauthorized access, automate excessive requests, or use the content for unlawful purposes.
      </Typography>
    </Box>
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Content</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Information provided is for general game guidance. We are not affiliated with the official game publisher. Trademarks belong to their respective owners.
      </Typography>
    </Box>
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Disclaimer</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        The site is provided "as is" without warranties of any kind. We are not liable for losses arising from use of the site.
      </Typography>
    </Box>
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Changes</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        We may update these terms at any time. Continued use after changes constitutes acceptance.
      </Typography>
    </Box>
    <Box sx={{ mt: 6 }}>
      <Typography variant="caption" color="text.disabled">Last updated: {new Date().toISOString().substring(0, 10)}</Typography>
    </Box>
  </Container>
);

export default Terms;
