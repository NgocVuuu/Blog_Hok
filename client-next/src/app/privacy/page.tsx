import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function PrivacyPage(){
  const lastUpdated = new Date().toISOString().substring(0,10);
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom>Privacy Policy</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        [BlogHok] (“we”, “our”, “us”) is committed to protecting the privacy and personal information of our users. This policy explains how we collect, use, and protect your data when you access and use our website.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>1. Information We Collect</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Personal Information: Name, email (if you contact us or subscribe to our newsletter).
          Automatic Information: IP address, browser type, device type, access time, pages visited (via Google Analytics or similar tools).
          Cookies: We use cookies to improve user experience and analyze traffic.
        </Typography>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>2. How We Use Your Information</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          To provide and improve the content and services of the website.
          To send notifications or newsletters if you subscribe.
          To analyze user behavior for experience optimization.
        </Typography>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>3. Information Sharing</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          We do not sell or trade your personal information to third parties.
          Information may be shared with service providers (e.g., email platforms, web analytics) as necessary to operate the website.
        </Typography>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>4. Security</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          We implement reasonable security measures to protect your personal information, but we cannot guarantee absolute security.
        </Typography>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>5. External Links</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Our website may contain links to third-party websites. We are not responsible for the content or privacy practices of those sites.
        </Typography>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>6. Changes to This Policy</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          We may update this policy at any time. The new version will be posted on this page with the updated date.
        </Typography>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>6. Contact</Typography>
        <Typography variant="body2" color="text.secondary">
          Questions? Email us at: paulvu@swqpz.onmicrosoft.com
        </Typography>
      </Box>
      <Box sx={{ mt: 6 }}>
        <Typography variant="caption" color="text.disabled">Last updated: {lastUpdated}</Typography>
      </Box>
    </Container>
  );
}
