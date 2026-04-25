import React, { useState, useRef, useEffect } from "react";
import { Image, Pressable } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  Easing,
  StatusBar,
  Modal,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { profileApi } from "../../api/profileApi";
import { logout } from "../../store/slices/authSlice";
import { saveLanguage, setLanguage } from "../../store/slices/appSlice";
import { AppDispatch, RootState } from "../../store/store";
import { LANGUAGES } from "../../utils/constants";
import i18n from "../../utils/i18n";
import Toast from "react-native-toast-message";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useProfileData } from "../../hooks/useProfileData";

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
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radii: { sm: 8, md: 12, lg: 16, xl: 20 },
};

const ProfileScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);
  const { language } = useSelector((state: RootState) => state.app);

  const { profile, stats, loading, refreshing, refresh } = useProfileData();

  const [showLanguageModal, setShowLanguageModal] = useState(false);

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
  }, [fadeAnim, slideAnim]);

  const handleEditProfile = () => {
    navigation.navigate("EditProfile", { profile });
  };

  // Update the handleLanguageChange function in ProfileScreen.tsx

  const handleLanguageChange = async (lang: string) => {
    try {
      // Use the async thunk to save language
      await dispatch(saveLanguage(lang));

      setShowLanguageModal(false);

      Toast.show({
        type: "success",
        text1: t("profile.languageChanged"),
        text2: t("profile.languageChangedTo", {
          language: LANGUAGES.find((l) => l.value === lang)?.label,
        }),
      });
    } catch (error) {
      console.error("Error changing language:", error);
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("common.tryAgain"),
      });
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t("profile.logout", "Logout"),
      t("profile.logoutConfirm", "Are you sure you want to logout?"),
      [
        { text: t("profile.no", "No"), style: "cancel" },
        {
          text: t("profile.yes", "Yes"),
          onPress: () => {
            dispatch(logout());
            Toast.show({
              type: "success",
              text1: t("profile.loggedOut", "Logged out successfully"),
            });
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("profile.deleteAccount", "Delete Account"),
      t(
        "profile.deleteConfirm",
        "Are you sure you want to delete your account? This action cannot be undone."
      ),
      [
        { text: t("profile.cancel", "Cancel"), style: "cancel" },
        {
          text: t("profile.delete", "Delete"),
          onPress: async () => {
            try {
              await profileApi.deleteAccount();
              dispatch(logout());
              Toast.show({
                type: "success",
                text1: t(
                  "profile.accountDeleted",
                  "Account deleted successfully"
                ),
              });
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: t("profile.deleteFailed", "Failed to delete account"),
                text2:
                  error.response?.data?.message ||
                  t("common.tryAgain", "Please try again"),
              });
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = profile?.name || user?.name || t("profile.user", "User");
  const displayEmail =
    profile?.email || user?.email || t("profile.noEmail", "No email");

  // ✅ FIX: Calculate bottom padding for both gesture and button navigation
  const scrollBottomPadding =
    Platform.OS === "android"
      ? (insets.bottom > 0 ? insets.bottom : 70) + 104 // 70 for 3-button nav
      : insets.bottom + 104;

  const modalBottomPadding =
    Platform.OS === "android"
      ? Math.max(insets.bottom, 90) // 20 for 3-button nav
      : insets.bottom + 20;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header with Safe Area */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.userName}>{t("profile.profile", "Profile")}</Text>
          <Text style={styles.greeting}>
            {t("profile.manageAccount", "Manage your account")}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
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
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              {profile?.avatar ? (
                <Image
                  source={{ uri: profile.avatar }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarText}>
                  {getInitials(displayName)}
                </Text>
              )}
            </View>

            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
          </View>

          {/* Account Settings */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>
              {t("profile.accountSettings", "Account Settings")}
            </Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditProfile}
            >
              <View style={styles.menuIcon}>
                <Icon
                  name="account-edit"
                  size={22}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>
                  {t("profile.editProfile", "Edit Profile")}
                </Text>
                <Text style={styles.menuSubtitle}>
                  {t("profile.updateInfo", "Update your information")}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.menuIcon}>
                <Icon name="translate" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>
                  {t("profile.language", "Language")}
                </Text>
                <Text style={styles.menuSubtitle}>
                  {LANGUAGES.find((l) => l.value === language)?.label ||
                    t("profile.english", "English")}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Support */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>
              {t("profile.support", "Support")}
            </Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("HelpCenter" as never)}
            >
              <View style={styles.menuIcon}>
                <Icon
                  name="help-circle"
                  size={22}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>
                  {t("profile.helpCenter", "Help Center")}
                </Text>
                <Text style={styles.menuSubtitle}>
                  {t("profile.getHelp", "Get help & support")}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => navigation.navigate("About" as never)}
            >
              <View style={styles.menuIcon}>
                <Icon
                  name="information"
                  size={22}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>
                  {t("profile.about", "About")}
                </Text>
                <Text style={styles.menuSubtitle}>
                  {t("profile.appVersion", "Version")} 2.5.0
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={24} color={theme.colors.error} />
            <Text style={styles.logoutText}>
              {t("profile.logout", "Logout")}
            </Text>
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteText}>
              {t("profile.deleteAccount", "Delete Account")}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Language Selection Modal */}
      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowLanguageModal(false)}
          />

          {/* Modal Content */}
          <View
            style={[
              styles.languageModalContent,
              { paddingBottom: modalBottomPadding }, // ✅ Use calculated padding
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("profile.selectLanguage", "Select Language")}
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Languages - Wrap in ScrollView for safety */}
            <ScrollView
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            >
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  style={styles.languageItem}
                  onPress={() => handleLanguageChange(lang.value)}
                >
                  <Icon
                    name="translate"
                    size={24}
                    color={
                      language === lang.value
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.languageItemText,
                      language === lang.value && styles.languageItemTextActive,
                    ]}
                  >
                    {lang.label}
                  </Text>

                  {language === lang.value && (
                    <Icon
                      name="check-circle"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    paddingBottom: verticalScale(12),
    paddingHorizontal: scale(16),
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: moderateScale(13),
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  userName: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: verticalScale(2),
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
    borderWidth: 4,
    borderColor: theme.colors.background,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  userRole: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "600",
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.sm,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.error,
  },
  deleteButton: {
    alignItems: "center",
    padding: theme.spacing.md,
  },
  deleteText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textDecorationLine: "underline",
  },
  modalBackdrop: {
    flex: 1,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg, // ✅ Increased padding
    paddingHorizontal: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  languageItemText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  languageItemTextActive: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },

  languageModalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    maxHeight: "70%",
  },
  // ✅ ADD THIS NEW STYLE
  languageList: {
    flexGrow: 0, // Prevents it from taking full height
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
});

export default ProfileScreen;
