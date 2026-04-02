import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  StatusBar,
  BackHandler,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { scale, verticalScale } from "react-native-size-matters";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import StatsGrid from "@/components/dashboard/StatsGrid";
import AppHeader from "@/components/common/AppHeader";
import BalanceCard from "@/components/dashboard/BalanceCard";
import AddWorkModal from "@/components/dashboard/AddWorkModal";
import theme from "@/styles/dashboard";

const DashboardScreen: React.FC = memo(() => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { stats, loading, refresh } = useDashboardData();

  // State management
  const [showAddWork, setShowAddWork] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;

  // Memoized data
  const balance = useMemo(
    () => ({
      remainingBalance: stats?.summary?.remainingBalance ?? 0,
      totalEarnings: stats?.summary?.totalEarnings ?? 0,
      totalPaid: stats?.summary?.totalPaid ?? 0,
    }),
    [stats]
  );

  const statsData = useMemo(
    () => ({
      totalEntries: stats?.totalEntries ?? 0,
      totalQuantity: stats?.totalQuantity ?? 0,
      quantityLabel: t(stats?.quantityLabel ?? "Items"),
      avgEarnings: stats?.avgEarnings ?? 0,
      avgQuantityPerEntry: stats?.avgQuantityPerEntry ?? 0,
    }),
    [stats]
  );

  // Animations
  useFocusEffect(
    useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(8);
      };
    }, [fadeAnim, slideAnim])
  );

  // Back handler for Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showAddWork) {
          setShowAddWork(false);
          return true;
        }

        if (backPressCount === 0) {
          setBackPressCount(1);
          Toast.show({
            type: "info",
            text1: t("common.exitApp"),
            text2: t("common.pressAgainToExit"),
            visibilityTime: 2000,
          });

          setTimeout(() => {
            setBackPressCount(0);
          }, 2000);

          return true;
        }

        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [showAddWork, backPressCount, t])
  );

  // Refresh handler
  const onRefresh = useCallback(async () => {
    try {
      await refresh();
      Toast.show({
        type: "success",
        text1: t("common.success"),
        text2: t("home.refreshSuccess"),
      });
    } catch (err) {
      console.error("Refresh error:", err);
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("home.refreshFailed"),
      });
    }
  }, [refresh, t]);

  // Navigation handlers
  const handleProfilePress = useCallback(() => {
    (navigation as any).navigate("ProfileMain");
  }, [navigation]);

  const handleOpenAddWork = useCallback(() => {
    setShowAddWork(true);
  }, []);

  const handleCloseAddWork = useCallback(() => {
    setShowAddWork(false);
  }, []);

  const handleWorkAdded = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleNavigateToWork = useCallback(() => {
    (navigation as any).navigate("Work");
  }, [navigation]);

  const handleNavigateToReports = useCallback(() => {
    (navigation as any).navigate("Reports");
  }, [navigation]);

  const handleNavigateToPayments = useCallback(() => {
    (navigation as any).navigate("Payments");
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
        translucent
      />

      <AppHeader
        insets={insets}
        showCategory
        showProfile
        onProfilePress={handleProfilePress}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: verticalScale(24) + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <BalanceCard balance={balance} />
          <StatsGrid stats={statsData} />
          <QuickActionsCard
            onOpenAddWork={handleOpenAddWork}
            onNavigateToWork={handleNavigateToWork}
            onNavigateToReports={handleNavigateToReports}
            onNavigateToPayments={handleNavigateToPayments}
          />
        </Animated.View>
      </ScrollView>

      <AddWorkModal
        visible={showAddWork}
        onClose={handleCloseAddWork}
        onSuccess={handleWorkAdded}
      />
    </View>
  );
});

DashboardScreen.displayName = "DashboardScreen";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: scale(16),
  },
});

export default DashboardScreen;
