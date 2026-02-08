import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Container, Badge } from '@mui/material';
import AdminPostForm from './AdminPostForm';
import AdminHeroForm from './AdminHeroForm';
import AdminArcanaForm from './AdminArcanaForm';
import AdminEquipmentForm from './AdminEquipmentForm';
import PostList from './PostList';
import HeroList from './HeroList';
import ArcanaList from './ArcanaList';
import EquipmentList from './EquipmentList';
import CommentList from './CommentList';
import DraftChangesPage from '../pages/DraftChangesPage';
import DataHealthPage from '../pages/DataHealthPage';

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
  const [postRefreshTrigger, setPostRefreshTrigger] = useState(0);
  const [heroRefreshTrigger, setHeroRefreshTrigger] = useState(0);
  const [arcanaRefreshTrigger, setArcanaRefreshTrigger] = useState(0);
  const [equipmentRefreshTrigger, setEquipmentRefreshTrigger] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [healthIssueCount, setHealthIssueCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';
      try {
        const res = await fetch(`${API_URL}/api/drafts`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDraftCount(json.data.length);
        }
      } catch (e) {
        console.error('Failed to fetch draft count', e);
      }

      try {
        const res = await fetch(`${API_URL}/api/data-checks/summary`);
        const json = await res.json();
        if (json.success) {
           const issues = json.data;
           const count = (issues.duplicateSkins?.length || 0) +
                         (issues.duplicateEquipment?.length || 0) +
                         (issues.missingSkinImages?.length || 0) +
                         (issues.missingHeroImages?.length || 0) +
                         (issues.security?.length || 0);
           setHealthIssueCount(count);
        }
      } catch (e) {
        console.error('Failed to fetch health issues', e);
      }
    };
    fetchData();
  }, [tab]); // Refresh when switching tabs

  const handleEditPost = (post) => {
    setEditingPost(post);
    setTab(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostFormSubmit = () => {
    setEditingPost(null);
    setPostRefreshTrigger(prev => prev + 1); // Refresh list
  };

  const handlePostUpdated = () => {
    setPostRefreshTrigger(prev => prev + 1); // Refresh list but keep form
  };

  const handleEditHero = (hero) => {
    setEditingHero(hero);
    setTab(1); // Switch to heroes tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroFormSubmit = () => {
    setEditingHero(null);
    setHeroRefreshTrigger(prev => prev + 1);
  };

  const handleEditArcana = (arcana) => {
    setEditingArcana(arcana);
    setTab(2); // Switch to arcana tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleArcanaFormSubmit = () => {
    setEditingArcana(null);
    setArcanaRefreshTrigger(prev => prev + 1);
  };

  const handleEditEquipment = (equipment) => {
    setEditingEquipment(equipment);
    setTab(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEquipmentFormSubmit = () => {
    setEditingEquipment(null);
    setEquipmentRefreshTrigger(prev => prev + 1);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" mb={2}>Admin Dashboard</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
        <Tab label="Bài viết" />
        <Tab label="Tướng" />
        <Tab label="Arcana" />
        <Tab label="Trang bị" />
        <Tab label="Bình luận" />
        <Tab label={
          <Badge badgeContent={draftCount} color="error">
            Bản nháp
          </Badge>
        } />
        <Tab label={
          <Badge badgeContent={healthIssueCount} color="error">
            Kiểm tra dữ liệu
          </Badge>
        } />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <AdminPostForm
          editingPost={editingPost}
          onFormSubmit={handlePostFormSubmit}
          onPostUpdated={handlePostUpdated}
        />
        <PostList 
          key={postRefreshTrigger} 
          onEdit={handleEditPost} 
          editingItem={editingPost}
        />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <AdminHeroForm
          editingHero={editingHero}
          onFormSubmit={handleHeroFormSubmit}
        />
        <HeroList 
          key={heroRefreshTrigger} 
          onEdit={handleEditHero} 
          editingItem={editingHero}
        />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <AdminArcanaForm 
          editingArcana={editingArcana} 
          onFormSubmit={handleArcanaFormSubmit} 
        />
        <ArcanaList 
          key={arcanaRefreshTrigger} 
          onEdit={handleEditArcana} 
          editingItem={editingArcana} 
        />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <AdminEquipmentForm
          editingEquipment={editingEquipment}
          onFormSubmit={handleEquipmentFormSubmit}
        />
        <EquipmentList 
          key={equipmentRefreshTrigger} 
          onEdit={handleEditEquipment} 
          editingItem={editingEquipment} 
        />
      </TabPanel>
      <TabPanel value={tab} index={4}>
        <CommentList />
      </TabPanel>
      <TabPanel value={tab} index={5}>
        <DraftChangesPage />
      </TabPanel>
      <TabPanel value={tab} index={6}>
        <DataHealthPage />
      </TabPanel>
    </Container>
  );
};

export default AdminDashboard;