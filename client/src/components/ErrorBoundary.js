import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { RefreshRounded, HomeRounded, BugReportRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
    resetErrorBoundary();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
          border: '2px solid #ffcdd2'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <BugReportRounded 
            sx={{ 
              fontSize: 80, 
              color: '#f44336',
              mb: 2
            }} 
          />
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              color: '#d32f2f',
              fontWeight: 700
            }}
          >
            Oops! Something went wrong
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            We're sorry for the inconvenience. The page encountered an unexpected error.
          </Typography>
        </Box>

        {isDevelopment && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              textAlign: 'left'
            }}
          >
            <Typography variant="subtitle2" color="error" gutterBottom>
              Error Details (Development Mode):
            </Typography>
            <Typography 
              variant="body2" 
              component="pre"
              sx={{ 
                fontSize: '0.8rem',
                overflow: 'auto',
                maxHeight: 200,
                fontFamily: 'monospace'
              }}
            >
              {error.message}
              {error.stack && `\n\nStack trace:\n${error.stack}`}
            </Typography>
          </Paper>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<RefreshRounded />}
            onClick={resetErrorBoundary}
            sx={{
              background: 'linear-gradient(45deg, #C9A063, #E9C46A)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #B8954F, #D4B55A)',
              }
            }}
          >
            Try Again
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={handleReload}
            sx={{
              borderColor: '#C9A063',
              color: '#C9A063',
              '&:hover': {
                borderColor: '#B8954F',
                backgroundColor: 'rgba(201, 160, 99, 0.1)'
              }
            }}
          >
            Reload Page
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HomeRounded />}
            onClick={handleGoHome}
            sx={{
              borderColor: '#C9A063',
              color: '#C9A063',
              '&:hover': {
                borderColor: '#B8954F',
                backgroundColor: 'rgba(201, 160, 99, 0.1)'
              }
            }}
          >
            Go Home
          </Button>
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mt: 3 }}
        >
          If this problem persists, please contact our support team.
        </Typography>
      </Paper>
    </Container>
  );
};

// Error logging function
const logError = (error, errorInfo) => {
  // In production, send to error tracking service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: errorInfo });
    console.error('Error logged:', error, errorInfo);
  } else {
    console.error('Error caught by boundary:', error, errorInfo);
  }
};

// Main Error Boundary component
const ErrorBoundary = ({ children, fallback, onError }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={(error, errorInfo) => {
        logError(error, errorInfo);
        if (onError) {
          onError(error, errorInfo);
        }
      }}
      onReset={() => {
        // Clear any error state if needed
        window.location.hash = '';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorFallback) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={errorFallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for manually triggering error boundary
export const useErrorHandler = () => {
  return (error) => {
    throw error;
  };
};

export default ErrorBoundary;
