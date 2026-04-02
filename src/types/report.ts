export interface WorkTypeBreakdown {
  category: string;
  categoryName: string;
  icon: string;
  color: string;
  entryCount: number;
  totalEarnings: number;
  totals: {
    [key: string]: number;
  };
}

export interface DailyTimeline {
  _id: string;
  totalEarnings: number;
  entryCount: number;
}

export interface WorkTypeInsight {
  _id: string;
  entryCount: number;
  totalEarnings: number;
}

export interface DetailedCategorySummary {
  overview: {
    totalEntries: number;
    totalEarnings: number;
    avgEarningPerEntry: number;
    dateRange: {
      from: string;
      to: string;
    };
  };
  workTypeBreakdown: WorkTypeInsight[];
  fieldInsights: {
    totalPieces?: number;
    totalHours?: number;
    totalMaterialCost?: number;
    netProfit: number;
  };
  dailyTimeline: DailyTimeline[];
}

export interface LastPayment {
  _id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentType: string;
  paidBy: string;
  note?: string;
  userId: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ReportStatistics {
  totalEntries: number;
  totalEarnings: number;
  totalPaid: number;
  pendingBalance: number;
  paymentCount: number;
  lastPayment: LastPayment | null;
  workTypeBreakdown: WorkTypeBreakdown[];
  detailedCategorySummary?: DetailedCategorySummary | null;
}

export interface ApiCategoryBreakdown {
  category: string;
  categoryName: string;
  icon: string;
  color: string;
  entryCount: number;
  totalEarnings: number;
  totals: {
    [key: string]: number;
  };
}

export interface ApiSummary {
  totalWorkRecords: number;
  totalEarnings: number;
  totalPaid: number;
  remainingBalance: number;
  paymentCount: number;
}

export interface ApiReportResponse {
  success: boolean;
  message: string;
  data: {
    summary: ApiSummary;
    categoryBreakdown: ApiCategoryBreakdown[];
    detailedCategorySummary?: DetailedCategorySummary;
    lastPayment: LastPayment | null;
    appliedFilters: {
      startDate: string;
      endDate: string;
      category?: string;
    };
  };
  statusCode: number;
}
