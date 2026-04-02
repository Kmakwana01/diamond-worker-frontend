export interface PaymentRequest {
  amount: number;
  paymentType: 'advance' | 'final' | 'bonus';
  note?: string;
  requestedAt?: string;
}

export interface Payment {
  _id: string;
  amount: number;
  paymentType: 'advance' | 'final' | 'bonus';
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  note?: string;
  requestedAt: string;
  approvedAt?: string;
  paidAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface PaymentListResponse {
  success: boolean;
  message: string;
  data: {
    payments: Payment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
    };
  };
}

export interface Balance {
  pendingBalance: number;
  totalEarnings: number;
  totalPaid: number;
  totalRequested: number;
  totalPending: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'paid';
  paymentType?: 'advance' | 'final' | 'bonus';
  startDate?: string;
  endDate?: string;
  sortBy?: 'requestedAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentStats {
  totalRequested: number;
  totalApproved: number;
  totalPaid: number;
  totalRejected: number;
  averageAmount: number;
  pendingRequests: number;
}
