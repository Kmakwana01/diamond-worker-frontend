// src/api/reportApi.ts
import client from "./client";
import { ApiReportResponse } from "../types/report";
import API_CONFIG from "@/config/api.config";

interface StatsParams {
  startDate?: string;
  endDate?: string;
  category?: string;
}

export const reportApi = {
  getStatistics: (params?: StatsParams) => {
    return client.get<ApiReportResponse>(API_CONFIG.ENDPOINTS.WORK_STATS, { params });
  },
};