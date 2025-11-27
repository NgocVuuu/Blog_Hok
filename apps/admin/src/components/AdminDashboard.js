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
  const [editingPost, setEditingPost] = useState(null);
  const [editingHero, setEditingHero] = useState(null);
  const [editingArcana, setEditingArcana] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);

  const handleEditPost = (post) => {
    setEditingPost(post);
    setTab(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostFormSubmit = () => {
    setEditingPost(null);
  };

  const handleEditHero = (hero) => {
    setEditingHero(hero);
    setTab(1); // Switch to heroes tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroFormSubmit = () => {
    setEditingHero(null);
  };

  const handleEditArcana = (arcana) => {
    setEditingArcana(arcana);
    setTab(2); // Switch to arcana tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleArcanaFormSubmit = () => {
    setEditingArcana(null);
  };

  const handleEditEquipment = (equipment) => {
    setEditingEquipment(equipment);
    setTab(3); // Switch to equipment tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEquipmentFormSubmit = () => {
    setEditingEquipment(null);
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
        <AdminPostForm editingPost={editingPost} onFormSubmit={handlePostFormSubmit} />
        <PostList onEdit={handleEditPost} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <AdminHeroForm
          editingHero={editingHero}
          onFormSubmit={handleHeroFormSubmit}
        />
        <HeroList onEdit={handleEditHero} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <AdminArcanaForm editingArcana={editingArcana} onFormSubmit={handleArcanaFormSubmit} />
        <ArcanaList onEdit={handleEditArcana} />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <AdminEquipmentForm
          editingEquipment={editingEquipment}
          onFormSubmit={handleEquipmentFormSubmit}
        />
        <EquipmentList onEdit={handleEditEquipment} />
      </TabPanel>
    </Box>
  );
};

export default AdminDashboard;