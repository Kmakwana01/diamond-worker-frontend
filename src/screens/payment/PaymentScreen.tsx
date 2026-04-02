// PaymentScreen.tsx - Complete Fixed Version
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getCategoryStatsConfig } from "@/config/categoryStatsConfig";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { paymentApi } from "@/api/paymentApi";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { usePaymentData } from "@/hooks/usePaymentData";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RecordPaymentModal from "@/components/payment/RecordPaymentModal";

const theme = {
  colors: {
    primary: "#6C5CE7",
    secondary: "#A29BFE",
    success: "#00D9A3",
    warning: "#FFB800",
    error: "#FF6B6B",
    info: "#74B9FF",
    background: "#0f1724",
    surface: "rgba(255,255,255,0.06)",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.7)",
    textTertiary: "rgba(255,255,255,0.6)",
    border: "rgba(255,255,255,0.12)",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
};

const PaymentScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const selectedCategory = useSelector(
    (state: RootState) => state.category.selectedCategory
  );
  const { stats, loading, refreshing, refresh } = usePaymentData();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [withdrawalDate, setWithdrawalDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState<
    "cash" | "bank" | "upi" | "cheque"
  >("cash");
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showHighAmountConfirm, setShowHighAmountConfirm] = useState(false);
  const [pendingHighAmount, setPendingHighAmount] = useState<number | null>(
    null
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modalSlideAnim = useRef(new Animated.Value(300)).current;

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
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (showRequestModal) {
      modalSlideAnim.setValue(300);
      Animated.spring(modalSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [showRequestModal, modalSlideAnim]);

  const balanceData = stats.balance;
  const transactions = stats.transactions;

  const handleRefresh = async () => {
    try {
      await refresh();
      Toast.show({
        type: "success",
        text1: t("common.refreshSuccess"),
      });
    } catch {
      Toast.show({
        type: "error",
        text1: t("common.error"),
      });
    }
  };

  const formatCurrency = (amount?: number) => {
    const v = amount ?? 0;
    return v.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string | Date) => {
    const d =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPaymentTypeColor = (type?: string) => {
    const map: any = {
      advance: theme.colors.info,
      final: theme.colors.success,
      bonus: theme.colors.warning,
      deduction: theme.colors.error,
    };
    return map[type?.toLowerCase()] ?? theme.colors.textSecondary;
  };

  const getPaymentTypeIcon = (type?: string) => {
    const map: any = {
      advance: "clock-outline",
      final: "check-circle",
      bonus: "gift",
      deduction: "minus-circle",
    };
    return map[type?.toLowerCase()] ?? "cash";
  };

  const getPaymentMethodIcon = (method?: string) => {
    const icons: any = {
      cash: "cash",
      bank: "bank",
      upi: "cellphone",
      cheque: "checkbook",
    };
    return icons[method?.toLowerCase()] ?? "cash";
  };

  const PAYMENT_METHODS = [
    { label: t("payment.cash"), value: "cash" as const },
    { label: t("payment.bank"), value: "bank" as const },
    { label: t("payment.upi"), value: "upi" as const },
    { label: t("payment.cheque"), value: "cheque" as const },
  ];

  const handleCloseModal = () => {
    Animated.timing(modalSlideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowRequestModal(false);
    });
  };

  const handleRequestPayment = async () => {
    if (!requestAmount || parseFloat(requestAmount) <= 0) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("common.invalidAmount"),
      });
      return;
    }

    const amount = parseFloat(requestAmount);
    const availableBalance =
      balanceData?.pendingBalance ?? balanceData?.remainingBalance ?? 0;

    if (amount > availableBalance) {
      setPendingHighAmount(amount);
      setShowHighAmountConfirm(true);
      return;
    }

    try {
      setSubmitting(true);
      await paymentApi.createPayment({
        category: selectedCategory,
        amount,
        paymentType: "final",
        paymentMethod: withdrawalMethod,
        note: requestNote || t("payment.recordPayment"),
        paymentDate: withdrawalDate,
      });

      Toast.show({
        type: "success",
        text1: t("payment.recordPayment"),
        text2: `${amount.toFixed(2)} ${t("payment.totalPaid")}`,
      });

      setRequestAmount("");
      setRequestNote("");
      setWithdrawalDate(new Date());
      handleCloseModal();
      refresh();
    } catch (error: any) {
      console.error("Request payment error", error);
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: error?.response?.data?.message ?? t("common.tryAgain"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmHighAmount = async () => {
    if (!pendingHighAmount) {
      setShowHighAmountConfirm(false);
      return;
    }

    const amount = pendingHighAmount;
    try {
      setSubmitting(true);
      setShowHighAmountConfirm(false);
      await paymentApi.createPayment({
        category: selectedCategory,
        amount,
        paymentType: "final",
        paymentMethod: withdrawalMethod,
        note:
          requestNote ||
          `${t("payment.recordPayment")} (${t("payment.overBalance")})`,
        paymentDate: withdrawalDate,
      });

      Toast.show({
        type: "success",
        text1: t("payment.recordPayment"),
        text2: `${amount.toFixed(2)} ${t("payment.totalPaid")}`,
      });

      setRequestAmount("");
      setRequestNote("");
      setWithdrawalDate(new Date());
      handleCloseModal();
      setPendingHighAmount(null);
      refresh();
    } catch (error: any) {
      console.error("High amount withdrawal error", error);
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: error?.response?.data?.message ?? t("common.tryAgain"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    Alert.alert(t("common.delete"), t("common.deleteConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await paymentApi.deletePayment(id);
            Toast.show({
              type: "success",
              text1: t("common.deleted"),
            });
            refresh();
          } catch (error: any) {
            console.error("Delete error", error);
            Toast.show({
              type: "error",
              text1: t("common.error"),
              text2: error?.response?.data?.message ?? t("common.tryAgain"),
            });
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: (insets.top ?? 0) + 10 }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.userName}>{t("payment.payments")}</Text>
          <Text style={styles.greeting}>{t("payment.managePayments")}</Text>
        </View>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => (navigation as any).navigate("ProfileMain")}
          accessibilityLabel={t("common.profile")}
        >
          <Icon name="account" size={moderateScale(22)} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Payment Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("payment.payments")}</Text>
              {/* <View style={styles.badge}>
                <Text style={styles.badgeText}>{transactions.length}</Text>
              </View> */}
              <TouchableOpacity
                style={styles.addWorkBtn}
                onPress={() => setShowRequestModal(true)}
              >
                <Icon name="plus" size={20} color="#fff" />
                <Text style={styles.addWorkText}>
                  {t("payment.recordPayment")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* LOADING STATE */}
            {loading && transactions.length === 0 && (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}

            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon
                  name="cash-remove"
                  size={64}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.emptyText}>{t("payment.noPayments")}</Text>
              </View>
            ) : (
              transactions.map((transaction: any) => (
                <TouchableOpacity
                  key={transaction._id ?? transaction.id}
                  style={styles.transactionCard}
                  activeOpacity={0.7}
                  onLongPress={() =>
                    handleDeleteTransaction(transaction._id ?? transaction.id!)
                  }
                >
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        {
                          backgroundColor: `${getPaymentTypeColor(
                            transaction.paymentType
                          )}20`,
                        },
                      ]}
                    >
                      <Icon
                        name={getPaymentTypeIcon(transaction.paymentType)}
                        size={20}
                        color={getPaymentTypeColor(transaction.paymentType)}
                      />
                    </View>

                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionType}>
                        {t(
                          `payment.${
                            transaction.paymentType?.toLowerCase() as any
                          }`,
                          t("payment.amount")
                        )}
                      </Text>
                      <View style={styles.transactionMeta}>
                        <Icon
                          name={getPaymentMethodIcon(transaction.paymentMethod)}
                          size={12}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.transactionDate}>
                          {formatDate(transaction.paymentDate)}
                        </Text>
                      </View>
                      {transaction.paidBy ? (
                        <Text style={styles.paidBy}>
                          {t("payment.paidBy")}: {transaction.paidBy}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>
                      ₹{formatCurrency(transaction.amount)}
                    </Text>
                    <View
                      style={[
                        styles.transactionStatus,
                        {
                          backgroundColor: `${getPaymentTypeColor(
                            transaction.paymentType
                          )}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.transactionStatusText,
                          {
                            color: getPaymentTypeColor(transaction.paymentType),
                          },
                        ]}
                      >
                        {
                          PAYMENT_METHODS.find(
                            (m) =>
                              m.value.toLowerCase() ===
                              transaction.paymentMethod.toLowerCase()
                          )?.label
                        }
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        visible={showRequestModal}
        onClose={handleCloseModal}
        t={t}
        theme={theme}
        modalSlideAnim={modalSlideAnim}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        withdrawalDate={withdrawalDate}
        setWithdrawalDate={setWithdrawalDate}
        balanceData={balanceData}
        PAYMENT_METHODS={PAYMENT_METHODS}
        withdrawalMethod={withdrawalMethod}
        setShowMethodModal={setShowMethodModal}
        requestAmount={requestAmount}
        setRequestAmount={setRequestAmount}
        requestNote={requestNote}
        setRequestNote={setRequestNote}
        submitting={submitting}
        handleRequestPayment={handleRequestPayment}
        formatCurrency={formatCurrency}
      />

      {/* Payment Method Selection Modal */}
      <Modal
        visible={showMethodModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMethodModal(false)}
      >
        <Pressable
          style={styles.methodModalOverlay}
          onPress={() => setShowMethodModal(false)}
        >
          <View style={styles.methodModalContent}>
            <Text style={styles.methodModalTitle}>
              {t("payment.selectMethod")}
            </Text>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.methodOption,
                  withdrawalMethod === method.value &&
                    styles.methodOptionActive,
                ]}
                onPress={() => {
                  setWithdrawalMethod(method.value);
                  setShowMethodModal(false);
                }}
              >
                <Icon
                  name={
                    method.value === "cash"
                      ? "cash"
                      : method.value === "bank"
                      ? "bank"
                      : method.value === "upi"
                      ? "cellphone"
                      : "checkbook"
                  }
                  size={24}
                  color={
                    withdrawalMethod === method.value
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.methodOptionText,
                    withdrawalMethod === method.value &&
                      styles.methodOptionTextActive,
                  ]}
                >
                  {method.label}
                </Text>
                {withdrawalMethod === method.value && (
                  <Icon
                    name="check-circle"
                    size={20}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* High Amount Confirmation Modal */}
      <Modal
        visible={showHighAmountConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHighAmountConfirm(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Icon
              name="alert-circle"
              size={48}
              color={theme.colors.warning}
              style={{ marginBottom: theme.spacing.lg }}
            />
            <Text style={styles.confirmModalTitle}>
              {t("payment.overBalance")}
            </Text>
            <Text style={styles.confirmModalText}>
              {t("common.highAmountWarning", {
                amount: pendingHighAmount?.toFixed(2) ?? "0.00",
                balance: formatCurrency(
                  balanceData?.pendingBalance ?? balanceData?.remainingBalance
                ),
              })}
            </Text>
            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={styles.confirmModalCancelBtn}
                onPress={() => {
                  setShowHighAmountConfirm(false);
                  setPendingHighAmount(null);
                }}
              >
                <Text style={styles.confirmModalCancelText}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmModalConfirmBtn}
                onPress={handleConfirmHighAmount}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmModalConfirmText}>
                    {t("common.confirm")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(12),
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  userName: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    color: theme.colors.text,
  },
  greeting: {
    fontSize: moderateScale(13),
    color: theme.colors.textSecondary,
    marginTop: verticalScale(2),
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
  scrollContent: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.sm,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  addWorkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
  },
  addWorkText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  paidBy: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: theme.spacing.sm,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  transactionStatus: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.sm,
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.xxl * 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
  },

  // Payment Method Modal Styles
  methodModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  methodModalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: moderateScale(16),
    padding: scale(20),
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  methodModalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: verticalScale(16),
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    padding: scale(14),
    borderRadius: moderateScale(12),
    backgroundColor: theme.colors.surface,
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  methodOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  methodOptionText: {
    flex: 1,
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: theme.colors.text,
  },
  methodOptionTextActive: {
    color: theme.colors.primary,
  },

  // Confirmation Modal Styles
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  confirmModalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: moderateScale(16),
    padding: scale(24),
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  confirmModalTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: verticalScale(12),
    textAlign: "center",
  },
  confirmModalText: {
    fontSize: moderateScale(14),
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: verticalScale(24),
  },
  confirmModalActions: {
    flexDirection: "row",
    gap: scale(12),
    width: "100%",
  },
  confirmModalCancelBtn: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  confirmModalCancelText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: theme.colors.text,
  },
  confirmModalConfirmBtn: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  confirmModalConfirmText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#fff",
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
});

export default PaymentScreen;
