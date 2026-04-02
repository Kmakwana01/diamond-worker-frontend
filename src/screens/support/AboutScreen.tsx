import React, { memo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  StatusBar,
  Animated,
  Easing,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import * as Clipboard from "expo-clipboard";

const theme = {
  colors: {
    primary: "#6C5CE7",
    secondary: "#A29BFE",
    background: "#0f1724",
    surface: "rgba(255,255,255,0.06)",
    text: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.7)",
    border: "rgba(255,255,255,0.12)",
    success: "#00D9A3",
    error: "#FF6B6B",
    warning: "#FFB800",
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

const APP_VERSION = "2.3.0";
const BUILD_NUMBER = "100";

interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface SocialLink {
  id: string;
  platform: string;
  icon: string;
  url: string;
}

const AboutScreen: React.FC = memo(() => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

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

  const features: FeatureItem[] = [
    {
      id: "1",
      icon: "diamond-stone",
      title: t("about.features.workTracking"),
      description: t("about.features.workTrackingDesc"),
    },
    {
      id: "2",
      icon: "cash-multiple",
      title: t("about.features.paymentManagement"),
      description: t("about.features.paymentManagementDesc"),
    },
    {
      id: "3",
      icon: "chart-line",
      title: t("about.features.detailedReports"),
      description: t("about.features.detailedReportsDesc"),
    },
    {
      id: "4",
      icon: "cloud-sync",
      title: t("about.features.cloudSync"),
      description: t("about.features.cloudSyncDesc"),
    },
  ];

  const socialLinks: SocialLink[] = [
    // {
    //   id: 'website',
    //   platform: 'Website',
    //   icon: 'web',
    //   url: 'https://www.workerapp.com',
    // },
    {
      id: "email",
      platform: "Email",
      icon: "email",
      url: "mailto:kmakwana8232@gmail.com",
    },
    {
      id: "twitter",
      platform: "Twitter",
      icon: "twitter",
      url: "https://twitter.com/workerapp",
    },
    {
      id: "linkedin",
      platform: "LinkedIn",
      icon: "linkedin",
      url: "https://linkedin.com/company/workerapp",
    },
  ];

  const handleOpenURL = async (url: string, platform: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Toast.show({
          type: "error",
          text1: t("about.unableToOpen"),
          text2: platform,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
      });
    }
  };

  const handleCopyVersion = async () => {
    const versionInfo = `Worker App v${APP_VERSION} (${BUILD_NUMBER})`;
    await Clipboard.setStringAsync(versionInfo);
    Toast.show({
      type: "success",
      text1: t("about.versionCopied"),
      text2: versionInfo,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon
            name="arrow-left"
            size={moderateScale(24)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("about.aboutApp")}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: verticalScale(24) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* App Info Card */}
          <View style={styles.appInfoCard}>
            <View style={styles.appIconContainer}>
              <Image
                source={require("../../../assets/icon.png")}
                style={styles.appIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>{t("about.appName")}</Text>
            <Text style={styles.appTagline}>{t("about.appTagline")}</Text>
            <TouchableOpacity
              onPress={handleCopyVersion}
              style={styles.versionBadge}
            >
              <Text style={styles.versionText}>
                {t("about.version")} {APP_VERSION}
              </Text>
              {/* <Text style={styles.buildText}>Build {BUILD_NUMBER}</Text> */}
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("about.whatIsWorkerApp")}
            </Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                {t("about.appDescription")}
              </Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("about.keyFeatures")}</Text>
            <View style={styles.featuresContainer}>
              {features.map((feature, index) => (
                <View
                  key={feature.id}
                  style={[
                    styles.featureItem,
                    index === features.length - 1 && styles.featureItemLast,
                  ]}
                >
                  <View
                    style={[
                      styles.featureIcon,
                      { backgroundColor: `${theme.colors.primary}20` },
                    ]}
                  >
                    <Icon
                      name={feature.icon}
                      size={moderateScale(24)}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Legal */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.legalItem}
              onPress={() =>
                handleOpenURL(
                  "https://sites.google.com/view/dailywork-privacy-policy/home",
                  "Privacy Policy"
                )
              }
            >
              <Icon
                name="shield-check"
                size={moderateScale(20)}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.legalText}>{t("about.privacyPolicy")}</Text>
              <Icon
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.legalItem}
              onPress={() =>
                handleOpenURL(
                  "https://sites.google.com/view/dailywork-terms-and-condition/home",
                  "Terms of Service"
                )
              }
            >
              <Icon
                name="file-document"
                size={moderateScale(20)}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.legalText}>{t("about.termsOfService")}</Text>
              <Icon
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Credits */}
          <View style={styles.creditsCard}>
            <Text style={styles.creditsText}>
              {t("about.madeWith")} ❤️ {t("about.byTeam")}
            </Text>
            <Text style={styles.copyrightText}>
              © 2025 Worker App. {t("about.allRightsReserved")}
            </Text>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(12),
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: moderateScale(8),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "800",
    color: theme.colors.text,
    marginLeft: scale(12),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
  },
  appInfoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: moderateScale(24),
    alignItems: "center",
    marginBottom: verticalScale(24),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  appIconContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(24),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(16),
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    // elevation: 8,
    overflow: "hidden",
  },
  appIconImage: {
    width: "100%",
    height: "100%",
  },
  appIconText: {
    fontSize: moderateScale(40),
  },
  appName: {
    fontSize: moderateScale(24),
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: verticalScale(4),
  },
  appTagline: {
    fontSize: moderateScale(14),
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: verticalScale(12),
  },
  versionBadge: {
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: theme.radii.md,
  },
  versionText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: theme.colors.primary,
    textAlign: "center",
  },
  buildText: {
    fontSize: moderateScale(11),
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: verticalScale(12),
  },
  descriptionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  descriptionText: {
    fontSize: moderateScale(14),
    color: theme.colors.textSecondary,
    lineHeight: moderateScale(22),
  },
  featuresContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  featureItem: {
    flexDirection: "row",
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  featureItemLast: {
    borderBottomWidth: 0,
  },
  featureIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: verticalScale(4),
  },
  featureDescription: {
    fontSize: moderateScale(12),
    color: theme.colors.textSecondary,
    lineHeight: moderateScale(18),
  },
  socialContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(12),
  },
  socialButton: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: moderateScale(16),
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  socialText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: verticalScale(8),
  },
  legalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: moderateScale(16),
    borderRadius: theme.radii.md,
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  legalText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: theme.colors.text,
    marginLeft: scale(12),
  },
  creditsCard: {
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: theme.radii.md,
    padding: moderateScale(16),
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  creditsText: {
    fontSize: moderateScale(13),
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: verticalScale(4),
  },
  copyrightText: {
    fontSize: moderateScale(11),
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});

export default AboutScreen;
