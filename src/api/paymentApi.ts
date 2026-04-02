import API_CONFIG from "@/config/api.config";
import client from "./client";

interface PaymentQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  paymentType?: string;
}

export const paymentApi = {
  getPayments: async (params?: PaymentQueryParams) => {
    return client.get<{
      payments: any[];
      totalPages: number;
      currentPage: number;
    }>(API_CONFIG.ENDPOINTS.PAYMENTS, { params });
  },

  createPayment: async (data: Partial<any>) => {
    return client.post<{ payment: any }>(API_CONFIG.ENDPOINTS.PAYMENTS, data);
  },

  deletePayment: async (id: string) => {
    return client.delete(API_CONFIG.ENDPOINTS.PAYMENTS + `/${id}`);
  },

  getBalance: async (params?: { category?: string }) => {
    return client.get<any>(API_CONFIG.ENDPOINTS.PAYMENT_BALANCE, {
      params,
    });
  },

  getTransactions: async (params: any) => {
    return client.get(API_CONFIG.ENDPOINTS.PAYMENT_TRANSACTIONS, { params });
  },
};

export default paymentApi;
