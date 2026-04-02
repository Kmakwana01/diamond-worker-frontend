// src/screens/auth/OTPVerificationScreen.tsx
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
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { verifyOTP, clearError } from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store/store";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/FontAwesome";
import AuthBackground from "../../../assets/images/auth-bg.png";
import AppScreen from "@/components/layout/AppScreen";


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
    // Same background image as other auth screens
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
      backgroundColor: "rgba(15, 23, 36, 0.85)",
    },
    container: { 
      flex: 1 
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl * 2,
      paddingBottom: theme.spacing.lg,
      justifyContent: "center",
    },
    header: {
      marginBottom: theme.spacing.xl,
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
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(108, 92, 231, 0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: "rgba(108, 92, 231, 0.3)",
    },
    brandTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.primary,
      letterSpacing: 1.5,
      marginBottom: theme.spacing.xs,
      textTransform: "uppercase",
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
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
      padding: theme.spacing.xl,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.15)",
      marginBottom: theme.spacing.lg,
      overflow: "hidden",
      backdropFilter: "blur(10px)",
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
    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    otpInput: {
      flex: 1,
      backgroundColor: "rgba(15, 23, 36, 0.8)",
      borderWidth: 1.5,
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: theme.radii.md,
      paddingVertical: theme.spacing.md,
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
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
      borderWidth: 1.5,
    },
    helperText: {
      marginTop: -theme.spacing.sm,
      marginBottom: theme.spacing.md,
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 18,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.md,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      marginTop: theme.spacing.sm,
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
    resendContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: theme.spacing.lg,
      gap: theme.spacing.xs,
      flexWrap: "wrap",
    },
    resendText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    resendButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    resendButtonText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "700",
    },
    resendButtonDisabled: {
      opacity: 0.5,
    },
    timerText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "700",
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
    gradientHeader: {
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      alignItems: "center",
    },
  });


// ------------------ Main Component ------------------
const OTPVerificationScreen = ({ navigation, route, variant = 0 }: any) => {
  const theme = ThemePresets[variant] || ThemePresets[0];
  const styles = useMemo(() => createStyles(theme), [theme]);


  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  // Get email from route params
  const { email } = route.params || { email: "user@example.com" };


  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);


  const inputRefs = useRef<any[]>([]);


  // Animations
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;


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


    return () => dispatch(clearError());
  }, [dispatch]);


  // Timer
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


  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value)) && value !== "") return;


    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setHasError(false);


    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };


  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };


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


  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setHasError(true);
      triggerShake();
      Toast.show({
        type: "error",
        text1: t("auth.otpIncomplete") || "Please enter complete OTP",
      });
      return;
    }


    try {
      await dispatch(verifyOTP({ email, otp: otpString })).unwrap();
      Toast.show({
        type: "success",
        text1: t("auth.verifySuccess") || "Verification successful!",
      });
    } catch (err: any) {
      setHasError(true);
      triggerShake();
      Toast.show({
        type: "error",
        text1: err || t("auth.verifyFailed") || "Verification failed",
      });
    }
  };


  const handleResend = () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    Toast.show({
      type: "success",
      text1: t("auth.otpResent") || "OTP has been resent",
    });
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
              <View style={styles.header}>
                {/* Icon Container */}
                <View style={styles.iconContainer}>
                  <Icon name="shield" size={36} color={theme.colors.primary} />
                </View>
                
                {/* <Text style={styles.brandTitle}>
                  {t("auth.brandName") || "WORKER MANAGER"}
                </Text> */}
                
                <Text style={styles.title}>
                  {t("auth.verifyOTP") || "Verify Your Email"}
                </Text>
                <Text style={styles.subtitle}>
                  {t("auth.otpSentTo") || "We've sent a verification code to"}
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
                {error && (
                  <View style={styles.errorBanner}>
                    <Icon name="exclamation-circle" size={16} color="#FF6B6B" />
                    <Text style={styles.errorBannerText}>{error}</Text>
                  </View>
                )}


                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => (inputRefs.current[index] = ref)}
                      style={[
                        styles.otpInput,
                        focusedIndex === index && styles.otpInputFocused,
                        hasError && styles.otpInputError,
                        isOtpComplete && !hasError && styles.otpInputSuccess,
                      ]}
                      value={digit}
                      onChangeText={value => handleOtpChange(value, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>


                <Text style={styles.helperText}>
                  {t("auth.enterOTPHelper") ||
                    "Enter the 6-digit code sent to your email"}
                </Text>


                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={() => {
                      animateButtonPress();
                      handleVerify();
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading
                        ? t("auth.verifying") || "Verifying..."
                        : t("auth.verify") || "Verify"}
                    </Text>
                    {!loading && <Icon name="check" size={16} color="#fff" />}
                  </TouchableOpacity>
                </Animated.View>


                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>
                    {t("auth.didntReceiveCode") || "Didn't receive the code?"}
                  </Text>
                  {canResend ? (
                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleResend}
                    >
                      <Text style={styles.resendButtonText}>
                        {t("auth.resendOtp") || "Resend"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.timerText}>
                      {t("auth.resendOtpIn", { seconds: timer }) ||
                        `Resend in ${timer}s`}
                    </Text>
                  )}
                </View>
              </Animated.View>


              <TouchableOpacity
                style={styles.footer}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.footerText}>
                  {t("auth.wrongEmail") || "Wrong email?"}{" "}
                  <Text style={styles.footerLink}>
                    {t("auth.goBack") || "Go Back"}
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


export default OTPVerificationScreen;
