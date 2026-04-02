import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../utils/constants";
import { API_CONFIG } from "@/config/api.config";
import authApi from "./authApi";

// ✅ We'll use a callback pattern instead of direct navigation
let onSessionExpiredCallback: (() => void) | null = null;

export const setSessionExpiredCallback = (callback: () => void) => {
  onSessionExpiredCallback = callback;
};

// ✅ Create client WITHOUT baseURL - we'll set it dynamically
const client: AxiosInstance = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ NEW: Request interceptor to dynamically set baseURL from Firebase Remote Config
client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // ✅ CRITICAL: Always use current BASE_URL from API_CONFIG (updated by Firebase)
      config.baseURL = API_CONFIG.BASE_URL;

      // Add auth token
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        if (!config.headers) {
          config.headers = {} as any;
        }
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log for debugging
      console.log("📡 API Request:", {
        baseURL: config.baseURL,
        url: config.url,
        method: config.method?.toUpperCase(),
      });
    } catch (error) {
      console.error("Error in request interceptor:", error);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - handle 401 errors with queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Function to handle logout and navigation
const handleSessionExpired = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.USER,
    ]);

    console.log("❌ Session expired - clearing storage");

    // ✅ Use callback to trigger logout in app
    if (onSessionExpiredCallback) {
      onSessionExpiredCallback();
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    // 🚫 NEVER handle auth endpoints here
    const isAuthEndpoint =
      url.includes("auth/login") ||
      url.includes("auth/register") ||
      url.includes("auth/google") ||
      url.includes("auth/verify-otp") ||
      url.includes("auth/forgot-password") ||
      url.includes("auth/reset-password") ||
      url.includes("auth/refresh-token");

    console.log("status :>> ", status);
    console.log("isAuthEndpoint :>> ", isAuthEndpoint);

    if (status === 401 && isAuthEndpoint) {
      // ✅ Just forward backend error
      return Promise.reject(error);
    }

    // ⬇️ Handle 401 for protected endpoints
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // ✅ NEW: Rate limit protection (prevents 429 spam)
      if (originalRequest._retryCount >= 2) {
        console.log("🚫 Max refresh attempts exceeded");
        await handleSessionExpired();
        return Promise.reject(
          new Error("Session expired. Please login again.")
        );
      }

      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(
          STORAGE_KEYS.REFRESH_TOKEN
        );

        console.log("🔄 Refresh attempt:", { hasRefreshToken: !!refreshToken });

        if (!refreshToken) {
          console.log("❌ No refresh token - forcing logout");
          throw new Error("No refresh token available");
        }

        console.log("🔄 Attempting to refresh token...");

        const response = await authApi.refreshToken(refreshToken);

        const newAccessToken = response.data.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }

        // ✅ Save new token
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        console.log("✅ Token refreshed successfully");

        // ✅ Process queued requests
        processQueue(null, newAccessToken);

        // ✅ Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(originalRequest);
      } catch (refreshError: any) {
        console.error("❌ Token refresh failed:", refreshError.message);

        // ✅ Clear queue with error
        processQueue(refreshError, null);

        // ✅ Clear storage and logout
        await handleSessionExpired();

        // ✅ Return a clear error
        return Promise.reject(
          new Error("Session expired. Please login again.")
        );
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;