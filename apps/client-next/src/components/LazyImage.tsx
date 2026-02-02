'use client';
import React, { useMemo } from 'react';
import { Box } from '@mui/material';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  sx?: any;
  style?: React.CSSProperties;
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, width, height, sx, style, referrerPolicy }) => {
  // Memoize merged styles to ensure consistency between server and client
  const mergedSx = useMemo(() => ({
    width: width || '100%',
    height: height || 'auto',
    display: 'block',
    ...sx
  }), [width, height, sx]);

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy={referrerPolicy}
      style={style}
      sx={mergedSx}
    />
  );
};

export default LazyImage;
