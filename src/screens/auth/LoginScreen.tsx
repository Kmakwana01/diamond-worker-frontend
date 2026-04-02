// src/screens/auth/LoginScreen.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { login, clearError, googleLogin } from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store/store";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/FontAwesome";
import Svg, { Path } from "react-native-svg";
import AppScreen from "@/components/layout/AppScreen";
import AuthBackground from "../../../assets/images/auth-bg.png";

// ------------------ ThemePresets Array ------------------
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
    // Background image URL - using Unsplash for professional worker/construction theme
    backgroundImage: AuthBackground,
  },
];

// ------------------ Style Generator ------------------
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
    cardInner: {
      backgroundColor: "rgba(15, 23, 36, 0.6)",
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
    },
    errorBanner: {
      backgroundColor: "rgba(255, 107, 107, 0.2)",
      borderRadius: theme.radii.sm,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      borderLeftWidth: 3,
      borderLeftColor: "#FF6B6B",
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    errorBannerText: {
      color: "#FFB3B3",
      fontSize: 13,
      fontWeight: "500",
      flex: 1,
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
      // backgroundColor: "rgba(15, 23, 36, 0.9)",
    },
    borderCutout: {
      position: "absolute",
      left: theme.spacing.md + 4,
      top: -1,
      height: 3,
      backgroundColor: theme.colors.background,
      zIndex: 1,
    },
    forgotPasswordContainer: {
      alignItems: "flex-end",
      marginBottom: theme.spacing.xs,
    },
    forgotText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: "600",
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
      flexDirection: "row",
      justifyContent: "center",
      gap: theme.spacing.xs,
      minHeight: 50,
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
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.md,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    dividerText: {
      marginHorizontal: theme.spacing.sm,
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },

    // Google button
    googleRow: {
      marginTop: theme.spacing.sm,
      alignItems: "center",
    },
    googleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      minHeight: 50,
      backgroundColor: theme.colors.glass,
      borderRadius: theme.radii.md,
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.2)",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      paddingHorizontal: theme.spacing.lg,
    },
    googleButtonDisabled: {
      opacity: 0.7,
    },
    googleIconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.sm,
    },
    googleText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: "#FFFFFF",
      textAlign: "center",
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
  });

// ------------------ Main Component ------------------
const LoginScreen = ({ navigation, variant = 0 }: any) => {
  const theme = ThemePresets[variant] || ThemePresets[0];
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Animated values
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const emailLabelAnim = useRef(new Animated.Value(0)).current;
  const passwordLabelAnim = useRef(new Animated.Value(0)).current;

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

    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

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

  useEffect(() => {
    animateLabel(passwordLabelAnim, password, focusedField === "password");
  }, [password, focusedField]);

  const validateEmail = (value: string) => {
    if (!value) return t("auth.emailRequired") || "Email is required";
    const regex = /\S+@\S+\.\S+/;
    if (!regex.test(value))
      return t("auth.invalidEmail") || "Invalid email format";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return t("auth.passwordRequired") || "Password is required";
    if (value.length < 6) return t("auth.passwordMin") || "Min 6 characters";
    return "";
  };

  const emailError = touchedEmail ? validateEmail(email) : "";
  const passwordError = touchedPassword ? validatePassword(password) : "";
  const isEmailValid = !!email && !emailError;
  const isPasswordValid = !!password && !passwordError;

  const handleLogin = async () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setTouchedEmail(true);
      setTouchedPassword(true);
      Toast.show({
        type: "error",
        text1: t("auth.pleaseFixErrors") || "Please fix errors",
      });
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();
      Toast.show({
        type: "success",
        text1: t("auth.loginSuccess") || "Login successful!",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err || t("auth.loginFailed") || "Login failed",
      });
    }
  };

  const handleForgotPassword = () => navigation.navigate("ForgotPassword");

  const handleGoogleLogin = useCallback(async () => {
    if (googleLoading || loading) return;

    setGoogleLoading(true);
    const startTime = Date.now();

    try {
      console.log("🔐 [0ms] Starting Google login...");
      await dispatch(googleLogin()).unwrap();
      console.log(`✅ [${Date.now() - startTime}ms] Login complete`);

      Toast.show({
        type: "success",
        text1: t("auth.loginSuccess"),
        text2: t("common.welcome"),
      });
    } catch (error: any) {
      console.error(`❌ [${Date.now() - startTime}ms] Error:`, error);

      const msg =
        typeof error === "string"
          ? error
          : error?.message || t("common.tryAgain") || "Please try again";

      if (!msg.toLowerCase().includes("cancel")) {
        Toast.show({
          type: "error",
          text1: t("auth.loginFailed"),
          text2: msg,
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [dispatch, googleLoading, loading, t]);

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
                  <Text style={styles.logoText}>{t("auth.appLogo") || "WM"}</Text>
                </View> */}
                <Text style={styles.title}>
                  {t("auth.login") || "Welcome Back"}
                </Text>
                <Text style={styles.subtitle}>
                  {t("auth.welcomeBack") ||
                    "Sign in to manage your workforce efficiently"}
                </Text>
              </View>

              {/* Login Card */}
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: cardOpacity,
                    transform: [{ translateY: cardTranslateY }],
                  },
                ]}
              >
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
                      returnKeyType="next"
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

                {/* Password Field */}
                <View style={styles.fieldGroup}>
                  <View style={styles.inputWrapper}>
                    <Animated.Text
                      style={[styles.label, getLabelStyle(passwordLabelAnim)]}
                    >
                      {t("auth.password") || "Password"}
                    </Animated.Text>
                    <Animated.View
                      style={[
                        styles.borderCutout,
                        { width: 65, opacity: passwordLabelAnim },
                      ]}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === "password" && styles.inputFocused,
                        passwordError && styles.inputError,
                        isPasswordValid && styles.inputSuccess,
                      ]}
                      placeholder=""
                      placeholderTextColor={theme.colors.textSecondary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => {
                        setFocusedField(null);
                        setTouchedPassword(true);
                      }}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      style={styles.inputIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Icon
                        name={showPassword ? "eye-slash" : "eye"}
                        size={18}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {!!passwordError && (
                    <Text style={styles.helperError}>{passwordError}</Text>
                  )}
                </View>

                {/* Forgot Password */}
                <View style={styles.forgotPasswordContainer}>
                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotText}>
                      {t("auth.forgotPassword") || "Forgot Password?"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={() => {
                      animateButtonPress();
                      handleLogin();
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading
                        ? t("auth.signingIn") || "Signing In..."
                        : t("auth.login") || "Sign In"}
                    </Text>
                    {!loading && (
                      <Icon name="arrow-right" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>
                    {t("auth.orContinueWith") || "Or continue with"}
                  </Text>
                  <View style={styles.divider} />
                </View>

                {/* Google Sign In Button */}
                <View style={styles.googleRow}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.googleButton,
                      (googleLoading || loading) && styles.buttonDisabled,
                    ]}
                    onPress={handleGoogleLogin}
                    disabled={googleLoading || loading}
                  >
                    {googleLoading ? (
                      <ActivityIndicator size="small" color="#4285F4" />
                    ) : (
                      <>
                        <View style={styles.googleIconWrapper}>
                          <Svg width={20} height={20} viewBox="0 0 48 48">
                            <Path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            />
                            <Path
                              fill="#4285F4"
                              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            />
                            <Path
                              fill="#FBBC05"
                              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            />
                            <Path
                              fill="#34A853"
                              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                            <Path fill="none" d="M0 0h48v48H0z" />
                          </Svg>
                        </View>
                        <Text style={styles.googleText}>
                          {t("auth.googleSignIn") || "Sign in with Google"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Footer */}
              <TouchableOpacity
                style={styles.footer}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.footerText}>
                  {t("auth.dontHaveAccount") || "Don't have an account?"}{" "}
                  <Text style={styles.footerLink}>
                    {t("auth.signUp") || "Sign Up"}
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

export default LoginScreen;
