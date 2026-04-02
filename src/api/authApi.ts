import client from "./client";
import { GoogleLoginPayload, AuthResponse } from "../types/api";
import API_CONFIG from "@/config/api.config";

export const authApi = {
  // Register new user
  register: async (data: any) => {
    return client.post<AuthResponse>(API_CONFIG.ENDPOINTS.REGISTER, data);
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string) => {
    return client.post<AuthResponse>(API_CONFIG.ENDPOINTS.VERIFY_OTP, {
      email,
      otp,
    });
  },

  // Login with email/password
  login: async (credentials: any) => {
    return client.post<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, credentials);
  },

  // Google login
  googleLogin: async (payload: GoogleLoginPayload) => {
    return await client.post<AuthResponse>("auth/google", payload);
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    return client.post(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, { refreshToken });
  },

  // Logout
  logout: async () => {
    return client.post(API_CONFIG.ENDPOINTS.LOGOUT);
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    return client.post(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, { email });
  },

  // Reset password
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    return client.post(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
      email,
      otp,
      newPassword,
    });
  },
};

export default authApi;
