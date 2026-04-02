import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  Keyboard,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import workApi from "../../api/workApi";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import theme from "../../styles/dashboard";
import { getCategoryStatsConfig } from "../../config/categoryStatsConfig";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AddWorkModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  [key: string]: string | number;
}

const AddWorkModal: React.FC<AddWorkModalProps> = memo(
  ({ visible, onClose, onSuccess }) => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { selectedCategory } = useSelector(
      (state: RootState) => state.category
    );

    // Get category-specific configuration
    const categoryConfig = useMemo(
      () => getCategoryStatsConfig(selectedCategory),
      [selectedCategory]
    );
    const fields = categoryConfig.fields;

    // State management
    const [formData, setFormData] = useState<FormData>({});
    const [workDate, setWorkDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initialize form with default values
    useEffect(() => {
      if (!visible || !categoryConfig) return;

      const defaultValues: FormData = {};

      Object.keys(fields).forEach((fieldKey) => {
        const field = fields[fieldKey];
        if (
          field.type === "select" &&
          Array.isArray(field.options) &&
          field.options.length > 0
        ) {
          defaultValues[fieldKey] = field.options[0];
        }
      });

      setFormData(defaultValues);
    }, [visible, selectedCategory, categoryConfig, fields]);

    // Calculate total earnings dynamically
    const calculateTotal = useCallback(() => {
      try {
        switch (selectedCategory) {
          case "DIAMOND":
            return (
              (parseFloat(String(formData.pieceCount)) || 0) *
              (parseFloat(String(formData.ratePerPiece)) || 0)
            );

          case "CARPENTER":
            return (
              (parseFloat(String(formData.itemsProduced)) || 0) *
              (parseFloat(String(formData.ratePerItem)) || 0)
            );

          case "PLUMBER":
            return Math.max(
              0,
              (parseFloat(String(formData.ratePerJob)) || 0) -
                (parseFloat(String(formData.materialCost)) || 0)
            );

          case "MASON":
            return Math.max(
              0,
              (parseFloat(String(formData.dayWage)) || 0) -
                (parseFloat(String(formData.materialCost)) || 0)
            );

          default:
            return 0;
        }
      } catch (error) {
        console.error("Error calculating total:", error);
        return 0;
      }
    }, [selectedCategory, formData]);

    const totalEarnings = useMemo(() => calculateTotal(), [calculateTotal]);

    // Parse form data by field type
    const parseFormDataByFieldType = useCallback(() => {
      const parsedData: FormData = {};

      Object.keys(fields).forEach((key) => {
        const fieldConfig = fields[key];
        const value = formData[key];

        if (value === undefined || value === null || value === "") {
          parsedData[key] = value;
          return;
        }

        if (fieldConfig.type === "number" || fieldConfig.type === "decimal") {
          parsedData[key] = Number(value);
        } else {
          parsedData[key] = value;
        }
      });

      return parsedData;
    }, [fields, formData]);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
      // Validate required fields
      const requiredFields = Object.keys(fields).filter(
        (key) => fields[key].required
      );

      const missingFields = requiredFields.filter(
        (key) => !formData[key] || formData[key] === ""
      );

      if (missingFields.length > 0) {
        Toast.show({
          type: "error",
          text1: t("common.error"),
          text2: `${t("work.missingFields")}: ${missingFields
            .map((f) => t(fields[f].labelKey)) // FIXED: Use labelKey with translation
            .join(", ")}`,
        });
        return;
      }

      setLoading(true);
      Keyboard.dismiss();

      try {
        const parsedFormData = parseFormDataByFieldType();

        const workEntryData = {
          ...parsedFormData,
          category: selectedCategory,
          workDate: workDate.toISOString(),
          totalEarnings,
        };

        console.log("📤 Submitting work entry:", workEntryData);

        await workApi.createWorkEntry(workEntryData);

        Toast.show({
          type: "success",
          text1: t("work.addSuccess"),
        });

        // Reset form
        setFormData({});
        setWorkDate(new Date());
        onSuccess();
        onClose();
      } catch (error: any) {
        console.error("❌ Work entry error:", error);
        Toast.show({
          type: "error",
          text1: t("work.addFailed"),
          text2: error?.response?.data?.message || t("common.tryAgain"),
        });
      } finally {
        setLoading(false);
      }
    }, [
      fields,
      formData,
      t,
      parseFormDataByFieldType,
      selectedCategory,
      workDate,
      totalEarnings,
      onSuccess,
      onClose,
    ]);

    // Update form field
    const updateField = useCallback(
      (fieldName: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
      },
      []
    );

    // Handle date change
    const handleDateChange = useCallback((event: any, date?: Date) => {
      setShowDatePicker(false);
      if (date) setWorkDate(date);
    }, []);

    // Render select field
    const renderSelectField = useCallback(
      (fieldName: string, fieldConfig: any) => (
        <View key={fieldName} style={styles.fieldGroup}>
          <Text style={styles.label}>{t(fieldConfig.labelKey)}</Text>
          <View style={styles.chipContainer}>
            {fieldConfig.options?.map((option: string) => (
              <Pressable
                key={option}
                style={[
                  styles.chip,
                  formData[fieldName] === option && styles.chipActive,
                ]}
                onPress={() => updateField(fieldName, option)}
                android_ripple={{ color: theme.colors.primary }}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData[fieldName] === option && styles.chipTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ),
      [formData, updateField, t]
    );

    // Render input field
    const renderInputField = useCallback(
      (fieldName: string, fieldConfig: any) => (
        <View key={fieldName} style={styles.fieldGroup}>
          <Text style={styles.label}>{t(fieldConfig.labelKey)}</Text>
          <TextInput
            style={styles.input}
            placeholder={t(fieldConfig.placeholderKey)} // Use translated label as placeholder
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType={
              fieldConfig.type === "number" ? "numeric" : "decimal-pad"
            }
            value={formData[fieldName]?.toString() || ""}
            onChangeText={(text) => updateField(fieldName, text)}
            returnKeyType="done"
            maxLength={10}
          />
        </View>
      ),
      [formData, updateField, t]
    );

    // Render field based on type
    const renderField = useCallback(
      (fieldName: string) => {
        const fieldConfig = fields[fieldName];

        if (fieldConfig.type === "select") {
          return renderSelectField(fieldName, fieldConfig);
        }

        return renderInputField(fieldName, fieldConfig);
      },
      [fields, renderSelectField, renderInputField]
    );

    // Handle backdrop press
    const handleBackdropPress = useCallback(() => {
      Keyboard.dismiss();
      onClose();
    }, [onClose]);

    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <Pressable style={styles.modalOverlay} onPress={handleBackdropPress}>
            <Pressable
              style={[
                styles.modalContent,
                {
                  paddingBottom: Math.max(insets.bottom, 16),
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: `${categoryConfig.color}20` },
                    ]}
                  >
                    <Icon
                      name={categoryConfig.icon}
                      size={24}
                      color={categoryConfig.color}
                    />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>{t("work.addWork")}</Text>
                    <Text style={styles.modalSubtitle}>
                      {categoryConfig.quantityLabel}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {/* Date Picker */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t("common.date")}</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dateText}>
                      {workDate.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                    <Icon
                      name="calendar"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={workDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}

                {/* Dynamic Fields */}
                {Object.keys(fields).map(renderField)}

                {/* Total Display */}
                {Object.keys(formData).length > 0 && (
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>
                      {t("work.totalEarnings")}
                    </Text>
                    <Text style={styles.totalValue}>
                      ₹{totalEarnings.toFixed(2)}
                    </Text>
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="check" size={20} color="#fff" />
                      <Text style={styles.submitButtonText}>
                        {t("common.submit")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
);

AddWorkModal.displayName = "AddWorkModal";

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingTop: verticalScale(14),
    paddingHorizontal: scale(16),
    maxHeight: "88%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(14),
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },

  categoryIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
  },

  modalTitle: {
    fontSize: moderateScale(17),
    fontWeight: "800",
    color: theme.colors.text,
  },

  modalSubtitle: {
    fontSize: moderateScale(12),
    color: theme.colors.textSecondary,
    marginTop: 1,
  },

  closeButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingBottom: verticalScale(20),
  },

  fieldGroup: {
    marginBottom: verticalScale(14),
  },

  label: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: verticalScale(6),
  },

  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    fontSize: moderateScale(14),
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  dateText: {
    fontSize: moderateScale(14),
    color: theme.colors.text,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(6),
  },

  chip: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  chipText: {
    fontSize: moderateScale(13),
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },

  chipTextActive: {
    color: "#fff",
  },

  totalContainer: {
    backgroundColor: `${theme.colors.success}20`,
    borderRadius: moderateScale(10),
    padding: scale(12),
    marginBottom: verticalScale(14),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: moderateScale(14),
    color: theme.colors.text,
    fontWeight: "600",
  },

  totalValue: {
    fontSize: moderateScale(20),
    fontWeight: "800",
    color: theme.colors.success,
  },

  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#fff",
  },
});

export default AddWorkModal;
