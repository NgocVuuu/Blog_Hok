import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Container,
  Typography,
  CircularProgress,
  LinearProgress
} from '@mui/material';

// Generic loading spinner
export const LoadingSpinner = ({ 
  size = 40, 
  color = 'primary', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 4
  };

  return (
    <Box sx={containerStyle}>
      <CircularProgress size={size} color={color} />
      {text && (
        <Typography
          variant="body1"
          sx={{
            mt: 2,
            color: '#C9A063',
            fontWeight: 500
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );
};

// Hero card skeleton
export const HeroCardSkeleton = () => (
  <Card sx={{ height: '100%', borderRadius: 3 }}>
    <Box sx={{ p: 2 }}>
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={120} 
        sx={{ borderRadius: 2, mb: 2 }} 
      />
      <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={50} height={20} sx={{ borderRadius: 1 }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton variant="text" width="30%" height={16} />
        <Skeleton variant="text" width="25%" height={16} />
      </Box>
    </Box>
  </Card>
);

// News card skeleton
export const NewsCardSkeleton = () => (
  <Card sx={{ height: '100%', borderRadius: 3 }}>
    <Skeleton 
      variant="rectangular" 
      width="100%" 
      height={200} 
    />
    <CardContent>
      <Skeleton variant="text" width="90%" height={28} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" width="30%" height={16} />
      </Box>
    </CardContent>
  </Card>
);

// Equipment card skeleton
export const EquipmentCardSkeleton = () => (
  <Card sx={{ height: '100%', borderRadius: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      <Skeleton 
        variant="rectangular" 
        width={80} 
        height={80} 
        sx={{ borderRadius: 1 }} 
      />
    </Box>
    <CardContent sx={{ pt: 0 }}>
      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={16} />
    </CardContent>
  </Card>
);

// Table row skeleton
export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} style={{ padding: '16px' }}>
        <Skeleton variant="text" width="80%" height={20} />
      </td>
    ))}
  </tr>
);

// Hero list skeleton
export const HeroListSkeleton = ({ count = 8 }) => (
  <Container maxWidth="lg">
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 2 }} />
    </Box>
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <HeroCardSkeleton />
        </Grid>
      ))}
    </Grid>
  </Container>
);

// News list skeleton
export const NewsListSkeleton = ({ count = 6 }) => (
  <Container maxWidth="lg">
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" width={250} height={40} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Skeleton variant="rectangular" width={200} height={56} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width={150} height={56} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width={120} height={56} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <NewsCardSkeleton />
        </Grid>
      ))}
    </Grid>
  </Container>
);

// Equipment list skeleton
export const EquipmentListSkeleton = ({ count = 12 }) => (
  <Container maxWidth="lg">
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Skeleton variant="rectangular" width={200} height={56} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width={150} height={56} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
          <EquipmentCardSkeleton />
        </Grid>
      ))}
    </Grid>
  </Container>
);

// Hero detail skeleton
export const HeroDetailSkeleton = () => (
  <Container maxWidth="lg">
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={60} height={24} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
          <Skeleton variant="rectangular" width={200} height={200} sx={{ borderRadius: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 1 }} />
            </Box>
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={4} key={index}>
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="80%" height={16} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>

      {/* Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
        </Grid>
      </Grid>
    </Box>
  </Container>
);

// Progress bar for loading states
export const LoadingProgress = ({ value, text }) => (
  <Box sx={{ width: '100%', mb: 2 }}>
    {text && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {text}
      </Typography>
    )}
    <LinearProgress 
      variant={value !== undefined ? "determinate" : "indeterminate"} 
      value={value}
      sx={{
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(201, 160, 99, 0.2)',
        '& .MuiLinearProgress-bar': {
          backgroundColor: '#C9A063',
          borderRadius: 4,
        }
      }}
    />
  </Box>
);

// Compact loading indicator
export const InlineLoader = ({ size = 16 }) => (
  <CircularProgress 
    size={size} 
    sx={{ 
      color: '#C9A063',
      ml: 1 
    }} 
  />
);

const LoadingStates = {
  LoadingSpinner,
  HeroCardSkeleton,
  NewsCardSkeleton,
  EquipmentCardSkeleton,
  TableRowSkeleton,
  HeroListSkeleton,
  NewsListSkeleton,
  EquipmentListSkeleton,
  HeroDetailSkeleton,
  LoadingProgress,
  InlineLoader
};

export default LoadingStates;
