import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import AdminPostForm from './AdminPostForm';
import AdminHeroForm from './AdminHeroForm';
import AdminArcanaForm from './AdminArcanaForm';
import AdminEquipmentForm from './AdminEquipmentForm';
import PostList from './PostList';
import HeroList from './HeroList';
import ArcanaList from './ArcanaList';
import EquipmentList from './EquipmentList';

function TabPanel({ children, value, index }) {
  return value === index && (
    <Box sx={{ p: 2 }}>
      {children}
    </Box>
  );
}

const AdminDashboard = () => {
  const [tab, setTab] = useState(0);
  const [editingHero, setEditingHero] = useState(null);

  const handleEditHero = (hero) => {
    setEditingHero(hero);
    setTab(1); // Switch to heroes tab
  };

  const handleHeroFormSubmit = () => {
    setEditingHero(null);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" mb={2}>Admin Dashboard</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
        <Tab label="Bài viết" />
        <Tab label="Tướng" />
        <Tab label="Arcana" />
        <Tab label="Trang bị" />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <AdminPostForm />
        <PostList />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <AdminHeroForm 
          editingHero={editingHero} 
          onFormSubmit={handleHeroFormSubmit}
        />
        <HeroList onEdit={handleEditHero} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <AdminArcanaForm />
        <ArcanaList />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <AdminEquipmentForm />
        <EquipmentList />
      </TabPanel>
    </Box>
  );
};

export default AdminDashboard; 