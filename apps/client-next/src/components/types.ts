/**
 * Common types for components
 */

// Basic component props
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Image component props
export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
}

// Link props
export interface LinkProps {
  to: string;
  label: string;
  external?: boolean;
}

// Section underline props
export interface SectionUnderlineProps {
  width?: number;
  color?: string;
  diamond?: boolean;
  style?: React.CSSProperties;
  animated?: boolean;
}

// Navigation link type
export interface NavLink {
  to: string;
  label: string;
  icon?: React.ReactNode;
}
