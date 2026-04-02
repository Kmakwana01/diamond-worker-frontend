export const WORK_TYPES = [
  { label: "Cutting", value: "cutting" },
  { label: "Polishing", value: "polishing" },
  { label: "Other", value: "other" },
] as const;

export const PAYMENT_TYPES = [
  { label: "Advance", value: "advance" },
  { label: "Final", value: "final" },
  { label: "Bonus", value: "bonus" },
] as const;

export const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Bank Transfer", value: "bank" },
  { label: "UPI", value: "upi" },
  { label: "Cheque", value: "cheque" },
] as const;

export const LANGUAGES = [
  { label: "English", value: "en", flag: "EN" },
  { label: "हिंदी", value: "hi", flag: "HI" },
  { label: "ગુજરાતી", value: "gu", flag: "GU" },
];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "@worker_app:accessToken",
  REFRESH_TOKEN: "@worker_app:refreshToken",
  USER: "@worker_app:user",
  LANGUAGE: "@worker_app:language",
  THEME: "@worker_app:theme",
  SELECTED_CATEGORY: "@selected_category", // ADD THIS
  USER_CATEGORIES: "userCategories",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
} as const;

export const DATE_FORMATS = {
  DISPLAY: "DD MMM YYYY",
  API: "YYYY-MM-DD",
  DATETIME: "DD MMM YYYY, hh:mm A",
} as const;

// ADD THESE
export const CATEGORY_ICONS: Record<string, string> = {
  DIAMOND: "diamond-stone",
  PLUMBER: "pipe-wrench",
  CARPENTER: "hammer-screwdriver",
  MASON: "wall",
};

export const CATEGORY_COLORS: Record<string, string> = {
  DIAMOND: "#3B82F6",
  PLUMBER: "#10B981",
  CARPENTER: "#F59E0B",
  MASON: "#EF4444",
};
