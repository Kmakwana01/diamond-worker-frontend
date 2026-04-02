// src/hooks/useReportData.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { reportApi } from "../api/reportApi";
import { ReportStatistics } from "../types/report";
import Toast from "react-native-toast-message";

interface UseReportDataReturn {
  statistics: ReportStatistics | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchStatistics: (
    startDate?: string,
    endDate?: string,
    category?: string
  ) => Promise<void>;
  refresh: () => void;
}

export const useReportData = (): UseReportDataReturn => {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchStatistics = useCallback(
    async (startDate?: string, endDate?: string, category?: string) => {
      try {
        setError(null);
        setLoading(true);

        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (category) params.category = category;

        console.log("📊 Fetching statistics with params:", params);

        const response = await reportApi.getStatistics(params);

        if (!mountedRef.current) return;

        console.log(
          "📊 Raw API response:",
          JSON.stringify(response.data, null, 2)
        );

        // Check if response has data
        if (response.data?.success && response.data?.data) {
          const apiData = response.data.data;

          console.log("✅ API Data received:", {
            summary: apiData.summary,
            categoryBreakdownLength: apiData.categoryBreakdown?.length,
            hasDetailedSummary: !!apiData.detailedCategorySummary,
          });

          // Single category data from categoryBreakdown array (index 0)
          const singleCategory = apiData.categoryBreakdown?.[0];

          if (!singleCategory) {
            console.warn("⚠️ No category breakdown data found");
            setStatistics(null);
            Toast.show({
              type: "info",
              text1: t("reports.noData"),
              text2: t("reports.noDataForPeriod"),
            });
            return;
          }

          const transformedData: ReportStatistics = {
            totalEntries: apiData.summary?.totalWorkRecords || 0,
            totalEarnings: apiData.summary?.totalEarnings || 0,
            totalPaid: apiData.summary?.totalPaid || 0,
            pendingBalance: apiData.summary?.remainingBalance || 0,
            paymentCount: apiData.summary?.paymentCount || 0,
            lastPayment: apiData.lastPayment || null,
            // Only single category
            workTypeBreakdown: [
              {
                category: singleCategory.category,
                categoryName: singleCategory.categoryName,
                icon: singleCategory.icon,
                color: singleCategory.color,
                entryCount: singleCategory.entryCount,
                totalEarnings: singleCategory.totalEarnings,
                totals: singleCategory.totals || {},
              },
            ],
            // Add detailed category summary for work type breakdown
            detailedCategorySummary: apiData.detailedCategorySummary || null,
          };

          console.log(
            "✅ Transformed statistics:",
            JSON.stringify(transformedData, null, 2)
          );
          setStatistics(transformedData);
        } else {
          console.log("❌ No data in response or invalid structure");
          setStatistics(null);
          Toast.show({
            type: "info",
            text1: t("reports.noData"),
            text2: t("reports.noDataForPeriod"),
          });
        }
      } catch (err: any) {
        console.error("❌ Fetch statistics error:", err);
        if (!mountedRef.current) return;

        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          t("reports.loadFailed");
        setError(errorMessage);

        Toast.show({
          type: "error",
          text1: t("reports.loadFailed"),
          text2: errorMessage,
        });
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [t]
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  return {
    statistics,
    loading,
    refreshing,
    error,
    fetchStatistics,
    refresh,
  };
};
