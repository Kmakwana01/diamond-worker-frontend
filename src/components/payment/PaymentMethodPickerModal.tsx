// components/payment/PaymentMethodPickerModal.tsx
import React, { memo, useCallback, useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../styles/workTheme";

export type PaymentMethodType = "cash" | "bank" | "upi" | "cheque";

interface PaymentMethodPickerModalProps {
  visible: boolean;
  selectedMethod: PaymentMethodType;
  onClose: () => void;
  onSelect: (method: PaymentMethodType) => void;
}

const PaymentMethodPickerModal: React.FC<PaymentMethodPickerModalProps> = memo(
  ({ visible, selectedMethod, onClose, onSelect }) => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [tempMethod, setTempMethod] =
      useState<PaymentMethodType>(selectedMethod);
    const slideAnim = useRef(new Animated.Value(300)).current;

    const paymentMethods = [
      {
        label: t("payment.cash") || "Cash",
        value: "cash" as const,
        icon: "cash",
      },
      {
        label: t("payment.bank") || "Bank Transfer",
        value: "bank" as const,
        icon: "bank",
      },
      {
        label: t("payment.upi") || "UPI",
        value: "upi" as const,
        icon: "cellphone",
      },
      {
        label: t("payment.cheque") || "Cheque",
        value: "cheque" as const,
        icon: "checkbook",
      },
    ];

    const animateIn = useCallback(() => {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 10,
      }).start();
    }, [slideAnim]);

    const animateOut = useCallback(
      (callback?: () => void) => {
        Animated.timing(slideAnim, {
          toValue: 270,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          callback && callback();
        });
      },
      [slideAnim]
    );

    useEffect(() => {
      if (visible) {
        setTempMethod(selectedMethod);
        slideAnim.setValue(300);
        animateIn();
      }
    }, [visible, selectedMethod, animateIn, slideAnim]);

    const handleClose = useCallback(() => {
      animateOut(onClose);
    }, [animateOut, onClose]);

    const handleConfirm = useCallback(() => {
      animateOut(() => {
        onSelect(tempMethod);
        onClose();
      });
    }, [animateOut, tempMethod, onSelect, onClose]);

    const selectedMethodData = paymentMethods.find(
      (m) => m.value === tempMethod
    );

    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Animated.View
            style={[
              styles.container,
              {
                paddingBottom: Math.max(insets.bottom, 16),
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Icon
                    name="credit-card-outline"
                    size={35}
                    color={theme.colors.primary}
                  />
                  <View>
                    <Text style={styles.title}>
                      {t("payment.selectPaymentMethod") ||
                        "Select Payment Method"}
                    </Text>
                    <Text style={styles.subtitle}>
                      {selectedMethodData?.label || "Cash"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="close" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Methods */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  {t("payment.paymentMethod") || "PAYMENT METHOD"}
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={paymentMethods}
                  keyExtractor={(item) => item.value}
                  contentContainerStyle={styles.scrollContent}
                  renderItem={({ item }) => {
                    const isSelected = item.value === tempMethod;
                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[
                          styles.methodItem,
                          isSelected && styles.methodItemActive,
                        ]}
                        onPress={() => setTempMethod(item.value)}
                      >
                        <Icon
                          name={item.icon}
                          size={28}
                          color={
                            isSelected ? "#fff" : theme.colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.methodText,
                            isSelected && styles.methodTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>
                    {t("common.cancel") || "Cancel"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Icon name="check" size={18} color="#fff" />
                  <Text style={styles.confirmText}>
                    {t("common.confirm") || "Confirm"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    );
  }
);

PaymentMethodPickerModal.displayName = "PaymentMethodPickerModal";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingTop: verticalScale(16),
    paddingHorizontal: scale(16),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: "800",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: moderateScale(12),
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: verticalScale(16),
  },
  sectionLabel: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginBottom: verticalScale(10),
    letterSpacing: 0.8,
  },
  scrollContent: {
    gap: scale(10),
    paddingRight: scale(16),
  },
  methodItem: {
    width: scale(100),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(10),
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: verticalScale(8),
  },
  methodItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  methodText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
  },
  methodTextActive: {
    color: "#fff",
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: scale(10),
    marginBottom: verticalScale(12),
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: theme.colors.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(6),
  },
  confirmText: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#fff",
  },
});

export default PaymentMethodPickerModal;
