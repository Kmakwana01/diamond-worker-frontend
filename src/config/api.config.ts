// src/config/api.config.ts

/* ───────────────────────────────────────────── */
/* ⚠️ IMPORTANT: BASE_URL will be overridden by Firebase Remote Config */
/* ───────────────────────────────────────────── */

export const API_TIMEOUT = 15000;

// ✅ Mutable config object that Firebase can update
export const API_CONFIG = {
  BASE_URL: "http://localhost:8085/api/v1/",
  TIMEOUT: API_TIMEOUT,

  ENDPOINTS: {
    // 🔐 Auth
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    VERIFY_OTP: "/auth/verify-otp",
    GOOGLE_LOGIN: "/auth/google",
    REFRESH_TOKEN: "/auth/refresh-token",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",

    // 👤 Profile
    GET_PROFILE: "/profile",
    UPDATE_PROFILE: "/profile",
    DELETE_ACCOUNT: "/profile",

    // 🛠 Work (✅ FULL)
    WORK: "/work",
    WORK_BY_ID: "/work/:id",
    WORK_STATS: "/work/stats",
    WORK_WITH_PAYMENTS: "/work/entries-with-payments",

    // 💰 Payments
    PAYMENTS: "/payments",
    PAYMENT_BALANCE: "/payments/balance",
    PAYMENT_TRANSACTIONS: "/payment/transactions",

    // 📊 Reports
    DAILY_REPORT: "/reports/daily",
    MONTHLY_REPORT: "/reports/monthly",
    EXPORT_DATA: "/reports/export",
  },

  // 🔑 Google OAuth (will be replaced by Remote Config)
  GOOGLE_WEB_CLIENT_ID:
    "689727330976-k88f12dluq5k6q0kdjgvk0pelacnrsp1.apps.googleusercontent.com",
};

// ✅ Default export for backward compatibility
export default API_CONFIG;