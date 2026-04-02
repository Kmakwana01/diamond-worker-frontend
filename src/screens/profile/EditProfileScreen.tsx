import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  StatusBar,
  Image,
} from "react-native";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { profileApi } from "../../api/profileApi";
import { setUser } from "../../store/slices/authSlice";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";

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
      textSecondary: "rgba(255,255,255,0.7)",
      border: "rgba(255,255,255,0.12)",
      success: "#00D9A3",
      error: "#FF6B6B",
    },
    spacing: baseSpacing,
    radii: { sm: 8, md: 12, lg: 16 },
    extra: { glass: true },
  },
];

const EditProfileScreen = ({ navigation, route, variant = 0 }: any) => {
  const theme = ThemePresets[variant] || ThemePresets[0];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const profile = route.params?.profile || {};

  const [avatar, setAvatar] = useState<string | null>(profile.avatar || null);
  const [formData, setFormData] = useState({
    name: profile.name || "",
    phone: profile.phone || "",
    age: profile.age?.toString() || "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Toast.show({ type: "error", text1: "Name is required" });
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();

      form.append("name", formData.name.trim());

      if (formData.phone) form.append("phone", formData.phone);
      if (formData.age) form.append("age", formData.age);

      if (avatar && avatar !== profile.avatar) {
        const filename = avatar.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        form.append("avatar", {
          uri: avatar,
          name: filename,
          type,
        } as any);
      }

      const response = await profileApi.updateProfile(form);

      dispatch(setUser(response.data.data.user));

      Toast.show({
        type: "success",
        text1: "Profile updated successfully",
      });

      navigation.navigate("ProfileMain", { refreshed: true });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to update profile",
        text2: error.response?.data?.message || "Try again",
      });
    } finally {
      setLoading(false);
    }
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

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({
        type: "error",
        text1: "Permission required",
        text2: "Allow gallery access",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* SIMPLE HEADER LIKE HELP CENTER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {getInitials(formData.name)}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={pickImage}
              >
                <Icon name="camera" size={20} color={theme.colors.primary} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              {/* Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === "name" && styles.inputWrapperFocused,
                  ]}
                >
                  <Icon
                    name="account"
                    size={20}
                    color={
                      focusedField === "name"
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData({ ...formData, name: text })
                    }
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === "phone" && styles.inputWrapperFocused,
                  ]}
                >
                  <Icon
                    name="phone"
                    size={20}
                    color={
                      focusedField === "phone"
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.phone}
                    onChangeText={(text) =>
                      setFormData({ ...formData, phone: text })
                    }
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Age */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Age</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === "age" && styles.inputWrapperFocused,
                  ]}
                >
                  <Icon
                    name="calendar"
                    size={20}
                    color={
                      focusedField === "age"
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your age"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.age}
                    onChangeText={(text) =>
                      setFormData({ ...formData, age: text })
                    }
                    onFocus={() => setFocusedField("age")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // UPDATED HEADER TO SIMPLE BAR STYLE
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 50,
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    backButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.md,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.text,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    avatarSection: {
      alignItems: "center",
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
    },
    avatarContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 4,
      borderColor: theme.colors.background,
    },
    avatarImage: {
      width: 112,
      height: 112,
      borderRadius: 56,
    },
    avatarText: {
      fontSize: 40,
      fontWeight: "700",
      color: "#fff",
    },
    changePhotoButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    changePhotoText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    formCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    fieldGroup: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "600",
      marginBottom: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      minHeight: 50,
    },
    inputWrapperFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    inputIcon: {
      marginRight: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.text,
      paddingVertical: theme.spacing.sm,
    },
    pickerWrapper: {
      backgroundColor: theme.colors.background,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      minHeight: 50,
      justifyContent: "center",
    },
    pickerText: {
      fontSize: 15,
      color: theme.colors.text,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.md,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      marginTop: theme.spacing.md,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      minHeight: 50,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
  });

export default EditProfileScreen;
