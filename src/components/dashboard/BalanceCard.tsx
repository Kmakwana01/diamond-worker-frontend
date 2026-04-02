import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import theme from "../../styles/dashboard";

type Props = {
  balance?: {
    remainingBalance?: number;
    totalEarnings?: number;
    totalPaid?: number;
  } | null;
};

const formatCurrency = (amount?: number) =>
  `₹${(amount ?? 0).toLocaleString("en-IN")}`;

const BalanceCard: React.FC<Props> = ({ balance }) => {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={["rgba(108, 92, 231, 0.2)", "rgba(162, 155, 254, 0.1)"]}
      style={styles.balanceCard}
    >
      <View style={styles.balanceRow}>
        <View style={styles.balanceLeft}>
          <Text style={styles.balanceLabel}>{t("home.totalBalance")}</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(balance?.remainingBalance)}
          </Text>
        </View>
        <View style={styles.balanceIcon}>
          <Icon
            name="wallet-outline"
            size={moderateScale(28)}
            color="#fff"
          />
        </View>
      </View>

      <View style={styles.balanceStats}>
        <View style={styles.balanceStat}>
          <Icon
            name="arrow-up"
            size={moderateScale(16)}
            color={theme.colors.success}
          />
          <Text style={styles.balanceStatLabel}>{t("home.earned")}</Text>
          <Text style={styles.balanceStatValue}>
            {formatCurrency(balance?.totalEarnings)}
          </Text>
        </View>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceStat}>
          <Icon
            name="arrow-down"
            size={moderateScale(16)}
            color={theme.colors.error}
          />
          <Text style={styles.balanceStatLabel}>{t("home.paid")}</Text>
          <Text style={styles.balanceStatValue}>
            {formatCurrency(balance?.totalPaid)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    padding: moderateScale(14),
    borderRadius: moderateScale(theme.radii.lg),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  balanceLeft: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: moderateScale(11),
    color: theme.colors.textSecondary,
    fontWeight: "500",
    marginBottom: verticalScale(4),
  },
  balanceAmount: {
    fontSize: moderateScale(28),
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -1,
  },
  balanceIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: "rgba(108, 92, 231, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceStats: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  balanceStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  balanceDivider: {
    width: 1,
    height: verticalScale(28),
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: scale(theme.spacing.sm),
  },
  balanceStatLabel: {
    fontSize: moderateScale(10),
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  balanceStatValue: {
    fontSize: moderateScale(12),
    color: theme.colors.text,
    fontWeight: "700",
    marginLeft: "auto",
  },
});

export default React.memo(BalanceCard);
