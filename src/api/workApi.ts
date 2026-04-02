// src/api/workApi.ts
import client from "./client";
import API_CONFIG from "@/config/api.config";
import { WorkEntry, WorkStatsResponse } from "../types/api";

interface WorkQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  sortOrder?: "asc" | "desc";
}

export const workApi = {
  // 📋 Get all work entries
  getWorkEntries: async (params?: WorkQueryParams) => {
    return client.get<{
      workEntries: WorkEntry[];
      totalPages: number;
      currentPage: number;
    }>(API_CONFIG.ENDPOINTS.WORK, { params });
  },

  // 🔍 Get single work entry
  getWorkEntry: async (id: string) => {
    return client.get<{ workEntry: WorkEntry }>(
      API_CONFIG.ENDPOINTS.WORK_BY_ID.replace(":id", id)
    );
  },

  // ➕ Create work entry
  createWorkEntry: async (data: Partial<WorkEntry>) => {
    return client.post<{ workEntry: WorkEntry }>(
      API_CONFIG.ENDPOINTS.WORK,
      data
    );
  },

  // ✏️ Update work entry
  updateWorkEntry: async (id: string, data: Partial<WorkEntry>) => {
    return client.put<{ workEntry: WorkEntry }>(
      API_CONFIG.ENDPOINTS.WORK_BY_ID.replace(":id", id),
      data
    );
  },

  // 🗑 Delete work entry
  deleteWorkEntry: async (id: string) => {
    return client.delete(API_CONFIG.ENDPOINTS.WORK_BY_ID.replace(":id", id));
  },

  // 📊 Work statistics
  getWorkStats: async (params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }) => {
    return client.get<WorkStatsResponse>(API_CONFIG.ENDPOINTS.WORK_STATS, {
      params,
    });
  },

  // 💰 Work entries with payment info
  getEntriesWithPayments: async (params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }) => {
    return client.get(API_CONFIG.ENDPOINTS.WORK_WITH_PAYMENTS, { params });
  },
};

export default workApi;
