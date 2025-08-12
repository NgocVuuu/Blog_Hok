import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import LoginModal from './components/LoginModal';
import { useAuth } from './contexts/AuthContext';
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
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Contact = React.lazy(() => import('./pages/Contact'));

const AdminGate = ({ openLogin }) => {
  React.useEffect(() => {
    openLogin();
  }, [openLogin]);
  return null; // Nothing rendered; modal will appear
};

function App() {
  const { isAuthenticated, openLogin } = useAuth();

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
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/edit-post/:id" element={<EditPost />} />
                    {/* <Route path="/register" element={<AdminRegister />} /> */}
                    {process.env.NODE_ENV !== 'production' && (
                      <Route path="/admin" element={isAuthenticated ? <AdminDashboard /> : <AdminGate openLogin={openLogin} />} />
                    )}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </PageTransition>
            </Box>
            <Footer />
          </Box>
        </ThemeProvider>
      </ToastProvider>
      <LoginModal />
    </ErrorBoundary>
  );
}

export default App;
