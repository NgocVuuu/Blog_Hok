import React from 'react';

export default function Diamond({ size = 16, color = '#C9A063', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={style}>
      <rect x="4" y="0" width="8" height="8" fill={color} transform="rotate(45 8 8)" />
    </svg>
  );
} 