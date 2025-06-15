import React from 'react';

export default function GoldenLine({ width = 80, height = 4, color = '#C9A063', style = {} }) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style}>
      <rect x="0" y={height/2-1} width={width} height="2" rx="1" fill={color} />
    </svg>
  );
} 