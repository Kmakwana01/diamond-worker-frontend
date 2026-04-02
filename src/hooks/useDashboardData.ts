import { useCallback, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { workApi } from "../api/workApi";
import { getCategoryStatsConfig } from "../config/categoryStatsConfig";
import { getCurrentMonthDateRange } from "@/utils/helpers";

export type CategoryBreakdown = {
  category: string;
  categoryName: string;
  icon: string;
  color: string;
  entryCount: number;
  totalEarnings: number;
  totals: {
    pieceCount?: number;
    itemsProduced?: number;
    jobsCompleted?: number;
    daysWorked?: number;
    ratePerPiece?: number;
    ratePerItem?: number;
    ratePerJob?: number;
    dayWage?: number;
    [key: string]: any; // Allow dynamic fields
  };
};

export type Summary = {
  totalEarnings: number;
  totalPaid: number;
  remainingBalance: number;
  paymentCount: number;
  totalWorkRecords: number;
};

export type LastPayment = {
  _id: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  paymentDate: string;
  note?: string;
  paidBy?: string;
} | null;

export type DashboardStats = {
  summary: Summary;
  categoryBreakdown: CategoryBreakdown[];
  lastPayment: LastPayment;
  appliedFilters?: {
    category?: string;
  };
  // Dynamic fields based on category
  totalEntries: number;
  totalQuantity: number; // Generic quantity (pieces/items/days/jobs)
  avgEarnings: number;
  quantityLabel: string; // Dynamic label (Pieces/Items/Days/Jobs)
  avgQuantityPerEntry: number;
};

export const useDashboardData = () => {
  const { selectedCategory } = useSelector(
    (state: RootState) => state.category
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    try {
      console.log("📊 Fetching dashboard data for category:", selectedCategory);

      if (!selectedCategory) {
        setStats(null);
        return;
      }

      // Fetch work stats with selected category
      const { startDate, endDate } = getCurrentMonthDateRange();

      const params = {
        category: selectedCategory,
        startDate,
        endDate,
      };

      const res = await workApi.getWorkStats(params);

      if (!mountedRef.current) return;

      const apiData = res?.data?.data;
      console.log("✅ API Response:", apiData);

      // Get category-specific configuration
      const categoryConfig = getCategoryStatsConfig(selectedCategory);
      const quantityLabel =
        categoryConfig.fields[
          categoryConfig.quantityField as keyof typeof categoryConfig.fields
        ]?.labelKey || "";
      console.log("📋 Category Config:", categoryConfig);

      // Calculate totals from categoryBreakdown
      const totalEntries = apiData?.summary?.totalWorkRecords || 0;

      // Get quantity dynamically based on category
      const totalQuantity =
        apiData?.categoryBreakdown?.reduce(
          (sum: number, cat: CategoryBreakdown) => {
            const quantityField = categoryConfig.quantityField;
            const quantity = cat.totals?.[quantityField] || 0;
            console.log(`📊 ${cat.category}: ${quantityField} = ${quantity}`);
            return sum + quantity;
          },
          0
        ) || 0;

      const totalEarnings = apiData?.summary?.totalEarnings || 0;
      const avgEarnings = totalEntries > 0 ? totalEarnings / totalEntries : 0;
      const avgQuantityPerEntry =
        totalEntries > 0 ? totalQuantity / totalEntries : 0;

      console.log("📊 Calculated Stats:", {
        totalEntries,
        totalQuantity,
        quantityLabel,
        avgEarnings: avgEarnings.toFixed(2),
        avgQuantityPerEntry: avgQuantityPerEntry.toFixed(2),
      });

      // Map API response to dashboard stats
      const dashboardData: DashboardStats = {
        summary: apiData?.summary || {
          totalEarnings: 0,
          totalPaid: 0,
          remainingBalance: 0,
          paymentCount: 0,
          totalWorkRecords: 0,
        },
        categoryBreakdown: apiData?.categoryBreakdown || [],
        lastPayment: apiData?.lastPayment || null,
        appliedFilters: apiData?.appliedFilters || {},
        // Dynamic calculated fields
        totalEntries,
        totalQuantity,
        avgEarnings,
        quantityLabel,
        avgQuantityPerEntry,
      };

      setStats(dashboardData);
    } catch (err: any) {
      console.error("❌ Dashboard fetch failed:", err.message || err);
      setStats(null);
    }
  }, [selectedCategory]);

  useEffect(() => {
    mountedRef.current = true;

    if (selectedCategory) {
      fetchAll().finally(() => {
        if (mountedRef.current) {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchAll, selectedCategory]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [fetchAll]);

  return { stats, loading, refreshing, refresh };
};
