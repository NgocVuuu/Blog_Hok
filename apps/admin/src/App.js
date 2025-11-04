import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import LoginModal from './components/LoginModal';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { LoadingSpinner } from './components/LoadingStates';
import theme from './theme';

// Only keep admin routes in the legacy CRA app. Public site has been migrated to Next.js (`client-next`).
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const EditPost = React.lazy(() => import('./pages/EditPost'));

// Inline fallback components to avoid importing public-site components which were moved to Next.js
function AdminLandingFallback() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Public site moved</h2>
      <p>The public-facing site has been migrated to the Next.js app. This CRA instance contains the admin UI only.</p>
    </div>
  );
}

function NotFoundFallback() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404 — Not Found</h2>
      <p>The page does not exist in this admin app.</p>
    </div>
  );
}

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
              <Suspense fallback={<LoadingSpinner fullScreen text="Loading..." />}>
                <Routes>
                  {/* Root explains public site moved; admin routes kept */}
                  <Route path="/" element={<AdminLandingFallback />} />
                  <Route path="/edit-post/:id" element={<EditPost />} />
                  {process.env.NODE_ENV !== 'production' && (
                    <Route path="/admin" element={isAuthenticated ? <AdminDashboard /> : <AdminGate openLogin={openLogin} />} />
                  )}
                  <Route path="*" element={<NotFoundFallback />} />
                </Routes>
              </Suspense>
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
