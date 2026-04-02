import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { theme } from "../../styles/workTheme";
import { useReportData } from "../../hooks/useReportData";
import { useReportExport } from "../../hooks/useReportExport";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  DateRangeModal,
  FilterChips,
  WorkDistributionChart,
  EarningsTrendChart,
  FilterType,
} from "../../components/reports";
import { formatDateLocal } from "@/utils/helpers";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const getDateRangeForFilter = (filter: FilterType) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (filter) {
    case "daily":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;

    case "weekly": {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - diff
      );
      endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + 6
      );
      break;
    }

    case "monthly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;

    case "yearly":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;

    case "custom":
      return null;
  }

  return {
    startDate: formatDateLocal(startDate),
    endDate: formatDateLocal(endDate),
  };
};

const KeyStatisticsCard: React.FC<{
  statistics: any;
  dateRange: { startDate: string; endDate: string };
}> = ({ statistics, dateRange }) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const totalDays = useMemo(() => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [dateRange]);

  const totalEntries =
    statistics.detailedCategorySummary?.overview?.totalEntries ||
    statistics.totalEntries ||
    0;
  const totalEarnings =
    statistics.detailedCategorySummary?.overview?.totalEarnings ||
    statistics.totalEarnings ||
    0;

  const avgAmountPerDay = totalEarnings / totalDays || 0;
  const avgEntriesPerDay = totalEntries / totalDays || 0;

  const statItems = [
    {
      icon: "calendar-today",
      label: t("reports.statistics.dailyAvg"),
      value: `${avgEntriesPerDay.toFixed(1)} ${t(
        "reports.statistics.entries"
      )}`,
      subValue: `₹${avgAmountPerDay.toFixed(1)}`,
      color: "#6C5CE7",
    },
    {
      icon: "briefcase",
      label: t("reports.statistics.totalEntries"),
      value: `${totalEntries}`,
      subValue: `₹${totalEarnings.toLocaleString("en-IN")}`,
      color: "#00D9A3",
    },
    {
      icon: "calendar-range",
      label: t("reports.statistics.period"),
      value: `${totalDays} ${t("reports.statistics.days")}`,
      color: "#FFB800",
    },
  ];

  return (
    <View style={statsStyles.container}>
      <View style={statsStyles.grid}>
        {statItems.map((item, index) => (
          <LinearGradient
            key={index}
            colors={[`${item.color}25`, `${item.color}08`]}
            style={[statsStyles.statCard, { width: (width - scale(32) - 24) / 3 }]}
          >
            <View
              style={[
                statsStyles.iconContainer,
                { backgroundColor: item.color },
              ]}
            >
              <Icon name={item.icon} size={moderateScale(20)} color="#fff" />
            </View>

            <Text style={statsStyles.statValue}>{item.value}</Text>

            {item.subValue && (
              <Text style={statsStyles.statSubValue}>{item.subValue}</Text>
            )}

            <Text style={statsStyles.statLabel}>{item.label}</Text>
          </LinearGradient>
        ))}
      </View>
    </View>
  );
};

const FinancialSummary: React.FC<{
  totalEarnings: number;
  remainingBalance: number;
}> = ({ totalEarnings, remainingBalance }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.summaryContainer}>
      <LinearGradient
        colors={["rgba(108, 92, 231, 0.15)", "rgba(108, 92, 231, 0.05)"]}
        style={styles.summaryCard}
      >
        <View style={styles.summaryContent}>
          <Icon name="currency-inr" size={moderateScale(24)} color="#6C5CE7" />
          <View style={styles.summaryTextContent}>
            <Text style={styles.summaryLabel}>
              {t("reports.financial.totalEarnings")}
            </Text>
            <Text style={styles.summaryValue}>
              ₹{totalEarnings.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={
          remainingBalance > 0
            ? ["rgba(0, 217, 163, 0.15)", "rgba(0, 217, 163, 0.05)"]
            : ["rgba(158, 158, 158, 0.15)", "rgba(158, 158, 158, 0.05)"]
        }
        style={styles.summaryCard}
      >
        <View style={styles.summaryContent}>
          <Icon
            name={remainingBalance > 0 ? "wallet" : "wallet-outline"}
            size={moderateScale(24)}
            color={remainingBalance > 0 ? "#00D9A3" : "#9E9E9E"}
          />
          <View style={styles.summaryTextContent}>
            <Text style={styles.summaryLabel}>
              {t("reports.financial.availableBalance")}
            </Text>
            <Text style={styles.summaryValue}>
              ₹{remainingBalance.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const PerformanceInsights: React.FC<{
  bestCategory: string;
  bestCategoryName: string;
  bestCategoryEarnings: number;
  bestCategoryEntries: number;
  totalWithdrawn: number;
  remainingBalance: number;
  lastPayment: any;
  paymentCount: number;
}> = ({
  bestCategory,
  bestCategoryName,
  bestCategoryEarnings,
  bestCategoryEntries,
  totalWithdrawn,
  remainingBalance,
  lastPayment,
  paymentCount,
}) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const lastPaymentDate = lastPayment
    ? new Date(lastPayment.paymentDate).toLocaleDateString("en-IN")
    : t("reports.performance.never");

  const cardWidth = (width - scale(16) * 2 - scale(12)) / 2;

  return (
    <View style={styles.performanceContainer}>
      <View style={styles.performanceHeader}>
        <Icon name="chart-line" size={moderateScale(22)} color={theme.colors.primary} />
        <Text style={styles.performanceTitle}>
          {t("reports.performance.title")}
        </Text>
      </View>

      <View style={styles.performanceGrid}>
        {/* Best Work Type */}
        <LinearGradient
          colors={["rgba(255, 184, 0, 0.15)", "rgba(255, 184, 0, 0.05)"]}
          style={[styles.performanceCard, { width: cardWidth }]}
        >
          <View style={styles.performanceCardHeader}>
            <Icon name="trophy" size={moderateScale(28)} color="#FFB800" />
          </View>
          <Text style={styles.performanceCardLabel}>
            {t("reports.performance.bestWorkType")}
          </Text>
          <Text style={styles.performanceCardValue}>{bestCategoryName}</Text>
          <Text style={styles.performanceCardSubtext}>
            {bestCategoryEntries} {t("reports.statistics.entries")} • ₹
            {bestCategoryEarnings.toLocaleString("en-IN")}
          </Text>
        </LinearGradient>

        {/* Total Withdrawn */}
        <LinearGradient
          colors={["rgba(0, 217, 163, 0.15)", "rgba(0, 217, 163, 0.05)"]}
          style={[styles.performanceCard, { width: cardWidth }]}
        >
          <View style={styles.performanceCardHeader}>
            <Icon name="cash-check" size={moderateScale(28)} color="#00D9A3" />
          </View>
          <Text style={styles.performanceCardLabel}>
            {t("reports.performance.totalWithdrawn")}
          </Text>
          <Text style={styles.performanceCardValue}>
            ₹{totalWithdrawn.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.performanceCardSubtext}>
            {paymentCount} {t("reports.performance.withdrawals")}
          </Text>
        </LinearGradient>

        {/* Available Balance */}
        <LinearGradient
          colors={
            remainingBalance > 0
              ? ["rgba(108, 92, 231, 0.15)", "rgba(108, 92, 231, 0.05)"]
              : ["rgba(158, 158, 158, 0.15)", "rgba(158, 158, 158, 0.05)"]
          }
          style={[styles.performanceCard, { width: cardWidth }]}
        >
          <View style={styles.performanceCardHeader}>
            <Icon
              name={remainingBalance > 0 ? "wallet" : "wallet-outline"}
              size={moderateScale(28)}
              color={remainingBalance > 0 ? "#6C5CE7" : "#9E9E9E"}
            />
          </View>
          <Text style={styles.performanceCardLabel}>
            {t("reports.performance.availableBalance")}
          </Text>
          <Text style={styles.performanceCardValue}>
            ₹{remainingBalance.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.performanceCardSubtext}>
            {remainingBalance > 0
              ? t("reports.performance.canWithdraw")
              : t("reports.performance.allWithdrawn")}
          </Text>
        </LinearGradient>

        {/* Last Withdrawal */}
        <LinearGradient
          colors={["rgba(116, 185, 255, 0.15)", "rgba(116, 185, 255, 0.05)"]}
          style={[styles.performanceCard, { width: cardWidth }]}
        >
          <View style={styles.performanceCardHeader}>
            <Icon name="calendar-check" size={moderateScale(28)} color="#74B9FF" />
          </View>
          <Text style={styles.performanceCardLabel}>
            {t("reports.performance.lastWithdrawal")}
          </Text>
          <Text style={styles.performanceCardValue} numberOfLines={1}>
            {lastPaymentDate}
          </Text>
          <Text style={styles.performanceCardSubtext}>
            {lastPayment
              ? t("reports.performance.completed")
              : t("reports.performance.noWithdrawalsYet")}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
};

const ReportsScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const { selectedCategory: currentCategory } = useSelector(
    (state: RootState) => state.category
  );

  const initialRange = getDateRangeForFilter("monthly");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("monthly");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState(initialRange!);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const { statistics, loading, refreshing, error, fetchStatistics } =
    useReportData();
  const { exporting, handleExport } = useReportExport();

  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate && currentCategory) {
      fetchStatistics(dateRange.startDate, dateRange.endDate, currentCategory);
    }
  }, [dateRange.startDate, dateRange.endDate, currentCategory]);

  useEffect(() => {
    if (selectedFilter !== "custom") {
      const newRange = getDateRangeForFilter(selectedFilter);
      if (newRange) {
        setDateRange(newRange);
      }
    }
  }, [selectedFilter]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFilterChange = useCallback((filter: FilterType) => {
    if (filter === "custom") {
      setShowCustomModal(true);
    } else {
      setSelectedFilter(filter);
    }
  }, []);

  const handleCustomDateApply = useCallback(
    (startDate: string, endDate: string) => {
      setSelectedFilter("custom");
      setDateRange({ startDate, endDate });
      setShowCustomModal(false);
    },
    []
  );

  const handleRefresh = useCallback(() => {
    if (dateRange?.startDate && dateRange?.endDate && currentCategory) {
      fetchStatistics(dateRange.startDate, dateRange.endDate, currentCategory);
    }
  }, [
    dateRange.startDate,
    dateRange.endDate,
    currentCategory,
    fetchStatistics,
  ]);

  const bestPerformingWork = useMemo(() => {
    if (
      statistics?.detailedCategorySummary?.workTypeBreakdown &&
      statistics.detailedCategorySummary.workTypeBreakdown.length > 0
    ) {
      const best = statistics.detailedCategorySummary.workTypeBreakdown.reduce(
        (max: any, item: any) =>
          item.totalEarnings > max.totalEarnings ? item : max
      );

      return {
        category: best._id,
        categoryName: best._id,
        earnings: best.totalEarnings,
        entries: best.entryCount,
      };
    }

    const singleCategory = statistics?.workTypeBreakdown?.[0];
    if (singleCategory) {
      return {
        category: singleCategory.category,
        categoryName: singleCategory.categoryName,
        earnings: singleCategory.totalEarnings,
        entries: singleCategory.entryCount,
      };
    }

    return {
      category: "N/A",
      categoryName: "N/A",
      earnings: 0,
      entries: 0,
    };
  }, [statistics]);

  const handleExportPress = useCallback(
    (exportType: "share" | "copy" | "pdf") => {
      if (statistics) {
        handleExport(statistics, dateRange, exportType);
        setShowExportMenu(false);
      }
    },
    [statistics, dateRange, handleExport]
  );

  const ExportMenuModal = () => (
    <Modal
      visible={showExportMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowExportMenu(false)}
    >
      <BlurView intensity={100} tint="dark" style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalOverlayTouch}
          activeOpacity={1}
          onPress={() => setShowExportMenu(false)}
        >
          <View style={[styles.exportMenu, { maxWidth: width - scale(40) }]}>
            <View style={styles.exportMenuHeader}>
              <Text style={styles.exportMenuTitle}>
                {t("reports.export.title")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowExportMenu(false)}
                style={styles.closeModalBtn}
              >
                <Icon
                  name="close"
                  size={moderateScale(24)}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExportPress("share")}
            >
              <View
                style={[
                  styles.exportIconContainer,
                  { backgroundColor: "rgba(108, 92, 231, 0.15)" },
                ]}
              >
                <Icon
                  name="share-variant"
                  size={moderateScale(20)}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionText}>
                  {t("reports.export.share")}
                </Text>
                <Text style={styles.exportOptionSubtext}>
                  {t("reports.export.shareDesc")}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExportPress("copy")}
            >
              <View
                style={[
                  styles.exportIconContainer,
                  { backgroundColor: "rgba(0, 217, 163, 0.15)" },
                ]}
              >
                <Icon
                  name="content-copy"
                  size={moderateScale(20)}
                  color={theme.colors.success}
                />
              </View>
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionText}>
                  {t("reports.export.copy")}
                </Text>
                <Text style={styles.exportOptionSubtext}>
                  {t("reports.export.copyDesc")}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExportPress("pdf")}
            >
              <View
                style={[
                  styles.exportIconContainer,
                  { backgroundColor: "rgba(255, 107, 107, 0.15)" },
                ]}
              >
                <Icon
                  name="file-pdf-box"
                  size={moderateScale(20)}
                  color={theme.colors.error}
                />
              </View>
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionText}>
                  {t("reports.export.pdf")}
                </Text>
                <Text style={styles.exportOptionSubtext}>
                  {t("reports.export.pdfDesc")}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </BlurView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + verticalScale(10) }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{t("reports.title")}</Text>
          <Text style={styles.greeting}>
            {t("reports.greeting")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={() => setShowExportMenu(true)}
          disabled={exporting || !statistics}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="download" size={moderateScale(22)} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <FilterChips
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: verticalScale(80) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* LOADING STATE */}
        {loading && !statistics && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {/* ERROR STATE */}
        {error && !statistics && !loading && (
          <View style={styles.centerContent}>
            <Icon
              name="alert-circle-outline"
              size={moderateScale(64)}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{t("reports.error")}</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
          </View>
        )}

        {/* CONTENT */}
        {statistics && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Key Statistics */}
            <KeyStatisticsCard statistics={statistics} dateRange={dateRange} />

            {/* Financial Summary */}
            <FinancialSummary
              totalEarnings={statistics.totalEarnings || 0}
              remainingBalance={statistics.pendingBalance || 0}
            />

            {/* Earnings Trend Chart */}
            {statistics.detailedCategorySummary?.dailyTimeline &&
              statistics.detailedCategorySummary.dailyTimeline.length > 0 && (
                <EarningsTrendChart
                  data={statistics.detailedCategorySummary.dailyTimeline}
                  dateRange={dateRange}
                />
              )}

            {/* Work Type Distribution Chart */}
            {statistics.detailedCategorySummary?.workTypeBreakdown &&
              statistics.detailedCategorySummary.workTypeBreakdown.length >
                0 && (
                <WorkDistributionChart
                  workTypeBreakdown={
                    statistics.detailedCategorySummary.workTypeBreakdown
                  }
                />
              )}

            {/* Performance Insights */}
            <PerformanceInsights
              bestCategory={bestPerformingWork.category}
              bestCategoryName={bestPerformingWork.categoryName}
              bestCategoryEarnings={bestPerformingWork.earnings}
              bestCategoryEntries={bestPerformingWork.entries}
              totalWithdrawn={statistics.totalPaid || 0}
              remainingBalance={statistics.pendingBalance || 0}
              lastPayment={statistics.lastPayment}
              paymentCount={statistics.paymentCount || 0}
            />
          </Animated.View>
        )}

        {/* EMPTY STATE */}
        {!statistics && !loading && !error && (
          <View style={styles.centerContent}>
            <Icon
              name="chart-box-outline"
              size={moderateScale(64)}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.errorText}>{t("reports.noDataAvailable")}</Text>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <DateRangeModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onApply={handleCustomDateApply}
      />
      <ExportMenuModal />
    </View>
  );
};

const statsStyles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(theme.spacing.lg),
  },
  grid: {
    flexDirection: "row",
    gap: scale(12),
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(theme.radii.md),
    padding: moderateScale(14),
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: verticalScale(110),
    justifyContent: "center",
  },
  iconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(8),
  },
  statValue: {
    fontSize: moderateScale(14),
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: verticalScale(2),
  },
  statSubValue: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(10),
    color: theme.colors.textSecondary,
    fontWeight: "600",
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: verticalScale(12),
    paddingHorizontal: scale(16),
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: moderateScale(13),
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: verticalScale(2),
  },
  exportBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(16),
    // paddingTop: verticalScale(16),
  },
  summaryContainer: {
    flexDirection: "row",
    gap: scale(12),
    marginBottom: verticalScale(theme.spacing.lg),
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(theme.radii.md),
    padding: moderateScale(theme.spacing.md),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryContent: {
    alignItems: "center",
    gap: verticalScale(8),
  },
  summaryTextContent: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: moderateScale(11),
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginBottom: verticalScale(2),
    textAlign: "center",
  },
  summaryValue: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    color: theme.colors.text,
  },
  productivityContainer: {
    marginBottom: verticalScale(theme.spacing.lg),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(theme.spacing.sm),
    marginBottom: verticalScale(theme.spacing.lg),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: theme.colors.text,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(12),
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(theme.radii.md),
    padding: moderateScale(theme.spacing.md),
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    minHeight: verticalScale(120),
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: moderateScale(11),
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginTop: verticalScale(8),
    marginBottom: verticalScale(4),
    textAlign: "center",
  },
  metricValue: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: verticalScale(2),
    textAlign: "center",
  },
  metricSubValue: {
    fontSize: moderateScale(11),
    color: theme.colors.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  performanceContainer: {
    marginBottom: verticalScale(theme.spacing.lg),
  },
  performanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(theme.spacing.sm),
    marginBottom: verticalScale(theme.spacing.lg),
  },
  performanceTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: theme.colors.text,
  },
  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(12),
  },
  performanceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(theme.radii.md),
    padding: moderateScale(theme.spacing.md),
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    minHeight: verticalScale(130),
    justifyContent: "center",
  },
  performanceCardHeader: {
    marginBottom: verticalScale(theme.spacing.md),
  },
  performanceCardLabel: {
    fontSize: moderateScale(11),
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginBottom: verticalScale(6),
    textAlign: "center",
  },
  performanceCardValue: {
    fontSize: moderateScale(16),
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: verticalScale(4),
    textAlign: "center",
  },
  performanceCardSubtext: {
    fontSize: moderateScale(10),
    color: theme.colors.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(160),
  },
  loadingText: {
    marginTop: verticalScale(theme.spacing.md),
    fontSize: moderateScale(14),
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: verticalScale(theme.spacing.md),
  },
  errorSubtext: {
    fontSize: moderateScale(13),
    color: theme.colors.textSecondary,
    marginTop: verticalScale(theme.spacing.sm),
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
  },
  modalOverlayTouch: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(20),
  },
  exportMenu: {
    backgroundColor: theme.colors.background,
    borderRadius: moderateScale(theme.radii.xl),
    padding: moderateScale(theme.spacing.xl),
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  exportMenuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(theme.spacing.lg),
  },
  exportMenuTitle: {
    fontSize: moderateScale(20),
    fontWeight: "800",
    color: theme.colors.text,
  },
  closeModalBtn: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  exportOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: moderateScale(theme.spacing.md),
    borderRadius: moderateScale(theme.radii.lg),
    marginBottom: verticalScale(theme.spacing.sm),
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exportIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(theme.spacing.md),
  },
  exportOptionContent: {
    flex: 1,
  },
  exportOptionText: {
    fontSize: moderateScale(16),
    color: theme.colors.text,
    fontWeight: "700",
    marginBottom: verticalScale(2),
  },
  exportOptionSubtext: {
    fontSize: moderateScale(12),
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
});

export default ReportsScreen;
