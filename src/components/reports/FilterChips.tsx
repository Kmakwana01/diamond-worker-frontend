import React, { memo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { theme } from "../../styles/workTheme";

const SCREEN_WIDTH = Dimensions.get("window").width;

export type FilterType = "monthly" | "yearly" | "custom";

interface FilterOption {
  label: string;
  value: FilterType;
  icon: string;
}

interface FilterChipsProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: "Monthly", value: "monthly", icon: "calendar-month" },
  { label: "Yearly", value: "yearly", icon: "calendar" },
  { label: "Custom", value: "custom", icon: "calendar-range" },
];

const CHIP_WIDTH =
  (SCREEN_WIDTH - scale(theme.spacing.lg) * 2 - scale(theme.spacing.sm) * 2) /
  3;

const FilterChips: React.FC<FilterChipsProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterChip,
              selectedFilter === option.value && styles.filterChipActive,
            ]}
            onPress={() => onFilterChange(option.value)}
            activeOpacity={0.7}
          >
            <Icon
              name={option.icon}
              size={moderateScale(16)}
              color={
                selectedFilter === option.value
                  ? "#fff"
                  : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === option.value && styles.filterChipTextActive,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingVertical: verticalScale(theme.spacing.md),
    backgroundColor: theme.colors.background,
  },

  filterScroll: {
    paddingHorizontal: scale(theme.spacing.lg),
    gap: scale(theme.spacing.sm),
  },

  filterChip: {
    // 🔥 FORCE SAME SIZE FOR ALL
    width: CHIP_WIDTH,
    flexGrow: 0,
    flexShrink: 0,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.sm),

    borderRadius: moderateScale(theme.radii.lg),
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: scale(theme.spacing.xs),
  },

  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  filterChipText: {
    fontSize: moderateScale(13),
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },

  filterChipTextActive: {
    color: "#fff",
  },
});

export default memo(FilterChips);
