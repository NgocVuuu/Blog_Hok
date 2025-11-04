import React from 'react';

export default function SectionUnderline({
  width = 80,
  color = '#C9A063',
  diamond = true,
  style = {},
  animated = false
}:{width?:number;color?:string;diamond?:boolean;style?:React.CSSProperties;animated?:boolean}) {
  const extraLength = 20;
  const fullWidth = width + extraLength;
  const lineHeight = 1.2;
  const lineY = 6;
  const shapeSize = 4;

  return (
    <svg
      width={fullWidth}
      height="8"
      style={{
        ...style,
        transition: animated ? 'all 0.3s ease' : 'none',
        transform: animated ? 'scaleX(0)' : 'scaleX(1)',
        transformOrigin: 'center'
      }}
    >
      <rect x={0} y={lineY} width={fullWidth} height={lineHeight} rx={lineHeight / 2} fill={color} />
      {diamond ? (
        <rect
          x={extraLength / 2 + width / 2 - shapeSize / 2}
          y={lineY - shapeSize / 2}
          width={shapeSize}
          height={shapeSize}
          fill={color}
          transform={`rotate(45 ${extraLength / 2 + width / 2} ${lineY})`}
        />
      ) : (
        <polygon
          points={
            `${extraLength / 2 + width / 2 - shapeSize / 2},${lineY} ${extraLength / 2 + width / 2 + shapeSize / 2},${lineY} ${extraLength / 2 + width / 2},${lineY - shapeSize}`
          }
          fill={color}
        />
      )}
    </svg>
  );
}
