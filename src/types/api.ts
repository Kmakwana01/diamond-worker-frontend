// src/types/api.ts
// ============================================
// UPDATED API TYPES FOR NEW RESPONSE FORMAT
// ============================================

// ======= /work/stats Response =======
export interface WorkTypeSummary {
  _id: string;
  entryCount: number;
  totalPieces: number;
  totalEarnings: number;
}

export type LastPayment = {
  _id: string;
  amount: number;
  note: string;
  paidBy: string;
  paymentMethod: string;
  paymentType: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  userId: string;
};

export interface WorkStatsSummary {
  totalWorkRecords: number;
  totalEarnings: number;
  totalPieces: number;
  totalPaid: number;
  remainingBalance: number;
  paymentCount: number;
}

export interface WorkStatsResponse {
  summary: {
    paymentCount: number;
    remainingBalance: number;
    totalEarnings: number;
    totalPaid: number;
    totalPieces: number;
    totalWorkRecords: number;
  };
  workTypeSummary: {
    _id: string;
    entryCount: number;
    totalEarnings: number;
    totalPieces: number;
  }[];
  lastPayment: {
    _id: string;
    amount: number;
    note: string;
    paidBy: string;
    paymentMethod: string;
    paymentType: string;
    paymentDate: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    userId: string;
  } | null;
}

// ======= /work/entries-with-payments Response =======
export interface WorkEntry {
  _id: string;
  userId: string;
  workType: string;
  pieceCount: number;
  ratePerPiece: number;
  totalEarnings: number;
  remarks?: string;
  workDate: string; // ISO timestamp
  companyId: string | null;
  workDateOnly?: string; // "2025-12-09"
}

export interface PaymentRecord {
  _id: string;
  userId: string;
  amount: number;
  paymentType: "final" | "advance";
  paymentMethod: string;
  note?: string;
  paymentDate: string; // ISO timestamp
  paidBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  paymentDateOnly?: string; // "2025-12-09"
}

export interface DailyBreakdown {
  date: string; // "2025-12-09"
  piecesProduced: number;
  earnedAmount: number; // Total earnings for the day
  advancePaid: number; // Total paid on the day
  remainingBalanceForDate: number; // earnedAmount - advancePaid
  workEntries: WorkEntry[];
  payments: PaymentRecord[];
}

export interface EntriesWithPaymentsData {
  dailyBreakdown: DailyBreakdown[];
  overallSummary: {
    totalEarnings: number;
    totalPaid: number;
    remainingBalance: number;
  };
  metadata: {
    totalDays: number;
    appliedDateRange: {
      startDate: string;
      endDate: string;
    };
  };
}

export interface EntriesWithPaymentsResponse {
  success: boolean;
  message: string;
  data: EntriesWithPaymentsData;
  statusCode: number;
}

export interface DailySummary {
  date: string;
  pieces: number;
  workEntries: any[];
  workEntryTotal: number;
  totalUpad: number;
  payments: any[];
  remainingAmountForDate: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  age?: number;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
    otp?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: Buffer;
}

export interface GoogleAuthData {
  idToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    photo?: string;
  };
}

export interface GoogleAuthResponse {
  idToken: string;
  serverAuthCode?: string;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
  };
}

export interface GoogleLoginPayload {
  idToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    photo?: string | null;
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      photo?: string;
      selectedCategory?: string;
    };
  };
  message?: string;
}
