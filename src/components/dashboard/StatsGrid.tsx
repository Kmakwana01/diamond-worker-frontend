import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import theme from "../../styles/dashboard";
import { getCategoryStatsConfig } from '../../config/categoryStatsConfig';

type Props = {
  stats?: {
    totalEntries?: number;
    totalQuantity?: number;
    quantityLabel?: string;
    avgEarnings?: number;
    avgQuantityPerEntry?: number;
  } | null;
};

const StatItem: React.FC<{
  icon: string;
  label: string;
  value: string;
  bg: string;
  iconColor: string;
}> = ({ icon, label, value, bg, iconColor }) => (
  <View style={s.card}>
    <View style={[s.iconSmall, { backgroundColor: bg }]}>
      <Icon name={icon} size={moderateScale(18)} color={iconColor} />
    </View>
    <Text style={s.value}>{value}</Text>
    <Text style={s.label}>{label}</Text>
  </View>
);

const StatsGrid: React.FC<Props> = ({ stats }) => {
  const { t } = useTranslation();
  const { selectedCategory } = useSelector((state: RootState) => state.category);
  
  // Get category config for dynamic icon
  const categoryConfig = getCategoryStatsConfig(selectedCategory);

  const totalEntries = stats?.totalEntries ?? 0;
  const totalQuantity = stats?.totalQuantity ?? 0;
  const quantityLabel = stats?.quantityLabel ?? 'Items';
  const avgEarnings = stats?.avgEarnings ?? 0;

  console.log('🎨 StatsGrid:', {
    selectedCategory,
    categoryIcon: categoryConfig.icon,
    totalEntries,
    totalQuantity,
    quantityLabel,
    avgEarnings,
  });

  return (
    <View style={styles.row}>
      <StatItem
        icon="briefcase-check"
        label={t("home.entries")}
        bg="#6C5CE720"
        iconColor="#6C5CE7"
        value={`${totalEntries}`}
      />
      <StatItem
        icon={categoryConfig.icon} // Dynamic icon based on category
        label={quantityLabel} // Dynamic label
        bg={`${categoryConfig.color}20`} // Dynamic background color
        iconColor={categoryConfig.color} // Dynamic icon color
        value={`${totalQuantity}`}
      />
      <StatItem
        icon="chart-line"
        label={t("home.avgPerEntry")}
        bg="#FFB80020"
        iconColor="#FFB800"
        value={`₹${avgEarnings.toFixed(0)}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: scale(theme.spacing.sm),
    marginBottom: verticalScale(theme.spacing.lg),
  },
});

const s = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(theme.radii.md),
    padding: moderateScale(theme.spacing.md),
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconSmall: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(6),
  },
  value: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: verticalScale(2),
  },
  label: {
    fontSize: moderateScale(10),
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
});

export default React.memo(StatsGrid);
