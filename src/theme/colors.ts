export const colors = {
  primary: '#6C5CE7',
  primaryDark: '#5B4CD6',
  primaryLight: '#A29BFE',
  
  secondary: '#00B894',
  secondaryDark: '#00A383',
  
  background: '#0F1724',
  surface: '#1A2332',
  surfaceLight: '#242D3D',
  
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.8)',
    disabled: 'rgba(255, 255, 255, 0.5)',
    inverse: '#000000',
  },
  
  border: {
    light: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.12)',
    dark: 'rgba(255, 255, 255, 0.2)',
  },
  
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  gradient: {
    primary: ['#6C5CE7', '#A29BFE'],
    secondary: ['#00B894', '#55EFC4'],
    dark: ['#0F1724', '#1A2332'],
  },
  
  shadow: {
    color: '#000000',
    opacity: 0.15,
  },
} as const;

export type Colors = typeof colors;
