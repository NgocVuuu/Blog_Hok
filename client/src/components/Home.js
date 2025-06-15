import React from 'react';
import { Container } from '@mui/material';
import Banner from './Banner';
import FeaturedPosts from './FeaturedPosts';

const Home = () => (
  <Container sx={{ mt: 4 }}>
    <Banner />
    <FeaturedPosts />
  </Container>
);

export default Home; 