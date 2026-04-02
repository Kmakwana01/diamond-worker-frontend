// src/components/common/AppHeader.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import theme from "../../styles/dashboard";

// ✅ CATEGORY DISPLAY NAMES - Now using translation keys
const CATEGORY_DISPLAY_CONFIG: Record<string, { nameKey: string; emoji: string }> = {
  DIAMOND: { nameKey: "categories.diamondWorker", emoji: "💎" },
  PLUMBER: { nameKey: "categories.plumber", emoji: "🔧" },
  CARPENTER: { nameKey: "categories.carpenter", emoji: "🪵" },
  ELECTRICIAN: { nameKey: "categories.electrician", emoji: "⚡" },
  PAINTER: { nameKey: "categories.painter", emoji: "🎨" },
  MASON: { nameKey: "categories.mason", emoji: "🧱" },
  CUSTOM: { nameKey: "categories.worker", emoji: "👤" },
};

interface AppHeaderProps {
  insets: { top: number; bottom: number; left: number; right: number };
  title?: string; // Custom title (if not using category)
  subtitle?: string; // Custom subtitle (if not using category)
  showCategory?: boolean; // Show dynamic category name (default: true)
  showProfile?: boolean; // Show profile button (default: true)
  onProfilePress?: () => void;
  leftIcon?: string; // Left icon (e.g., "arrow-left", "menu")
  onLeftPress?: () => void;
  rightIcon?: string; // Right icon
  onRightPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  insets,
  title,
  subtitle,
  showCategory = true,
  showProfile = true,
  onProfilePress,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
}) => {
  const { t } = useTranslation();

  // ✅ GET SELECTED CATEGORY FROM REDUX
  const selectedCategory = useSelector(
    (state: RootState) => state.category.selectedCategory
  );

  // ✅ GET DYNAMIC CATEGORY CONFIG AND TRANSLATE
  const categoryConfig = CATEGORY_DISPLAY_CONFIG[selectedCategory || "DIAMOND"] || {
    nameKey: "categories.worker",
    emoji: "👤",
  };

  const categoryName = t(categoryConfig.nameKey);

  // ✅ DETERMINE HEADER TEXT
  const headerTitle = showCategory
    ? `${categoryConfig.emoji} ${categoryName}`
    : title || t("common.welcome");

  const headerSubtitle = showCategory
    ? t("home.welcomeBack")
    : subtitle || "";

  return (
    <View style={[styles.header, { paddingTop: (insets.top || 0) + 10 }]}>
      {/* Left Icon */}
      {leftIcon && (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onLeftPress}
          activeOpacity={0.7}
        >
          <Icon
            name={leftIcon}
            size={moderateScale(24)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      )}

      {/* Title & Subtitle */}
      <View style={styles.headerLeft}>
        <Text style={styles.subtitle}>{headerSubtitle}</Text>
        <Text style={styles.title}>{headerTitle}</Text>
      </View>

      {/* Right Side - Profile or Custom Icon */}
      {rightIcon && (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onRightPress}
          activeOpacity={0.7}
        >
          <Icon
            name={rightIcon}
            size={moderateScale(22)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      )}

      {showProfile && (
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <Icon name="account" size={moderateScale(22)} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(12),
    paddingHorizontal: scale(16),
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  subtitle: {
    fontSize: moderateScale(13),
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: verticalScale(2),
  },
  iconBtn: {
    padding: moderateScale(8),
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
});

export default React.memo(AppHeader);
