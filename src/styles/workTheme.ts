export const theme = {
  colors: {
    primary: "#6C5CE7",
    secondary: "#A29BFE",
    success: "#00D9A3",
    warning: "#FFB800",
    error: "#FF6B6B",
    background: "#0f1724",
    surface: "rgba(255,255,255,0.06)",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.7)",
    border: "rgba(255,255,255,0.12)",
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radii: { sm: 8, md: 12, lg: 16, xl: 20 },
};

export const WORK_TYPES = ["All", "Cutting", "Polishing", "Other"];
export const QUALITY_GRADES: QualityGrade[] = ["A", "B", "C", "D"];

export type QualityGrade = "A" | "B" | "C" | "D";
