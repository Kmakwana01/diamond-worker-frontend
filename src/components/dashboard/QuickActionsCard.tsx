import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import theme from "../../styles/dashboard";

interface ActionButton {
  id: string;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  gradient: string[];
  iconBg: string;
  onPress: () => void;
}

interface QuickActionsCardProps {
  onNavigateToWork?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToPayments?: () => void;
  onOpenAddWork?: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onNavigateToWork,
  onNavigateToReports,
  onNavigateToPayments,
  onOpenAddWork,
}) => {
  const { t } = useTranslation();

  const actions: ActionButton[] = [
    {
      id: "addWork",
      titleKey: "home.addWork",
      subtitleKey: "home.quickEntry",
      icon: "plus-circle",
      gradient: ["rgba(108, 92, 231, 0.15)", "rgba(108, 92, 231, 0.05)"],
      iconBg: "#6C5CE7",
      onPress: onOpenAddWork || (() => {}),
    },
    {
      id: "allWork",
      titleKey: "home.allWork",
      subtitleKey: "home.viewEntries",
      icon: "calendar-month",
      gradient: ["rgba(0, 217, 163, 0.15)", "rgba(0, 217, 163, 0.05)"],
      iconBg: "#00D9A3",
      onPress: onNavigateToWork || (() => {}),
    },
    {
      id: "statistics",
      titleKey: "home.statistics",
      subtitleKey: "home.analytics",
      icon: "chart-line",
      gradient: ["rgba(255, 184, 0, 0.15)", "rgba(255, 184, 0, 0.05)"],
      iconBg: "#FFB800",
      onPress: onNavigateToReports || (() => {}),
    },
    {
      id: "payment",
      titleKey: "home.payment",
      subtitleKey: "home.viewPayments",
      icon: "cash-multiple",
      gradient: ["rgba(116, 185, 255, 0.15)", "rgba(116, 185, 255, 0.05)"],
      iconBg: "#74B9FF",
      onPress: onNavigateToPayments || (() => {}),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t("home.quickActions")}</Text>
          <Text style={styles.subtitle}>{t("home.accessKeyFeatures")}</Text>
        </View>
        <View style={styles.decorativeDot} />
      </View>

      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionWrapper}
            onPress={action.onPress}
            activeOpacity={0.75}
          >
            <LinearGradient
              colors={action.gradient}
              style={styles.actionCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.cornerAccent, { backgroundColor: action.iconBg }]} />
              
              <View style={[styles.iconContainer, { backgroundColor: action.iconBg }]}>
                <Icon name={action.icon} size={moderateScale(22)} color="#fff" />
              </View>

              <View style={styles.textContent}>
                <Text style={styles.actionTitle}>{t(action.titleKey)}</Text>
                <Text style={styles.actionSubtitle}>{t(action.subtitleKey)}</Text>
              </View>

              <View style={styles.arrowContainer}>
                <Icon name="arrow-right" size={moderateScale(16)} color={action.iconBg} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: verticalScale(2),
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: moderateScale(10),
    color: theme.colors.textSecondary,
    fontWeight: "500",
    opacity: 0.8,
  },
  decorativeDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: theme.colors.primary,
    opacity: 0.9,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: verticalScale(8)
  },
  actionWrapper: {
    width: "48.5%",
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(theme.radii.md),
    padding: moderateScale(12),
    minHeight: verticalScale(100),
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: "relative",
    overflow: "hidden",
  },
  cornerAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: moderateScale(32),
    height: moderateScale(32),
    borderBottomLeftRadius: moderateScale(32),
    opacity: 0.2,
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  textContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  actionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: verticalScale(2),
    letterSpacing: -0.2,
  },
  actionSubtitle: {
    fontSize: moderateScale(9),
    color: theme.colors.textSecondary,
    fontWeight: "500",
    opacity: 0.85,
  },
  arrowContainer: {
    position: "absolute",
    bottom: moderateScale(10),
    right: moderateScale(10),
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
});


export default React.memo(QuickActionsCard);
