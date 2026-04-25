import React, {
  FC,
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StatusBar,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useWorkDataWithPayments } from "../../hooks/useWorkDataWithPayments";
import { theme } from "../../styles/workTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "@/components/common/AppHeader";
import { getCategoryStatsConfig } from "@/config/categoryStatsConfig";
import MonthYearPickerModal from "@/components/work/MonthYearPickerModal";
import { workApi } from "@/api/workApi";
import Toast from "react-native-toast-message";
import AdBanner from "@/components/ads/AdBanner";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SkeletonTableHeader: FC<{ shimmerAnim: Animated.Value }> = ({
  shimmerAnim,
}) => {
  const shimmer = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const HeaderCell = ({ flex }: { flex: number }) => (
    <View style={{ flex, alignItems: "center" }}>
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.05)",
          "rgba(255,255,255,0.12)",
          "rgba(255,255,255,0.05)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: "80%",
          height: verticalScale(14),
          borderRadius: moderateScale(6),
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={[
            styles.shimmerOverlay,
            { transform: [{ translateX: shimmer }] },
          ]}
        />
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.tableHeaderWrapper}>
      <View style={styles.tableHeaderRow}>
        <HeaderCell flex={1.3} />
        <HeaderCell flex={0.8} />
        <HeaderCell flex={0.8} />
        <HeaderCell flex={1.1} />
        <HeaderCell flex={0.9} />
        <HeaderCell flex={1.1} />
      </View>
    </View>
  );
};

const WorkListScreen: FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    data,
    loading,
    selectedMonth,
    selectedCategory,
    changeMonth,
    refresh,
  } = useWorkDataWithPayments();

  const [refreshing, setRefreshing] = useState(false);
  const [monthSheetVisible, setMonthSheetVisible] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  // Get category-specific configuration
  const categoryConfig = useMemo(() => {
    return getCategoryStatsConfig(selectedCategory || "DIAMOND");
  }, [selectedCategory]);

  const toggleExpand = (date: string) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const hasEntries = !!data?.dailyBreakdown && data.dailyBreakdown.length > 0;

  const monthlyTotals = useMemo(() => {
    if (!data?.dailyBreakdown)
    {
      return {
        totalQuantity: 0,
        totalEarnings: 0,
        totalPaid: 0,
        totalRemaining: 0,
      };
    }
    return data.dailyBreakdown.reduce(
      (acc, day) => {
        const dayQuantity =
          day.workEntries?.reduce((sum: number, entry: any) => {
            const quantity =
              entry.categoryFields?.[categoryConfig.quantityField] || 0;
            return sum + quantity;
          }, 0) || 0;

        return {
          totalQuantity: acc.totalQuantity + dayQuantity,
          totalEarnings: acc.totalEarnings + day.earnedAmount,
          totalPaid: acc.totalPaid + day.advancePaid,
          totalRemaining: acc.totalRemaining + day.remainingBalanceForDate,
        };
      },
      {
        totalQuantity: 0,
        totalEarnings: 0,
        totalPaid: 0,
        totalRemaining: 0,
      }
    );
  }, [data, categoryConfig]);

  const handlePreviousMonth = useCallback(() => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    changeMonth(newMonth);
  }, [selectedMonth, changeMonth]);

  const handleNextMonth = useCallback(() => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    changeMonth(newMonth);
  }, [selectedMonth, changeMonth]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Dynamic calculation for daily row
  const getDailyQuantity = (day: any) => {
    return (
      day.workEntries?.reduce((sum: number, entry: any) => {
        const quantity =
          entry.categoryFields?.[categoryConfig.quantityField] || 0;
        return sum + quantity;
      }, 0) || 0
    );
  };

  // Dynamic calculation for rate
  const getDailyRate = (day: any) => {
    const quantity = getDailyQuantity(day);
    if (quantity && day.earnedAmount)
    {
      return (day.earnedAmount / quantity).toFixed(2);
    }
    return "0.0";
  };

  // Delete entry handler
  const handleDeleteEntry = useCallback(
    async (entryId: string, workType: string) => {
      Alert.alert(
        t("work.deleteEntry") || "Delete Entry",
        t("work.deleteConfirm") || `Are you sure you want to delete this ${workType} entry?`,
        [
          {
            text: t("common.cancel") || "Cancel",
            style: "cancel",
          },
          {
            text: t("common.delete") || "Delete",
            style: "destructive",
            onPress: async () => {
              setDeletingEntryId(entryId);
              try
              {
                await workApi.deleteWorkEntry(entryId);
                Toast.show({
                  type: "success",
                  text1: t("common.success") || "Success",
                  text2: t("work.entryDeleted") || "Entry deleted successfully",
                });
                // Refresh data after deletion
                await refresh();
              } catch (error: any)
              {
                const msg =
                  error?.response?.data?.message ||
                  t("work.deleteFailed") ||
                  "Failed to delete entry";
                Toast.show({
                  type: "error",
                  text1: t("common.error") || "Error",
                  text2: msg,
                });
              } finally
              {
                setDeletingEntryId(null);
              }
            },
          },
        ]
      );
    },
    [refresh, t]
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        const { dx, dy } = gesture;
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderRelease: (_, gesture) => {
        const { dx } = gesture;
        if (dx < -40)
        {
          handleNextMonth();
        } else if (dx > 40)
        {
          handlePreviousMonth();
        }
      },
    })
  ).current;

  const SkeletonRow: FC = () => {
    const shimmer = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
    });

    return (
      <View style={styles.skeletonRow}>
        {/* Date Column */}
        <View style={[styles.skeletonCell, styles.colDate]}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.06)",
              "rgba(255, 255, 255, 0.12)",
              "rgba(255, 255, 255, 0.06)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.skelDateBox}
          >
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { transform: [{ translateX: shimmer }] },
              ]}
            />
          </LinearGradient>
        </View>

        {/* Pieces Column */}
        <View style={[styles.skeletonCell, styles.colPieces]}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.05)",
              "rgba(255, 255, 255, 0.10)",
              "rgba(255, 255, 255, 0.05)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.skelSmallBox}
          >
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { transform: [{ translateX: shimmer }] },
              ]}
            />
          </LinearGradient>
        </View>

        {/* Rate Column */}
        <View style={[styles.skeletonCell, styles.colRate]}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.05)",
              "rgba(255, 255, 255, 0.10)",
              "rgba(255, 255, 255, 0.05)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.skelSmallBox}
          >
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { transform: [{ translateX: shimmer }] },
              ]}
            />
          </LinearGradient>
        </View>

        {/* Earned Column */}
        <View style={[styles.skeletonCell, styles.colEarned]}>
          <LinearGradient
            colors={[
              "rgba(0, 217, 163, 0.08)",
              "rgba(0, 217, 163, 0.15)",
              "rgba(0, 217, 163, 0.08)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.skelMediumBox}
          >
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { transform: [{ translateX: shimmer }] },
              ]}
            />
          </LinearGradient>
        </View>

        {/* Paid Column */}
        <View style={[styles.skeletonCell, styles.colPaid]}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.05)",
              "rgba(255, 255, 255, 0.10)",
              "rgba(255, 255, 255, 0.05)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.skelSmallBox}
          >
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { transform: [{ translateX: shimmer }] },
              ]}
            />
          </LinearGradient>
        </View>

        {/* Balance Column */}
        <View style={[styles.skeletonCell, styles.colBalance]}>
          <LinearGradient
            colors={[
              "rgba(108, 92, 231, 0.08)",
              "rgba(108, 92, 231, 0.15)",
              "rgba(108, 92, 231, 0.08)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.skelMediumBox}
          >
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { transform: [{ translateX: shimmer }] },
              ]}
            />
          </LinearGradient>
        </View>
      </View>
    );
  };

  const getMonthNames = () => {
    return [
      t("common.january") || "January",
      t("common.february") || "February",
      t("common.march") || "March",
      t("common.april") || "April",
      t("common.may") || "May",
      t("common.june") || "June",
      t("common.july") || "July",
      t("common.august") || "August",
      t("common.september") || "September",
      t("common.october") || "October",
      t("common.november") || "November",
      t("common.december") || "December",
    ];
  };

  const getWeekdayShort = (date: Date) => {
    const weekdaysShort = [
      t("common.sun"),
      t("common.mon"),
      t("common.tue"),
      t("common.wed"),
      t("common.thu"),
      t("common.fri"),
      t("common.sat"),
    ];
    return weekdaysShort[date.getDay()];
  };

  const getMonthShort = (date: Date) => {
    const monthsShort = [
      t("common.jan"),
      t("common.feb"),
      t("common.mar"),
      t("common.apr"),
      t("common.may"),
      t("common.jun"),
      t("common.jul"),
      t("common.aug"),
      t("common.sep"),
      t("common.oct"),
      t("common.nov"),
      t("common.dec"),
    ];
    return monthsShort[date.getMonth()];
  };

  const formatMonthYear = (date: Date) => {
    const monthNames = getMonthNames();
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${monthName} ${year}`;
  };

  const renderDailyRow = (day: any, index: number) => {
    const remaining = day.remainingBalanceForDate;
    const isNegative = remaining < 0;
    const isEven = index % 2 === 0;
    const entryCount = Array.isArray(day.workEntries)
      ? day.workEntries.length
      : 0;
    const isExpanded = expandedDate === day.date;

    const dailyQuantity = getDailyQuantity(day).toFixed(0);
    const rateValue = getDailyRate(day);

    const dateObj = new Date(day.date);

    // Check if this is a single entry day
    const isSingleEntry = entryCount === 1;
    const singleEntryId = isSingleEntry ? day.workEntries[0]?._id : null;

    return (
      <View key={`${day.date}-${index}`}>
        {/* Main Row */}
        <TouchableOpacity
          style={[
            styles.rowContainer,
            isEven && styles.rowEven,
            isNegative && styles.rowNegative,
          ]}
          activeOpacity={0.85}
          onPress={() => {
            if (entryCount > 1) toggleExpand(day.date);
          }}
          onLongPress={() => {
            if (isSingleEntry && singleEntryId)
            {
              const workType =
                day.workEntries[0]?.categoryFields?.workType ||
                t("work.entry");
              handleDeleteEntry(singleEntryId, workType);
            }
          }}
          delayLongPress={500}
        >
          <View style={[styles.cell, styles.colDate]}>
            <View style={styles.dateRow}>
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: scale(4),
                  }}
                >
                  <Text style={styles.rowDateTop}>
                    {getWeekdayShort(new Date(day.date))}
                  </Text>

                  <View style={styles.iconWrapper}>
                    {entryCount > 1 && (
                      <View style={styles.multiEntryBadge}>
                        <Icon name="layers" size={8} color="#FFFFFF" />
                        <Text style={styles.multiEntryCount}>{entryCount}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={styles.rowDateBottom}>
                  {dateObj.getDate().toString().padStart(2, "0")}{" "}
                  {getMonthShort(dateObj)}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.cell, styles.colPieces]}>
            <Text style={styles.rowValue}>{dailyQuantity}</Text>
          </View>

          <View style={[styles.cell, styles.colRate]}>
            <Text style={styles.rowValue}>₹{rateValue}</Text>
          </View>

          <View style={[styles.cell, styles.colEarned]}>
            <Text style={[styles.rowValue, styles.earnedText]}>
              ₹{Number(day.earnedAmount).toFixed(0).toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={[styles.cell, styles.colPaid]}>
            <Text style={[styles.rowValue, styles.paidText]}>
              ₹{day.advancePaid.toFixed(0).toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={[styles.cell, styles.colBalance]}>
            <Text
              style={[
                styles.rowValue,
                isNegative ? styles.balanceNegative : styles.balancePositive,
              ]}
            >
              ₹{remaining.toFixed(0).toLocaleString("en-IN")}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Inline Expanded Entries */}
        {isExpanded &&
          day.workEntries?.map((item, i) => {
            const time = item.workDate
              ? new Date(item.workDate).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
              : "";

            const entryQuantity =
              item.categoryFields?.[categoryConfig.quantityField] || 0;
            const subRate =
              entryQuantity && item.totalEarnings
                ? (item.totalEarnings / entryQuantity).toFixed(2)
                : "-";

            const isOddEntry = i % 2 === 0;
            const gradientColors = isOddEntry
              ? ["rgba(139, 92, 246, 0.11)", "rgba(124, 58, 237, 0.08)"]
              : ["rgba(59, 130, 246, 0.11)", "rgba(37, 99, 235, 0.08)"];

            const borderColor = isOddEntry ? "#6366F1" : theme.colors.success;
            const iconColor = isOddEntry ? "#818CF8" : theme.colors.success;

            const isDeleting = deletingEntryId === item._id;

            return (
              <TouchableOpacity
                key={i}
                onLongPress={() => {
                  const workType =
                    item.categoryFields?.workType || t("work.entry");
                  handleDeleteEntry(item._id, workType);
                }}
                delayLongPress={500}
                activeOpacity={0.7}
                disabled={isDeleting}
              >
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.subRowContainer,
                    { borderLeftColor: borderColor },
                    isDeleting && styles.deletingRow,
                  ]}
                >
                  <View style={[styles.subCell, styles.colDate]}>
                    <View style={styles.subDateWrapper}>
                      {isDeleting ? (
                        <Icon
                          name="loading"
                          size={moderateScale(18)}
                          color={iconColor}
                        />
                      ) : (
                        <Icon
                          name="circle-small"
                          size={moderateScale(18)}
                          color={iconColor}
                        />
                      )}
                      <View>
                        <Text style={styles.subDateText}>
                          {item.categoryFields?.workType ?? t("work.workType")}
                        </Text>
                        <Text style={styles.entryTime}>{time}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.subCell, styles.colPieces]}>
                    <Text style={styles.subRowValue}>
                      {entryQuantity ?? "-"}
                    </Text>
                  </View>

                  <View style={[styles.subCell, styles.colRate]}>
                    <Text style={styles.subRowValue}>₹{subRate}</Text>
                  </View>

                  <View style={[styles.subCell, styles.colEarned]}>
                    <Text style={[styles.subRowValue, styles.subEarnedText]}>
                      ₹
                      {(item.totalEarnings ?? 0)
                        .toFixed(0)
                        .toLocaleString("en-IN")}
                    </Text>
                  </View>

                  <View style={[styles.subCell, styles.colPaid]}>
                    <Text style={styles.subRowValue}>-</Text>
                  </View>

                  <View style={[styles.subCell, styles.colBalance]}>
                    <Text style={styles.subRowValue}>-</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <AppHeader
        insets={insets}
        title={t("work.workEntries")}
        subtitle={t("work.smartOverview")}
        showCategory={false}
        showProfile={true}
        onProfilePress={() => (navigation as any).navigate("ProfileMain")}
      />

      {/* Month selector */}
      <View {...panResponder.panHandlers}>
        <LinearGradient
          colors={["rgba(108, 92, 231, 0.18)", "rgba(15,23,42,0.95)"]}
          style={styles.monthSelectorWrapper}
        >
          <TouchableOpacity
            style={styles.bigArrow}
            onPress={handlePreviousMonth}
          >
            <Icon
              name="chevron-left"
              size={moderateScale(26)}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.currentMonthButton}
            onPress={() => setMonthSheetVisible(true)}
            activeOpacity={0.9}
          >
            <Icon
              name="calendar-month"
              size={moderateScale(18)}
              color={theme.colors.primary}
            />
            <Text style={styles.monthText}>
              {formatMonthYear(selectedMonth)}
            </Text>
            <Icon
              name="chevron-down"
              size={moderateScale(18)}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bigArrow} onPress={handleNextMonth}>
            <Icon
              name="chevron-right"
              size={moderateScale(26)}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Overall remaining card */}
      <Animated.View
        style={[
          styles.balanceCardWrapper,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <LinearGradient
          colors={["rgba(108, 92, 231, 0.28)", "rgba(15,23,42,0.95)"]}
          style={styles.balanceCard}
        >
          <View style={styles.balanceRow}>
            <View style={styles.balanceLeft}>
              <Text style={styles.balanceLabel}>
                {t("work.overallRemaining")}
              </Text>
              <Text style={styles.balanceAmount}>
                ₹
                {(data?.overallSummary?.remainingBalance ?? 0).toLocaleString(
                  "en-IN"
                )}
              </Text>
              <Text style={styles.balanceHint}>{t("work.basedOnAllWork")}</Text>
            </View>
            <View style={styles.balanceIcon}>
              <Icon
                name="wallet-outline"
                size={moderateScale(30)}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {loading && !refreshing ? (
        <>
          <SkeletonTableHeader shimmerAnim={shimmerAnim} />
          <View style={styles.skeletonContainer}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </View>
        </>
      ) : hasEntries ? (
        <>
          {/* Table header - OUTSIDE ScrollView for full width */}
          <View style={styles.tableHeaderWrapper}>
            <View style={styles.tableHeaderRow}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.tableHeaderText, styles.colDate]}
              >
                {t("work.date")}
              </Text>

              {Object.keys(categoryConfig.fields).map((fieldKey) => {
                const fieldConfig = categoryConfig.fields[fieldKey];
                if (fieldConfig.type === "select") return null;
                return (
                  <Text
                    key={fieldKey}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[styles.tableHeaderText, styles.colPieces]}
                  >
                    {t(fieldConfig.shortPlaceholderKey)}
                  </Text>
                );
              })}

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.tableHeaderText, styles.colEarned]}
              >
                {t("work.earned")}
              </Text>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.tableHeaderText, styles.colPaid]}
              >
                {t("work.paid")}
              </Text>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.tableHeaderText, styles.colBalance]}
              >
                {t("work.balance")}
              </Text>
            </View>
          </View>

          {/* ScrollView with data only */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentWithData}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Table body with data */}
            <View style={styles.tableBodyCard}>
              {data?.dailyBreakdown?.map(renderDailyRow)}
            </View>

            {/* MONTHLY TOTAL */}
            <View style={styles.totalRow}>
              <View style={styles.totalContent}>
                <View style={styles.totalLabelSection}>
                  <Icon
                    name="sigma"
                    size={moderateScale(18)}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.totalLabel}>
                    {t("work.monthlyTotal")}
                  </Text>
                  <Text style={styles.totalMonthText}>
                    {formatMonthYear(selectedMonth)}
                  </Text>
                </View>

                <View style={styles.totalStats}>
                  <View style={styles.totalStatItem}>
                    <Text style={styles.totalStatLabel}>
                      {t(`work.short.${categoryConfig.quantityLabel.toLowerCase() ?? "Items"}`)}
                    </Text>
                    <Text style={styles.totalStatValue}>
                      {monthlyTotals.totalQuantity}
                    </Text>
                  </View>

                  <View style={styles.totalDivider} />

                  <View style={styles.totalStatItem}>
                    <Text style={styles.totalStatLabel}>
                      {t("work.earned").toUpperCase()}
                    </Text>
                    <Text style={[styles.totalStatValue, styles.earnedColor]}>
                      ₹
                      {monthlyTotals.totalEarnings
                        .toFixed(0)
                        .toLocaleString("en-IN")}
                    </Text>
                  </View>

                  <View style={styles.totalDivider} />

                  <View style={styles.totalStatItem}>
                    <Text style={styles.totalStatLabel}>
                      {t("work.paid").toUpperCase()}
                    </Text>
                    <Text style={[styles.totalStatValue, styles.paidColor]}>
                      ₹
                      {monthlyTotals.totalPaid
                        .toFixed(0)
                        .toLocaleString("en-IN")}
                    </Text>
                  </View>

                  <View style={styles.totalDivider} />

                  <View style={styles.totalStatItem}>
                    <Text style={styles.totalStatLabel}>
                      {t("work.balance").toUpperCase()}
                    </Text>
                    <Text style={[styles.totalStatValue, styles.balanceColor]}>
                      ₹
                      {(data?.overallSummary?.remainingBalance ?? 0)
                        .toFixed(0)
                        .toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyState}>
            <Icon
              name="briefcase-off-outline"
              size={moderateScale(64)}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyText}>{t("work.noWorkEntriesFound")}</Text>
            <Text style={styles.emptySubtext}>
              {t("work.addFirstEntry")} {formatMonthYear(selectedMonth)}
            </Text>
          </View>
        </ScrollView>
      )
      }

      {/* ── Fixed AdMob Banner ── */}
      <AdBanner />

      <MonthYearPickerModal
        visible={monthSheetVisible}
        selectedDate={selectedMonth}
        onClose={() => setMonthSheetVisible(false)}
        onSelect={changeMonth}
      />
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(theme.spacing.md),
    paddingHorizontal: scale(theme.spacing.lg),
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: moderateScale(13),
    color: theme.colors.textSecondary,
    fontWeight: "500",
    lineHeight: verticalScale(18),
  },
  profileBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  monthSelectorWrapper: {
    paddingTop: verticalScale(theme.spacing.md),
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.sm),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bigArrow: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currentMonthButton: {
    flex: 1,
    marginHorizontal: scale(theme.spacing.sm),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.sm),
    borderRadius: moderateScale(theme.radii.xl),
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  monthText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: theme.colors.text,
  },
  balanceCardWrapper: {
    paddingHorizontal: scale(theme.spacing.lg),
    paddingTop: verticalScale(theme.spacing.md),
  },
  balanceCard: {
    padding: scale(theme.spacing.lg),
    borderRadius: moderateScale(theme.radii.lg),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLeft: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: moderateScale(12),
    color: theme.colors.textSecondary,
    fontWeight: "500",
    marginBottom: verticalScale(4),
  },
  balanceAmount: {
    fontSize: moderateScale(30),
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.8,
  },
  balanceHint: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(11),
    color: theme.colors.textSecondary,
  },
  balanceIcon: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    backgroundColor: "rgba(108, 92, 231, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  tableHeaderWrapper: {
    marginTop: verticalScale(theme.spacing.md),
    marginHorizontal: scale(theme.spacing.lg),
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: moderateScale(14),
    borderTopRightRadius: moderateScale(14),
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: theme.colors.border,
    minHeight: verticalScale(44),
    justifyContent: "center",
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(theme.spacing.md),
  },
  tableHeaderText: {
    fontSize: moderateScale(10),
    fontWeight: "800",
    color: theme.colors.textSecondary,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  colDate: {
    flex: 1.3,
    textAlign: "left",
    paddingLeft: scale(0),
  },
  colPieces: { flex: 0.8 },
  colRate: { flex: 0.8 },
  colEarned: { flex: 1.1 },
  colPaid: { flex: 0.9 },
  colBalance: {
    flex: 1.1,
    textAlign: "right",
    paddingRight: scale(4),
  },
  scrollView: {
    flex: 1,
  },
  scrollContentEmpty: {
    paddingBottom: verticalScale(60),
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(theme.spacing.sm),
    paddingHorizontal: scale(theme.spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  rowEven: {
    backgroundColor: "rgba(15,23,42,0.9)",
  },
  rowNegative: {
    backgroundColor: "rgba(239, 68, 68, 0.10)",
  },
  cell: {
    paddingHorizontal: scale(4),
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  multiEntryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: scale(4),
    paddingVertical: verticalScale(1),
    borderRadius: moderateScale(8),
    gap: scale(2),
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  multiEntryCount: {
    fontSize: moderateScale(9),
    fontWeight: "800",
    color: "#FFFFFF",
  },
  rowDateTop: {
    fontSize: moderateScale(10),
    color: theme.colors.textSecondary,
  },
  rowDateBottom: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: theme.colors.text,
  },
  rowValue: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  earnedText: {
    color: theme.colors.success,
  },
  paidText: {
    color: theme.colors.text,
  },
  balanceNegative: {
    color: theme.colors.error,
  },
  balancePositive: {
    color: theme.colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(80),
  },
  emptyText: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: verticalScale(theme.spacing.lg),
    marginBottom: verticalScale(theme.spacing.xs),
  },
  emptySubtext: {
    fontSize: moderateScale(14),
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: verticalScale(20),
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: scale(theme.spacing.lg),
    paddingTop: verticalScale(theme.spacing.md),
    paddingBottom: verticalScale(theme.spacing.md),
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(theme.spacing.sm),
  },
  sheetTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: theme.colors.text,
  },
  sheetMonths: {
    marginBottom: verticalScale(theme.spacing.md),
  },
  sheetMonthItem: {
    width: scale(96),
    paddingVertical: verticalScale(theme.spacing.sm),
    borderRadius: moderateScale(theme.radii.lg),
    alignItems: "center",
    marginRight: scale(theme.spacing.sm),
    backgroundColor: theme.colors.surface,
  },
  sheetMonthItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  sheetMonthText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: theme.colors.text,
  },
  sheetMonthTextSelected: {
    color: "#fff",
  },
  sheetYears: {
    marginBottom: verticalScale(theme.spacing.md),
  },
  sheetYearItem: {
    minWidth: scale(72),
    paddingVertical: verticalScale(theme.spacing.sm),
    paddingHorizontal: scale(theme.spacing.md),
    borderRadius: moderateScale(theme.radii.lg),
    alignItems: "center",
    marginRight: scale(theme.spacing.sm),
    backgroundColor: theme.colors.surface,
  },
  sheetYearItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  sheetYearText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: theme.colors.text,
  },
  sheetYearTextSelected: {
    color: "#fff",
  },
  totalRow: {
    marginTop: verticalScale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.lg),
    marginLeft: scale(theme.spacing.lg),
    marginRight: scale(theme.spacing.lg),
    borderRadius: moderateScale(theme.radii.lg),
    backgroundColor: theme.colors.surface,
    padding: scale(theme.spacing.lg),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  totalContent: {
    gap: verticalScale(theme.spacing.md),
  },
  totalLabelSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(theme.spacing.xs),
    paddingBottom: verticalScale(theme.spacing.xs),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: moderateScale(14),
    fontWeight: "800",
    color: theme.colors.text,
  },
  totalMonthText: {
    marginLeft: "auto",
    fontSize: moderateScale(12),
    color: theme.colors.textSecondary,
  },
  totalStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(theme.spacing.sm),
  },
  totalStatItem: {
    flex: 1,
    alignItems: "center",
  },
  totalStatLabel: {
    fontSize: moderateScale(10),
    color: theme.colors.textSecondary,
    marginBottom: verticalScale(2),
  },
  totalStatValue: {
    fontSize: moderateScale(14),
    fontWeight: "800",
    color: theme.colors.text,
  },
  totalDivider: {
    width: 1,
    height: verticalScale(32),
    backgroundColor: theme.colors.border,
  },
  earnedColor: {
    color: theme.colors.success,
  },
  paidColor: {
    color: theme.colors.error,
  },
  balanceColor: {
    color: theme.colors.primary,
  },
  subRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(7),
    paddingHorizontal: scale(theme.spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    borderLeftWidth: 2,
    marginLeft: scale(3),
  },
  subCell: {
    paddingHorizontal: scale(2),
  },
  subDateWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  subDateText: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: theme.colors.text,
    opacity: 0.9,
  },
  entryTime: {
    marginTop: verticalScale(2),
    fontSize: moderateScale(10),
    color: theme.colors.textSecondary,
    opacity: 0.8,
  },
  subRowValue: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
    opacity: 0.88,
  },
  subEarnedText: {
    color: theme.colors.success,
    opacity: 0.9,
  },
  skeletonContainer: {
    marginLeft: scale(theme.spacing.lg),
    marginRight: scale(theme.spacing.lg),
    marginTop: verticalScale(-5),
    marginBottom: verticalScale(theme.spacing.lg),
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(theme.radii.lg),
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: "hidden",
  },
  tableBodyCard: {
    marginTop: verticalScale(-1),
    marginLeft: scale(theme.spacing.lg),
    marginRight: scale(theme.spacing.lg),
    borderTopWidth: 0,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: moderateScale(theme.radii.lg),
    borderBottomRightRadius: moderateScale(theme.radii.lg),
  },
  scrollContentWithData: {
    paddingBottom: verticalScale(90),
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(theme.spacing.sm),
    paddingHorizontal: scale(theme.spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  skeletonCell: {
    paddingHorizontal: scale(4),
    alignItems: "center",
    justifyContent: "center",
  },
  skelDateBox: {
    width: "90%",
    height: verticalScale(36),
    borderRadius: moderateScale(8),
    overflow: "hidden",
    position: "relative",
  },
  skelSmallBox: {
    width: "70%",
    height: verticalScale(22),
    borderRadius: moderateScale(6),
    overflow: "hidden",
    position: "relative",
  },
  skelMediumBox: {
    width: "85%",
    height: verticalScale(22),
    borderRadius: moderateScale(6),
    overflow: "hidden",
    position: "relative",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.15)",
    width: SCREEN_WIDTH * 0.3,
  },
  deletingRow: {
    opacity: 0.5,
  },
});

export default WorkListScreen;