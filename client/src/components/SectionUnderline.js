import React from 'react';

export default function SectionUnderline({
  width = 80,
  color = '#C9A063',
  diamond = true,
  style = {},
  animated = false
}) {
  const extraLength = 20; // thêm độ dài đường kẻ
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
      {/* Đường kẻ dài hơn */}
      <rect
        x="0"
        y={lineY}
        width={fullWidth}
        height={lineHeight}
        rx={lineHeight / 2}
        fill={color}
      />
      {/* Hình thoi hoặc tam giác nhỏ ở chính giữa phần width gốc */}
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
          points={`
            ${extraLength / 2 + width / 2 - shapeSize / 2},${lineY}
            ${extraLength / 2 + width / 2 + shapeSize / 2},${lineY}
            ${extraLength / 2 + width / 2},${lineY - shapeSize}
          `}
          fill={color}
        />
      )}
    </svg>
  );
}
