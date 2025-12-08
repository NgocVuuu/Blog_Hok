import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Box, Skeleton, Typography } from '@mui/material';

const LazyImage = ({
  src,
  alt,
  width,
  height,
  style = {},
  sx = {},
  component = 'img',
  skeletonVariant = 'rectangular',
  priority = false,
  rootMargin = '300px 0px',
  threshold = 0,
  // common img attributes we may need to forward
  referrerPolicy,
  crossOrigin,
  decoding,
  sizes,
  srcSet,
  draggable,
  loading: loadingProp,
  ...containerProps
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Detect absolute fill mode (e.g., sx: { position:'absolute', inset:0 })
  const isFill = !!(sx && (sx.position === 'absolute' || sx.position === 'fixed') && (
    typeof sx.inset !== 'undefined' || (typeof sx.top !== 'undefined' && typeof sx.bottom !== 'undefined')
  ));

  // Determine whether an explicit height is provided (exclude 'auto') or we're filling
  const hasExplicitHeight = (
    isFill ||
    (typeof height !== 'undefined' && height !== null && height !== 'auto') ||
    (sx && typeof sx.height !== 'undefined' && sx.height !== 'auto')
  );

  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true,
    // If no explicit height is given, render immediately to avoid zero-height observer issues
    initialInView: priority || !hasExplicitHeight
  });

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const imageStyle = {
    ...style,
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    // Keep mounted to avoid layout glitches; fade via opacity
    display: 'block',
    width: '100%',
    height: hasExplicitHeight ? '100%' : 'auto',
    willChange: 'opacity'
  };

  return (
    <Box 
      ref={ref} 
      sx={{ 
        position: 'relative', 
        width: width || '100%', 
        height: isFill ? '100%' : (height || 'auto'),
        ...sx 
      }}
      {...containerProps}
    >
      {/* Skeleton loader */}
  {!loaded && inView && (
        <Skeleton
          variant={skeletonVariant}
          width={typeof width === 'object' ? '100%' : (width || '100%')}
          height={
            isFill ? '100%' : (
              typeof height === 'number' ? height :
              (typeof height === 'string' ? (height === 'auto' ? 200 : height) : 200)
            )
          }
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: sx.borderRadius || 0
          }}
        />
      )}
      
      {/* Actual image */}
      {inView && (
        <Box
          component={component}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={imageStyle}
          loading={loadingProp || 'lazy'}
          referrerPolicy={referrerPolicy}
          crossOrigin={crossOrigin}
          decoding={decoding}
          sizes={sizes}
          srcSet={srcSet}
          draggable={draggable}
          sx={{
            width: '100%',
            height: hasExplicitHeight ? '100%' : 'auto',
            objectFit: sx.objectFit || 'cover',
            borderRadius: sx.borderRadius || 0,
            display: 'block',
            ...sx
          }}
        />
      )}

      {/* Error state */}
      {error && (
        <Box
          sx={{
            width: '100%',
            height: height || 200,
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: sx.borderRadius || 0,
            color: 'text.secondary'
          }}
        >
          <Typography variant="caption">
            Không thể tải ảnh
          </Typography>
        </Box>
      )}
      
      {/* Error fallback */}
      {error && loaded && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#999',
            fontSize: '0.8rem'
          }}
        >
          Không thể tải ảnh
        </Box>
      )}
    </Box>
  );
};

export default LazyImage;
