// RecordPaymentModal.tsx - Compact UI Version
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PaymentMethod = "cash" | "bank" | "upi" | "cheque";

type Props = {
  visible: boolean;
  onClose: () => void;
  t: (k: string) => string;
  theme: any;
  modalSlideAnim: Animated.Value;
  showDatePicker: boolean;
  setShowDatePicker: (v: boolean) => void;
  withdrawalDate: Date;
  setWithdrawalDate: (d: Date) => void;
  balanceData: any;
  PAYMENT_METHODS: { label: string; value: PaymentMethod }[];
  withdrawalMethod: PaymentMethod;
  setShowMethodModal: (v: boolean) => void;
  requestAmount: string;
  setRequestAmount: (v: string) => void;
  requestNote: string;
  setRequestNote: (v: string) => void;
  submitting: boolean;
  handleRequestPayment: () => void;
  formatCurrency: (n?: number) => string;
};

const paymentMethodIconMap: Record<PaymentMethod, string> = {
  cash: "cash",
  bank: "bank",
  upi: "cellphone",
  cheque: "checkbook",
};

const RecordPaymentModal: React.FC<Props> = ({
  visible,
  onClose,
  t,
  theme,
  modalSlideAnim,
  showDatePicker,
  setShowDatePicker,
  withdrawalDate,
  setWithdrawalDate,
  balanceData,
  PAYMENT_METHODS,
  withdrawalMethod,
  setShowMethodModal,
  requestAmount,
  setRequestAmount,
  requestNote,
  setRequestNote,
  submitting,
  handleRequestPayment,
  formatCurrency,
}) => {
  const insets = useSafeAreaInsets();

  const handleBackdropPress = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) setWithdrawalDate(date);
  };

  if (!visible) return null;

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.modalOverlay} onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                paddingBottom: Math.max(insets.bottom, verticalScale(12)),
                transform: [
                  {
                    translateY: modalSlideAnim,
                  },
                ],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Compact Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: `${theme.colors.primary}20` },
                    ]}
                  >
                    <Icon
                      name="cash-multiple"
                      size={moderateScale(20)}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>
                      {t("payment.recordPayment")}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {t("payment.managePayments")}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="close"
                    size={moderateScale(18)}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {/* Compact Balance Card */}
                <View style={styles.balanceCard}>
                  <View
                    style={[
                      styles.balanceIconBox,
                      { backgroundColor: `${theme.colors.success}20` },
                    ]}
                  >
                    <Icon
                      name="wallet"
                      size={moderateScale(20)}
                      color={theme.colors.success}
                    />
                  </View>
                  <View style={styles.balanceContent}>
                    <Text style={styles.balanceLabel}>
                      {t("payment.balance")}
                    </Text>
                    <Text style={styles.balanceValue}>
                      ₹
                      {formatCurrency(
                        balanceData?.pendingBalance ??
                          balanceData?.remainingBalance ??
                          0
                      )}
                    </Text>
                  </View>
                </View>

                {/* Compact Amount Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    {t("payment.amount").toUpperCase()}
                  </Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={requestAmount}
                      onChangeText={setRequestAmount}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textSecondary}
                      returnKeyType="done"
                    />
                  </View>
                </View>

                {/* Compact Date Picker */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t("payment.paymentDate").toUpperCase()}</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.dateInput}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateLeft}>
                      <View
                        style={[
                          styles.dateIconBox,
                          { backgroundColor: `${theme.colors.primary}15` },
                        ]}
                      >
                        <Icon
                          name="calendar"
                          size={moderateScale(16)}
                          color={theme.colors.primary}
                        />
                      </View>
                      <Text style={styles.dateText}>
                        {withdrawalDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <Icon
                      name="chevron-right"
                      size={moderateScale(18)}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={withdrawalDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </View>

                {/* Compact Payment Method */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    {t("payment.paymentMethod").toUpperCase()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowMethodModal(true)}
                    style={styles.dateInput}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateLeft}>
                      <View
                        style={[
                          styles.dateIconBox,
                          { backgroundColor: `${theme.colors.primary}15` },
                        ]}
                      >
                        <Icon
                          name={paymentMethodIconMap[withdrawalMethod]}
                          size={moderateScale(16)}
                          color={theme.colors.primary}
                        />
                      </View>
                      <Text style={styles.dateText}>
                        {
                          PAYMENT_METHODS.find(
                            (m) => m.value === withdrawalMethod
                          )?.label
                        }
                      </Text>
                    </View>
                    <Icon
                      name="chevron-right"
                      size={moderateScale(18)}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Compact Note Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t("payment.note").toUpperCase()}</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={requestNote}
                    onChangeText={setRequestNote}
                    placeholder={t("payment.note")}
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>

                {/* Compact Submit Button */}
                <TouchableOpacity
                  onPress={handleRequestPayment}
                  disabled={submitting || !requestAmount}
                  style={[
                    styles.submitButton,
                    (submitting || !requestAmount) && styles.submitButtonDisabled,
                  ]}
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon
                        name="check-circle"
                        size={moderateScale(18)}
                        color="#fff"
                      />
                      <Text style={styles.submitButtonText}>
                        {t("payment.recordPayment")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.85)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
      borderTopWidth: 2,
      borderTopColor: theme.colors.primary,
      paddingTop: verticalScale(12),
      paddingHorizontal: scale(14),
      maxHeight: "85%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: verticalScale(12),
      paddingBottom: verticalScale(8),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
    },
    categoryIcon: {
      width: moderateScale(36),
      height: moderateScale(36),
      borderRadius: moderateScale(9),
      alignItems: "center",
      justifyContent: "center",
    },
    modalTitle: {
      fontSize: moderateScale(16),
      fontWeight: "800",
      color: theme.colors.text,
    },
    modalSubtitle: {
      fontSize: moderateScale(11),
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    closeButton: {
      width: moderateScale(28),
      height: moderateScale(28),
      borderRadius: moderateScale(14),
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    scrollContent: {
      paddingBottom: verticalScale(16),
    },
    balanceCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
      padding: scale(12),
      borderRadius: moderateScale(10),
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: verticalScale(16),
    },
    balanceIconBox: {
      width: moderateScale(38),
      height: moderateScale(38),
      borderRadius: moderateScale(19),
      alignItems: "center",
      justifyContent: "center",
    },
    balanceContent: {
      flex: 1,
    },
    balanceLabel: {
      fontSize: moderateScale(11),
      color: theme.colors.textSecondary,
      marginBottom: verticalScale(1),
    },
    balanceValue: {
      fontSize: moderateScale(16),
      fontWeight: "700",
      color: theme.colors.text,
    },
    fieldGroup: {
      marginBottom: verticalScale(14),
    },
    label: {
      fontSize: moderateScale(11),
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: verticalScale(6),
      letterSpacing: 0.5,
    },
    amountInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: moderateScale(10),
      paddingHorizontal: scale(12),
      minHeight: verticalScale(44),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    currencySymbol: {
      fontSize: moderateScale(16),
      fontWeight: "700",
      color: theme.colors.primary,
      marginRight: scale(6),
    },
    amountInput: {
      flex: 1,
      fontSize: moderateScale(15),
      color: theme.colors.text,
      fontWeight: "600",
      paddingVertical: 0,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: moderateScale(10),
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(30),
      fontSize: moderateScale(13),
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    textArea: {
      minHeight: verticalScale(56),
      textAlignVertical: "top",
      paddingTop: verticalScale(10),
    },
    dateInput: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: moderateScale(10),
      paddingVertical: verticalScale(6),
      paddingHorizontal: scale(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dateLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
      flex: 1,
    },
    dateIconBox: {
      width: moderateScale(36),
      height: moderateScale(36),
      borderRadius: moderateScale(18),
      alignItems: "center",
      justifyContent: "center",
    },
    dateText: {
      fontSize: moderateScale(14),
      color: theme.colors.text,
      fontWeight: "600",
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: moderateScale(10),
      paddingVertical: verticalScale(12),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(6),
      marginTop: verticalScale(4),
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      fontSize: moderateScale(14),
      fontWeight: "700",
      color: "#fff",
    },
  });

export default RecordPaymentModal;
