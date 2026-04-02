// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Animated,
  Easing,
} from "react-native";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/FontAwesome";
import { authApi } from "@/api/authApi";
import AppScreen from "@/components/layout/AppScreen";
import AuthBackground from "../../../assets/images/auth-bg.png";



const baseSpacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 };


const ThemePresets = [
  {
    id: "theme0",
    name: "Glass",
    colors: {
      primary: "#6C5CE7",
      background: "#0f1724",
      surface: "rgba(255,255,255,0.06)",
      text: "#FFFFFF",
      textSecondary: "rgba(255,255,255,0.8)",
      border: "rgba(255,255,255,0.12)",
      glass: "rgba(255,255,255,0.08)",
    },
    spacing: baseSpacing,
    radii: { sm: 8, md: 10, lg: 16 },
    extra: { glass: true },
    // Same background image as login screen
    backgroundImage: AuthBackground,
  },
];


const createStyles = (theme: any) =>
  StyleSheet.create({
    backgroundImage: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(15, 23, 36, 0.85)", // Dark overlay for readability
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl * 2,
      paddingBottom: theme.spacing.lg,
      justifyContent: "center",
    },
    header: {
      marginBottom: theme.spacing.lg,
      alignItems: "center",
    },
    logoContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 10,
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.1)",
    },
    logoText: {
      fontSize: 26,
      fontWeight: "bold",
      color: "#fff",
      letterSpacing: 1,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
      textAlign: "center",
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      paddingHorizontal: theme.spacing.lg,
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.15)",
      marginBottom: theme.spacing.md,
      overflow: "hidden",
      backdropFilter: "blur(10px)",
    },
    fieldGroup: {
      marginBottom: theme.spacing.md,
      position: "relative",
    },
    inputWrapper: {
      position: "relative",
    },
    label: {
      position: "absolute",
      left: theme.spacing.md,
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
      paddingHorizontal: 6,
      zIndex: 2,
    },
    borderCutout: {
      position: "absolute",
      left: theme.spacing.md + 4,
      top: -1,
      height: 3,
      backgroundColor: theme.colors.background,
      zIndex: 1,
    },
    input: {
      backgroundColor: "rgba(15, 23, 36, 0.8)",
      borderWidth: 1.5,
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      fontSize: 15,
      color: theme.colors.text,
      minHeight: 50,
    },
    inputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      backgroundColor: "rgba(15, 23, 36, 0.95)",
    },
    inputError: {
      borderColor: "#FF6B6B",
      borderWidth: 1.5,
    },
    inputSuccess: {
      borderColor: "#10B981",
      borderWidth: 1.5,
    },
    inputIcon: {
      position: "absolute",
      right: theme.spacing.md,
      top: "50%",
      transform: [{ translateY: -10 }],
      zIndex: 2,
    },
    helperError: {
      marginTop: 4,
      fontSize: 12,
      color: "#FFB3B3",
      fontWeight: "500",
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.md,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      marginTop: theme.spacing.xs,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
      minHeight: 50,
      flexDirection: "row",
      justifyContent: "center",
      gap: theme.spacing.xs,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    footer: {
      marginTop: theme.spacing.lg,
      alignItems: "center",
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    footerLink: {
      color: theme.colors.primary,
      fontWeight: "700",
    },
    infoBox: {
      backgroundColor: "rgba(108, 92, 231, 0.15)",
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      borderWidth: 1,
      borderColor: "rgba(108, 92, 231, 0.3)",
    },
    infoText: {
      flex: 1,
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
  });


const ForgotPasswordScreen = ({ navigation, variant = 0 }: any) => {
  const theme = ThemePresets[variant] || ThemePresets[0];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();


  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);


  // Animated values
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const emailLabelAnim = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


  const animateLabel = (
    anim: Animated.Value,
    value: string,
    focused: boolean
  ) => {
    Animated.timing(anim, {
      toValue: value || focused ? 1 : 0,
      duration: 150,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };


  useEffect(() => {
    animateLabel(emailLabelAnim, email, focusedField === "email");
  }, [email, focusedField]);


  const validateEmail = (value: string) => {
    if (!value) return t("auth.emailRequired") || "Email is required";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value))
      return t("auth.invalidEmail") || "Invalid email format";
    return "";
  };


  const emailError = touchedEmail ? validateEmail(email) : "";
  const isEmailValid = !!email && !emailError;


  const handleResetPassword = async () => {
    const emailErr = validateEmail(email);


    if (emailErr) {
      setTouchedEmail(true);
      Toast.show({
        type: "error",
        text1: t("auth.pleaseFixErrors") || "Please fix errors",
      });
      return;
    }


    try {
      setLoading(true);


      const response = await authApi.forgotPassword(email);


      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: t("auth.otpSent") || "OTP Sent!",
          text2:
            response.data.message ||
            t("auth.otpSentDesc") ||
            "Check your email for the verification code",
        });


        navigation.navigate("ResetPassword", { email });
      } else {
        Toast.show({
          type: "error",
          text1:
            response.data.message ||
            t("auth.otpSendFailed") ||
            "Failed to send OTP",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1:
          err?.message ||
          t("auth.resetEmailFailed") ||
          "Failed to send reset email",
      });
    } finally {
      setLoading(false);
    }
  };


  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };


  const getLabelStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, -10],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.85],
        }),
      },
    ],
  });


  return (
    <AppScreen withKeyboard>
      <ImageBackground
        source={theme.backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.header}>
                {/* <View style={styles.logoContainer}>
                  <Text style={styles.logoText}>
                    {t("auth.appLogo") || "WM"}
                  </Text>
                </View> */}
                <Text style={styles.title}>
                  {t("auth.forgotPasswordTitle") || "Forgot Password?"}
                </Text>
                <Text style={styles.subtitle}>
                  {t("auth.forgotPasswordSubtitle") ||
                    "Enter your email address and we'll send you a verification code to reset your password"}
                </Text>
              </View>


              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: cardOpacity,
                    transform: [{ translateY: cardTranslateY }],
                  },
                ]}
              >
                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Icon
                    name="info-circle"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.infoText}>
                    {t("auth.forgotPasswordInfoBox") ||
                      "You will receive an OTP via email to reset your password securely"}
                  </Text>
                </View>


                {/* Email Field */}
                <View style={styles.fieldGroup}>
                  <View style={styles.inputWrapper}>
                    <Animated.Text
                      style={[styles.label, getLabelStyle(emailLabelAnim)]}
                    >
                      {t("auth.email") || "Email Address"}
                    </Animated.Text>
                    <Animated.View
                      style={[
                        styles.borderCutout,
                        { width: 93, opacity: emailLabelAnim },
                      ]}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === "email" && styles.inputFocused,
                        emailError && styles.inputError,
                        isEmailValid && styles.inputSuccess,
                      ]}
                      placeholder=""
                      placeholderTextColor={theme.colors.textSecondary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => {
                        setFocusedField(null);
                        setTouchedEmail(true);
                      }}
                      returnKeyType="done"
                      onSubmitEditing={handleResetPassword}
                    />
                    {isEmailValid && (
                      <View style={styles.inputIcon}>
                        <Icon name="check-circle" size={18} color="#10B981" />
                      </View>
                    )}
                  </View>
                  {!!emailError && (
                    <Text style={styles.helperError}>{emailError}</Text>
                  )}
                </View>


                {/* Submit Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={() => {
                      animateButtonPress();
                      handleResetPassword();
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading
                        ? t("auth.sending") || "Sending..."
                        : t("auth.sendResetLink") || "Send Reset Code"}
                    </Text>
                    {!loading && <Icon name="arrow-right" size={16} color="#fff" />}
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>


              {/* Footer */}
              <TouchableOpacity
                style={styles.footer}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.footerText}>
                  {t("auth.rememberPassword") || "Remember your password?"}{" "}
                  <Text style={styles.footerLink}>
                    {t("auth.signIn") || "Sign In"}
                  </Text>
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </AppScreen>
  );
};


export default ForgotPasswordScreen;
