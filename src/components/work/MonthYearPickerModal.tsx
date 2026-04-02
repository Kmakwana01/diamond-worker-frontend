import React, { memo, useCallback, useMemo, useRef, useState } from "react";
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
import { theme } from "../../styles/workTheme";

interface MonthYearPickerModalProps {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

const MonthYearPickerModal: React.FC<MonthYearPickerModalProps> = memo(
  ({ visible, selectedDate, onClose, onSelect }) => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [tempMonth, setTempMonth] = useState(selectedDate.getMonth());
    const [tempYear, setTempYear] = useState(selectedDate.getFullYear());
    const slideAnim = useRef(new Animated.Value(300)).current;

    const years = useMemo(() => {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 6 }, (_, i) => currentYear - i);
    }, []);

    const monthNames = useMemo(
      () => [
        t('common.january', 'January'),
        t('common.february', 'February'),
        t('common.march', 'March'),
        t('common.april', 'April'),
        t('common.may', 'May'),
        t('common.june', 'June'),
        t('common.july', 'July'),
        t('common.august', 'August'),
        t('common.september', 'September'),
        t('common.october', 'October'),
        t('common.november', 'November'),
        t('common.december', 'December'),
      ],
      [t]
    );

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
          if (callback) callback();
        });
      },
      [slideAnim]
    );

    React.useEffect(() => {
      if (visible) {
        setTempMonth(selectedDate.getMonth());
        setTempYear(selectedDate.getFullYear());
        slideAnim.setValue(300);
        animateIn();
      }
    }, [visible, selectedDate, animateIn, slideAnim]);

    const handleClose = useCallback(() => {
      animateOut(() => {
        setTimeout(onClose, 50);
      });
    }, [animateOut, onClose]);

    const handleJumpToCurrent = useCallback(() => {
      const now = new Date();
      setTempMonth(now.getMonth());
      setTempYear(now.getFullYear());
    }, []);

    const handleConfirm = useCallback(() => {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(tempYear);
      newDate.setMonth(tempMonth);
      animateOut(() => {
        setTimeout(() => {
          onSelect(newDate);
          onClose();
        }, 50);
      });
    }, [tempMonth, tempYear, selectedDate, onSelect, onClose, animateOut]);

    const isCurrentMonth = useMemo(() => {
      const now = new Date();
      return tempMonth === now.getMonth() && tempYear === now.getFullYear();
    }, [tempMonth, tempYear]);

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
                  <Icon name="calendar-range" size={35} color={theme.colors.primary} />
                  <View>
                    <Text style={styles.title}>{t('common.selectMonthYear', 'Select Month & Year')}</Text>
                    <Text style={styles.subtitle}>
                      {monthNames[tempMonth]} {tempYear}
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

              {/* Current Month Button */}
              {!isCurrentMonth && (
                <TouchableOpacity
                  style={styles.jumpBtn}
                  onPress={handleJumpToCurrent}
                  activeOpacity={0.7}
                >
                  <Icon name="calendar-today" size={14} color={theme.colors.primary} />
                  <Text style={styles.jumpText}>{t('common.jumpToCurrentMonth', 'Jump to Current Month')}</Text>
                </TouchableOpacity>
              )}

              {/* Months Scroll */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{t('common.month', 'MONTH')}</Text>
                <FlatList
                  data={monthNames}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(_, idx) => idx.toString()}
                  initialScrollIndex={tempMonth}
                  getItemLayout={(_, index) => ({
                    length: scale(100),
                    offset: scale(100) * index,
                    index,
                  })}
                  contentContainerStyle={styles.scrollContent}
                  renderItem={({ item, index }) => {
                    const isSelected = index === tempMonth;
                    return (
                      <TouchableOpacity
                        style={[styles.monthItem, isSelected && styles.monthItemActive]}
                        onPress={() => setTempMonth(index)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.monthText,
                            isSelected && styles.monthTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              {/* Years Scroll */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{t('common.year', 'YEAR')}</Text>
                <FlatList
                  data={years}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.toString()}
                  contentContainerStyle={styles.scrollContent}
                  renderItem={({ item }) => {
                    const isSelected = item === tempYear;
                    return (
                      <TouchableOpacity
                        style={[styles.yearItem, isSelected && styles.yearItemActive]}
                        onPress={() => setTempYear(item)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.yearText,
                            isSelected && styles.yearTextActive,
                          ]}
                        >
                          {item}
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
                  <Text style={styles.cancelText}>{t('common.cancel', 'Cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Icon name="check" size={18} color="#fff" />
                  <Text style={styles.confirmText}>{t('common.confirm', 'Confirm')}</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    );
  }
);

MonthYearPickerModal.displayName = 'MonthYearPickerModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingTop: verticalScale(16),
    paddingHorizontal: scale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: '800',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  jumpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    backgroundColor: theme.colors.primary + '15',
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  jumpText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: theme.colors.primary,
  },
  section: {
    marginBottom: verticalScale(16),
  },
  sectionLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: verticalScale(10),
    letterSpacing: 0.8,
  },
  scrollContent: {
    gap: scale(10),
    paddingRight: scale(16),
  },
  monthItem: {
    width: scale(70),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(10),
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  monthItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  monthText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.text,
  },
  monthTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  yearItem: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(24),
    borderRadius: moderateScale(10),
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  yearItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  yearText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text,
  },
  yearTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: scale(10),
    marginBottom: verticalScale(12),
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(6),
  },
  confirmText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#fff',
  },
});

export default MonthYearPickerModal;
