export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// src/theme/colors.ts
export const colors = {
  primary: "#6C5CE7",
  primaryDark: "#5B4CD6",
  primaryLight: "#A29BFE",

  secondary: "#00B894",
  secondaryDark: "#00A383",

  background: "#0F1724",
  surface: "#1A2332",
  surfaceLight: "#242D3D",

  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.8)",
    disabled: "rgba(255, 255, 255, 0.5)",
    inverse: "#000000",
  },

  border: {
    light: "rgba(255, 255, 255, 0.08)",
    medium: "rgba(255, 255, 255, 0.12)",
    dark: "rgba(255, 255, 255, 0.2)",
  },

  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },

  gradient: {
    primary: ["#6C5CE7", "#A29BFE"],
    secondary: ["#00B894", "#55EFC4"],
    dark: ["#0F1724", "#1A2332"],
  },

  shadow: {
    color: "#000000",
    opacity: 0.15,
  },
} as const;

export type Colors = typeof colors;
