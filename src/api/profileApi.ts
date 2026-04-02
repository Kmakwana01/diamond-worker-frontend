import client from "./client";
import { User } from "../types/api";
import API_CONFIG from "@/config/api.config";

export const profileApi = {
  getProfile: async () => {
    return client.get<{ user: User; stats: any }>(API_CONFIG.ENDPOINTS.GET_PROFILE);
  },

  updateProfile: async (formData: FormData) => {
    return client.put(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data) => data,
    });
  },

  deleteAccount: async () => {
    return client.delete(API_CONFIG.ENDPOINTS.DELETE_ACCOUNT);
  },
};

export default profileApi;
