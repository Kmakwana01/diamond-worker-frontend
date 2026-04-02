import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { BlurView } from "expo-blur";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { theme } from "../../styles/workTheme";
import { useTranslation } from "react-i18next";

interface DateRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
}

const DateRangeModal: React.FC<DateRangeModalProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleApply = () => {
    onApply(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={90} tint="dark" style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={onClose}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{t('reports.dateRange.customDateRange')}</Text>
                <Text style={styles.subtitle}>{t('reports.dateRange.selectDateRange')}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Icon name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* ONE ROW - OLD STYLE INPUTS */}
            <View style={styles.rowContainer}>
              <TouchableOpacity style={styles.oldInput} onPress={() => setShowStartPicker(true)}>
                <Text style={styles.oldLabel}>{t('reports.dateRange.startDate')}</Text>
                <Text style={styles.oldValue}>{startDate.toLocaleDateString('en-IN')}</Text>
              </TouchableOpacity>

              <View style={styles.arrowWrap}>
                <Icon name="arrow-right" size={22} color={theme.colors.textSecondary} />
              </View>

              <TouchableOpacity style={styles.oldInput} onPress={() => setShowEndPicker(true)}>
                <Text style={styles.oldLabel}>{t('reports.dateRange.endDate')}</Text>
                <Text style={styles.oldValue}>{endDate.toLocaleDateString('en-IN')}</Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoBanner}>
              <Icon name="information" size={16} color={theme.colors.primary} />
              <Text style={styles.infoText}>{t('reports.dateRange.infoText')}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.applyButton]} onPress={handleApply}>
                <Icon name="check" size={18} color="#fff" />
                <Text style={styles.applyButtonText}>{t('common.apply')}</Text>
              </TouchableOpacity>
            </View>

            {/* Date Pickers */}
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowStartPicker(Platform.OS === 'ios');
                  if (date) setStartDate(date);
                }}
                maximumDate={endDate}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowEndPicker(Platform.OS === 'ios');
                  if (date) setEndDate(date);
                }}
                minimumDate={startDate}
                maximumDate={new Date()}
              />
            )}
          </View>
        </TouchableOpacity>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: moderateScale(13),
    color: theme.colors.textSecondary,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ONE ROW OLD STYLE
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  oldInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  oldLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  oldValue: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
  },
  arrowWrap: {
    marginHorizontal: theme.spacing.sm,
    paddingTop: verticalScale(10),
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
    marginBottom: theme.spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(12),
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    gap: theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: theme.colors.text,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
  },
  applyButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#fff',
  },
});

export default DateRangeModal;
