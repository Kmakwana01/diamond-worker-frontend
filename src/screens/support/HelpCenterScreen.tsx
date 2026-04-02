import React, { memo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const theme = {
  colors: {
    primary: '#6C5CE7',
    secondary: '#A29BFE',
    background: '#0f1724',
    surface: 'rgba(255,255,255,0.06)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,255,255,0.12)',
    success: '#00D9A3',
    error: '#FF6B6B',
    warning: '#FFB800',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
  },
};

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: string;
}

interface ContactMethod {
  id: string;
  type: string;
  icon: string;
  title: string;
  value: string;
  action: () => void;
}

const HelpCenterScreen: React.FC = memo(() => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const FAQs: FAQItem[] = [
    {
      id: 'faq1',
      question: t('support.faq.addWorkQuestion'),
      answer: t('support.faq.addWorkAnswer'),
      icon: 'plus-circle',
    },
    {
      id: 'faq2',
      question: t('support.faq.viewPaymentsQuestion'),
      answer: t('support.faq.viewPaymentsAnswer'),
      icon: 'cash',
    },
    {
      id: 'faq3',
      question: t('support.faq.exportReportQuestion'),
      answer: t('support.faq.exportReportAnswer'),
      icon: 'download',
    },
    {
      id: 'faq4',
      question: t('support.faq.deleteWorkQuestion'),
      answer: t('support.faq.deleteWorkAnswer'),
      icon: 'delete',
    },
    {
      id: 'faq5',
      question: t('support.faq.changeLanguageQuestion'),
      answer: t('support.faq.changeLanguageAnswer'),
      icon: 'translate',
    },
  ];

  const contactMethods: ContactMethod[] = [
    {
      id: 'email',
      type: 'email',
      icon: 'email',
      title: t('support.contact.email'),
      value: 'kmakwana8232@gmail.com',
      action: () => handleEmailSupport(),
    },
    {
      id: 'phone',
      type: 'phone',
      icon: 'phone',
      title: t('support.contact.phone'),
      value: '+91 6355318232',
      action: () => handlePhoneSupport(),
    },
    // {
    //   id: 'website',
    //   type: 'website',
    //   icon: 'web',
    //   title: t('support.contact.website'),
    //   value: 'www.workerapp.com',
    //   action: () => handleWebsiteVisit(),
    // },
  ];

  const handleEmailSupport = async () => {
    const email = 'kmakwana8232@gmail.com';
    const subject = 'Support Request';
    const body = 'Hi, I need help with...';
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Clipboard.setStringAsync(email);
        Toast.show({
          type: 'success',
          text1: t('support.emailCopied'),
          text2: email,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('support.unableToOpenEmail'),
      });
    }
  };

  const handlePhoneSupport = async () => {
    const phoneNumber = '+916355318232';
    const url = `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Clipboard.setStringAsync(phoneNumber);
        Toast.show({
          type: 'success',
          text1: t('support.phoneCopied'),
          text2: phoneNumber,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('support.unableToCall'),
      });
    }
  };

  const handleWebsiteVisit = async () => {
    const url = 'https://www.workerapp.com';
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Toast.show({
          type: 'error',
          text1: t('support.unableToOpenWebsite'),
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
      });
    }
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={moderateScale(24)} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('support.helpCenter')}</Text>
          <Text style={styles.headerSubtitle}>{t('support.howCanWeHelp')}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: verticalScale(24) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('support.quickActions')}</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionCard} onPress={handleEmailSupport}>
                <View style={[styles.quickActionIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                  <Icon name="email-outline" size={moderateScale(24)} color={theme.colors.primary} />
                </View>
                <Text style={styles.quickActionText}>{t('support.emailUs')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard} onPress={handlePhoneSupport}>
                <View style={[styles.quickActionIcon, { backgroundColor: `${theme.colors.success}20` }]}>
                  <Icon name="phone-outline" size={moderateScale(24)} color={theme.colors.success} />
                </View>
                <Text style={styles.quickActionText}>{t('support.callUs')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('About' as never)}>
                <View style={[styles.quickActionIcon, { backgroundColor: `${theme.colors.warning}20` }]}>
                  <Icon name="information-outline" size={moderateScale(24)} color={theme.colors.warning} />
                </View>
                <Text style={styles.quickActionText}>{t('support.aboutApp')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('support.frequentlyAsked')}</Text>
            <View style={styles.faqContainer}>
              {FAQs.map((faq, index) => (
                <TouchableOpacity
                  key={faq.id}
                  style={[
                    styles.faqItem,
                    index === FAQs.length - 1 && styles.faqItemLast,
                  ]}
                  onPress={() => toggleFAQ(faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqHeader}>
                    <View style={styles.faqIconWrapper}>
                      <Icon name={faq.icon} size={moderateScale(20)} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <Icon
                      name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                      size={moderateScale(24)}
                      color={theme.colors.textSecondary}
                    />
                  </View>
                  {expandedFAQ === faq.id && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('support.contactUs')}</Text>
            <View style={styles.contactContainer}>
              {contactMethods.map((method, index) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.contactItem,
                    index === contactMethods.length - 1 && styles.contactItemLast,
                  ]}
                  onPress={method.action}
                  activeOpacity={0.7}
                >
                  <View style={[styles.contactIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                    <Icon name={method.icon} size={moderateScale(24)} color={theme.colors.primary} />
                  </View>
                  <View style={styles.contactContent}>
                    <Text style={styles.contactTitle}>{method.title}</Text>
                    <Text style={styles.contactValue}>{method.value}</Text>
                  </View>
                  <Icon name="chevron-right" size={moderateScale(24)} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Help Note */}
          <View style={styles.helpNote}>
            <Icon name="information" size={moderateScale(20)} color={theme.colors.warning} />
            <Text style={styles.helpNoteText}>{t('support.responseTime')}</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(12),
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: moderateScale(8),
  },
  headerContent: {
    flex: 1,
    marginLeft: scale(12),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: verticalScale(12),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(12),
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: moderateScale(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickActionIcon: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
  },
  quickActionText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  faqContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
  },
  faqIconWrapper: {
    marginRight: scale(12),
  },
  faqQuestion: {
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text,
  },
  faqAnswer: {
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(16),
    paddingLeft: moderateScale(48),
  },
  faqAnswerText: {
    fontSize: moderateScale(13),
    color: theme.colors.textSecondary,
    lineHeight: moderateScale(20),
  },
  contactContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contactItemLast: {
    borderBottomWidth: 0,
  },
  contactIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: moderateScale(12),
    color: theme.colors.textSecondary,
  },
  helpNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.warning}15`,
    padding: moderateScale(16),
    borderRadius: theme.radii.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  helpNoteText: {
    flex: 1,
    fontSize: moderateScale(12),
    color: theme.colors.text,
    marginLeft: scale(12),
    lineHeight: moderateScale(18),
  },
});

export default HelpCenterScreen;
