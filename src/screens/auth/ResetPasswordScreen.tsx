// src/screens/auth/ResetPasswordScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { authApi } from "../../api/authApi";
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
    // Same background image as other auth screens
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
      backgroundColor: "rgba(15, 23, 36, 0.85)",
    },
    container: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl * 2,
      paddingBottom: theme.spacing.lg,
      justifyContent: "center",
    },
    header: { 
      marginBottom: theme.spacing.lg, 
      alignItems: "center" 
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
      paddingHorizontal: theme.spacing.md,
    },
    emailText: {
      fontSize: 15,
      color: theme.colors.primary,
      fontWeight: "700",
      marginTop: theme.spacing.xs,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
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
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    otpInput: {
      flex: 1,
      backgroundColor: "rgba(15, 23, 36, 0.8)",
      borderWidth: 1.5,
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: theme.radii.md,
      paddingVertical: theme.spacing.md,
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
    },
    otpInputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      backgroundColor: "rgba(15, 23, 36, 0.95)",
      transform: [{ scale: 1.05 }],
    },
    otpInputError: { 
      borderColor: "#FF6B6B", 
      borderWidth: 2 
    },
    otpInputSuccess: { 
      borderColor: "#10B981", 
      borderWidth: 1.5 
    },
    fieldGroup: { 
      marginBottom: theme.spacing.md, 
      position: "relative" 
    },
    inputWrapper: { 
      position: "relative" 
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
      borderWidth: 1.5 
    },
    inputSuccess: { 
      borderColor: "#10B981", 
      borderWidth: 1.5 
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
    helperText: {
      marginTop: 4,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    passwordStrengthContainer: {
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    passwordStrengthBar: {
      flexDirection: "row",
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    passwordStrengthSegment: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    passwordStrengthText: { 
      fontSize: 12, 
      fontWeight: "600" 
    },
    timerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
    },
    timerText: { 
      fontSize: 13, 
      color: theme.colors.textSecondary 
    },
    resendButton: { 
      paddingVertical: theme.spacing.xs 
    },
    resendButtonText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: "700",
    },
    resendButtonDisabled: { 
      opacity: 0.5 
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
      opacity: 0.7 
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    divider: {
      height: 1,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      marginVertical: theme.spacing.lg,
    },
    footer: { 
      marginTop: theme.spacing.lg, 
      alignItems: "center" 
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
      fontWeight: "700" 
    },
  });


const ResetPasswordScreen = ({ navigation, route, variant = 0 }: any) => {
  const theme = ThemePresets[variant] || ThemePresets[0];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();


  // Email from route
  const { email } = route.params || {};


  // OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState(0);
  const [otpError, setOtpError] = useState(false);
  const otpInputRefs = useRef<any[]>([]);


  // Passwords
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touchedNewPassword, setTouchedNewPassword] = useState(false);
  const [touchedConfirmPassword, setTouchedConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);


  // Timer / loading
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);


  // Animations
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const newPasswordLabelAnim = useRef(new Animated.Value(0)).current;
  const confirmPasswordLabelAnim = useRef(new Animated.Value(0)).current;


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


  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);


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
    animateLabel(
      newPasswordLabelAnim,
      newPassword,
      focusedField === "newPassword"
    );
  }, [newPassword, focusedField]);


  useEffect(() => {
    animateLabel(
      confirmPasswordLabelAnim,
      confirmPassword,
      focusedField === "confirmPassword"
    );
  }, [confirmPassword, focusedField]);


  // OTP handlers
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value)) && value !== "") return;


    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(false);


    if (value !== "" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };


  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };


  // Password validation
  const validatePassword = (value: string) => {
    if (!value) return t("auth.passwordRequired") || "Password is required";
    if (value.length < 6)
      return (
        t("auth.passwordMin") ||
        "Password must be at least 6 characters"
      );
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value))
      return (
        t("auth.passwordAlphaNum") ||
        "Must contain letters and numbers"
      );
    return "";
  };


  const validateConfirmPassword = (value: string) => {
    if (!value)
      return (
        t("auth.confirmPasswordRequired") ||
        "Please confirm your password"
      );
    if (value !== newPassword)
      return t("auth.passwordsDoNotMatch") || "Passwords do not match";
    return "";
  };


  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 10) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return Math.min(strength, 4);
  };


  const passwordStrength = getPasswordStrength(newPassword);
  const strengthColors = ["#FF6B6B", "#FFA500", "#FFD700", "#10B981"];
  const strengthLabels = [
    t("auth.passwordWeak") || "Weak",
    t("auth.passwordFair") || "Fair",
    t("auth.passwordGood") || "Good",
    t("auth.passwordStrong") || "Strong",
  ];


  const newPasswordError = touchedNewPassword
    ? validatePassword(newPassword)
    : "";
  const confirmPasswordError = touchedConfirmPassword
    ? validateConfirmPassword(confirmPassword)
    : "";
  const isNewPasswordValid = !!newPassword && !newPasswordError;
  const isConfirmPasswordValid = !!confirmPassword && !confirmPasswordError;


  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };


  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    try {
      const response = await authApi.forgotPassword(email);


      if (response.data.success) {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();


        Toast.show({
          type: "success",
          text1: t("auth.otpResent") || "OTP Resent!",
          text2:
            response.data.message ||
            t("auth.otpResentDesc") ||
            "A new code has been sent to your email",
        });
      } else {
        Toast.show({
          type: "error",
          text1:
            response.data.message ||
            t("auth.otpResendFailed") ||
            "Failed to resend OTP",
        });
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t("auth.otpResendFailed") ||
        "Failed to resend OTP";


      Toast.show({
        type: "error",
        text1: t("common.error") || "Error",
        text2: errorMessage,
      });
    }
  };


  // Reset password
  const handleResetPassword = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setOtpError(true);
      triggerShake();
      Toast.show({
        type: "error",
        text1: t("auth.otpIncomplete") || "Please enter complete OTP",
      });
      return;
    }


    const newPassErr = validatePassword(newPassword);
    const confirmPassErr = validateConfirmPassword(confirmPassword);


    if (newPassErr || confirmPassErr) {
      setTouchedNewPassword(true);
      setTouchedConfirmPassword(true);
      triggerShake();
      Toast.show({
        type: "error",
        text1: t("auth.pleaseFixErrors") || "Please fix errors",
      });
      return;
    }


    try {
      setLoading(true);
      const response = await authApi.resetPassword(
        email,
        otpString,
        newPassword
      );


      if (response.data.success) {
        Toast.show({
          type: "success",
          text1:
            t("auth.passwordResetSuccess") ||
            "Password Reset Successful!",
          text2:
            response.data.message ||
            t("auth.passwordResetSuccessDesc") ||
            "You can now login with your new password",
        });


        setTimeout(() => {
          navigation.navigate("Login");
        }, 1500);
      } else {
        triggerShake();
        Toast.show({
          type: "error",
          text1:
            response.data.message ||
            t("auth.passwordResetFailed") ||
            "Failed to reset password",
        });
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t("auth.passwordResetFailed") ||
        "Failed to reset password";


      if (errorMessage.toLowerCase().includes("otp")) {
        setOtpError(true);
      }


      triggerShake();
      Toast.show({
        type: "error",
        text1: t("common.error") || "Error",
        text2: errorMessage,
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


  const isOtpComplete = otp.every(digit => digit !== "");


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
                  {t("auth.resetPasswordTitle") || "Reset Password"}
                </Text>
                <Text style={styles.subtitle}>
                  {t("auth.resetPasswordSubtitle") || "Enter the OTP sent to"}
                </Text>
                <Text style={styles.emailText}>{email}</Text>
              </View>


              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: cardOpacity,
                    transform: [
                      { translateY: cardTranslateY },
                      { translateX: shakeAnimation },
                    ],
                  },
                ]}
              >
                {/* OTP section */}
                <Text style={styles.sectionTitle}>
                  {t("auth.enterOtpTitle") || "Enter OTP"}
                </Text>


                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => (otpInputRefs.current[index] = ref)}
                      style={[
                        styles.otpInput,
                        focusedOtpIndex === index && styles.otpInputFocused,
                        otpError && styles.otpInputError,
                        isOtpComplete && !otpError && styles.otpInputSuccess,
                      ]}
                      value={digit}
                      onChangeText={value => handleOtpChange(value, index)}
                      onKeyPress={e => handleOtpKeyPress(e, index)}
                      onFocus={() => setFocusedOtpIndex(index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>


                {/* Timer / Resend */}
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>
                    {canResend
                      ? t("auth.didntReceiveCode") ||
                        "Didn't receive the code?"
                      : t("auth.resendOtpIn", { seconds: timer }) ||
                        `Resend OTP in ${timer}s`}
                  </Text>
                  {canResend && (
                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleResend}
                    >
                      <Text style={styles.resendButtonText}>
                        {t("auth.resendOtp") || "Resend OTP"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>


                <View style={styles.divider} />


                {/* New password */}
                <Text style={styles.sectionTitle}>
                  {t("auth.createNewPasswordTitle") || "Create New Password"}
                </Text>


                {/* New Password */}
                <View style={styles.fieldGroup}>
                  <View style={styles.inputWrapper}>
                    <Animated.Text
                      style={[
                        styles.label,
                        getLabelStyle(newPasswordLabelAnim),
                      ]}
                    >
                      {t("auth.newPassword") || "New Password"}
                    </Animated.Text>
                    <Animated.View
                      style={[
                        styles.borderCutout,
                        { width: 93, opacity: newPasswordLabelAnim },
                      ]}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === "newPassword" &&
                          styles.inputFocused,
                        newPasswordError && styles.inputError,
                        isNewPasswordValid && styles.inputSuccess,
                      ]}
                      placeholder=""
                      placeholderTextColor={theme.colors.textSecondary}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      onFocus={() => setFocusedField("newPassword")}
                      onBlur={() => {
                        setFocusedField(null);
                        setTouchedNewPassword(true);
                      }}
                      returnKeyType="next"
                    />
                    <TouchableOpacity
                      style={styles.inputIcon}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Icon
                        name={showNewPassword ? "eye-slash" : "eye"}
                        size={18}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>


                  {newPassword && passwordStrength > 0 && (
                    <View style={styles.passwordStrengthContainer}>
                      <View style={styles.passwordStrengthBar}>
                        {[0, 1, 2, 3].map(index => (
                          <View
                            key={index}
                            style={[
                              styles.passwordStrengthSegment,
                              {
                                backgroundColor:
                                  index < passwordStrength
                                    ? strengthColors[passwordStrength - 1]
                                    : "rgba(255, 255, 255, 0.2)",
                              },
                            ]}
                          />
                        ))}
                      </View>
                      <Text
                        style={[
                          styles.passwordStrengthText,
                          { color: strengthColors[passwordStrength - 1] },
                        ]}
                      >
                        {strengthLabels[passwordStrength - 1]}
                      </Text>
                    </View>
                  )}


                  {!!newPasswordError && (
                    <Text style={styles.helperError}>{newPasswordError}</Text>
                  )}
                  {!newPasswordError && newPassword && (
                    <Text style={styles.helperText}>
                      {t("auth.passwordHint") ||
                        "Use 6+ characters with letters and numbers"}
                    </Text>
                  )}
                </View>


                {/* Confirm Password */}
                <View style={styles.fieldGroup}>
                  <View style={styles.inputWrapper}>
                    <Animated.Text
                      style={[
                        styles.label,
                        getLabelStyle(confirmPasswordLabelAnim),
                      ]}
                    >
                      {t("auth.confirmPassword") || "Confirm Password"}
                    </Animated.Text>
                    <Animated.View
                      style={[
                        styles.borderCutout,
                        { width: 118, opacity: confirmPasswordLabelAnim },
                      ]}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === "confirmPassword" &&
                          styles.inputFocused,
                        confirmPasswordError && styles.inputError,
                        isConfirmPasswordValid && styles.inputSuccess,
                      ]}
                      placeholder=""
                      placeholderTextColor={theme.colors.textSecondary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => {
                        setFocusedField(null);
                        setTouchedConfirmPassword(true);
                      }}
                      returnKeyType="done"
                      onSubmitEditing={handleResetPassword}
                    />
                    <TouchableOpacity
                      style={styles.inputIcon}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Icon
                        name={showConfirmPassword ? "eye-slash" : "eye"}
                        size={18}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {!!confirmPasswordError && (
                    <Text style={styles.helperError}>
                      {confirmPasswordError}
                    </Text>
                  )}
                  {isConfirmPasswordValid && (
                    <View style={[styles.inputIcon, { top: 14 }]}>
                      <Icon name="check-circle" size={18} color="#10B981" />
                    </View>
                  )}
                </View>


                {/* Submit */}
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
                        ? t("auth.resettingPassword") || "Resetting..."
                        : t("auth.resetPasswordButton") || "Reset Password"}
                    </Text>
                    {!loading && <Icon name="check" size={16} color="#fff" />}
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


export default ResetPasswordScreen;
