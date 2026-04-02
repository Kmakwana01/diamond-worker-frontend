import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { workApi } from "../api/workApi";
import Toast from "react-native-toast-message";
import { getCategoryStatsConfig } from "../config/categoryStatsConfig";
import { formatDateLocal } from "@/utils/helpers";

export type WorkDataWithPayments = {
  dailyBreakdown: any[];
  overallSummary: {
    totalEarnings: number;
    totalPaid: number;
    remainingBalance: number;
  };
  metadata: any;
  // Dynamic fields based on category
  totalEntries: number;
  totalQuantity: number;
  avgEarnings: number;
  quantityLabel: string;
  avgQuantityPerEntry: number;
};

export const useWorkDataWithPayments = () => {
  const { selectedCategory } = useSelector(
    (state: RootState) => state.category
  );

  const [data, setData] = useState<WorkDataWithPayments | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const mountedRef = useRef(true);

  const fetchData = useCallback(
    async (month: Date) => {
      if (!selectedCategory) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const res = await workApi.getEntriesWithPayments({
          startDate: formatDateLocal(startDate),
          endDate: formatDateLocal(endDate),
          category: selectedCategory,
        });

        if (!mountedRef.current) return;

        const apiData = res.data.data;

        // Get category-specific configuration
        const categoryConfig = getCategoryStatsConfig(selectedCategory);

        // Calculate dynamic stats from dailyBreakdown
        const totalEntries =
          apiData?.dailyBreakdown?.reduce(
            (sum: number, day: any) => sum + (day.workEntries?.length || 0),
            0
          ) || 0;

        // Get quantity dynamically based on category
        const totalQuantity =
          apiData?.dailyBreakdown?.reduce((sum: number, day: any) => {
            const dayQuantity =
              day.workEntries?.reduce((daySum: number, entry: any) => {
                const quantityField = categoryConfig.quantityField;
                const quantity = entry.categoryFields?.[quantityField] || 0;
                return daySum + quantity;
              }, 0) || 0;
            return sum + dayQuantity;
          }, 0) || 0;

        const totalEarnings = apiData?.overallSummary?.totalEarnings || 0;
        const avgEarnings = totalEntries > 0 ? totalEarnings / totalEntries : 0;
        const avgQuantityPerEntry =
          totalEntries > 0 ? totalQuantity / totalEntries : 0;

        // Map API response to work data with dynamic fields
        const workData: WorkDataWithPayments = {
          dailyBreakdown: apiData?.dailyBreakdown || [],
          overallSummary: apiData?.overallSummary || {
            totalEarnings: 0,
            totalPaid: 0,
            remainingBalance: 0,
          },
          metadata: apiData?.metadata || {},
          // Dynamic calculated fields
          totalEntries,
          totalQuantity,
          avgEarnings,
          quantityLabel: categoryConfig.quantityLabel,
          avgQuantityPerEntry,
        };

        setData(workData);
      } catch (e: any) {
        if (!mountedRef.current) return;
        const msg = e?.response?.data?.message ?? "Failed to load";
        Toast.show({ type: "error", text1: "Error", text2: msg });
        setData(null);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [selectedCategory]
  );

  useEffect(() => {
    mountedRef.current = true;
    if (selectedCategory) {
      fetchData(selectedMonth);
    } else {
      setLoading(false);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [selectedMonth, fetchData, selectedCategory]);

  const changeMonth = useCallback((date: Date) => {
    setSelectedMonth(date);
  }, []);

  const refresh = useCallback(() => {
    fetchData(selectedMonth);
  }, [fetchData, selectedMonth]);

  return {
    data,
    loading,
    selectedMonth,
    selectedCategory,
    changeMonth,
    refresh,
  };
};
