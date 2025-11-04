"use client";
import React from 'react';
import Box from '@mui/material/Box';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  sx?: any;
  width?: string | number;
  height?: string | number;
};

export default function LazyImage({ src, alt, width, height, style, sx, ...rest }: Props) {
  const styleObj: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width || '100%',
    height: typeof height === 'number' ? `${height}px` : height || 'auto',
    objectFit: 'cover',
    display: 'block',
    ...style
  };

  return (
    <Box component="span" sx={{ display: 'block', ...sx }}>
      <img loading="lazy" src={src} alt={alt} style={styleObj} {...rest} />
    </Box>
  );
}
