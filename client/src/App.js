import React, { useState, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { LoadingSpinner } from './components/LoadingStates';
import './i18n';
import theme from './theme';

// Lazy load components for better performance
const Home = React.lazy(() => import('./components/Home'));
const Heroes = React.lazy(() => import('./components/Heroes'));
const HeroDetail = React.lazy(() => import('./components/HeroDetail'));
const Equipment = React.lazy(() => import('./pages/Equipment'));
const Arcana = React.lazy(() => import('./pages/Arcana'));
const Meta = React.lazy(() => import('./pages/Meta'));
const News = React.lazy(() => import('./pages/News'));
const PostDetail = React.lazy(() => import('./pages/PostDetail'));
const EditPost = React.lazy(() => import('./pages/EditPost'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const AdminLogin = React.lazy(() => import('./components/AdminLogin'));
const AdminRegister = React.lazy(() => import('./components/AdminRegister'));

function App() {
  const [admin, setAdmin] = useState(!!localStorage.getItem('token'));

  return (
    <ErrorBoundary>
      <ToastProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <Navbar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                py: 0,
                '@media (max-width: 960px)': {
                  paddingTop: '56px'
                }
              }}
            >
              <PageTransition>
                <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/heroes" element={<Heroes />} />
                    <Route path="/heroes/:slug" element={<HeroDetail />} />
                    <Route path="/equipment" element={<Equipment />} />
                    <Route path="/items" element={<Equipment />} /> {/* Redirect for backward compatibility */}
                    <Route path="/arcana" element={<Arcana />} />
                    <Route path="/meta" element={<Meta />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:slug" element={<PostDetail />} />
                    <Route path="/edit-post/:id" element={<EditPost />} />
                    {/* <Route path="/register" element={<AdminRegister />} /> */}
                    <Route
                      path="/admin"
                      element={admin ? <AdminDashboard /> : <AdminLogin onLogin={() => setAdmin(true)} />}
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </PageTransition>
            </Box>
            <Footer />
          </Box>
        </ThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
