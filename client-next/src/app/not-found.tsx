"use client";
import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';

export default function NotFound(){
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 700, color: '#C9A063' }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="contained"
          size="large"
          sx={{
            bgcolor: '#C9A063',
            '&:hover': { bgcolor: '#B8956B' }
          }}
        >
          Back to home
        </Button>
      </Box>
    </Container>
  );
}
