import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { AppDispatch, RootState } from "../../store/store";
import {
  fetchAvailableCategories,
  selectCategoryForSession,
} from "../../store/slices/categorySlice";
import AppHeader from "../../components/common/AppHeader";


const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH >= 768;
const GRID_PADDING = scale(IS_TABLET ? 32 : 20);


interface CategoryItemProps {
  item: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  index: number;
}


const CategoryChip = memo(
  ({ item, isSelected, onSelect, index }: CategoryItemProps) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;


    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          delay: index * 40,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          delay: index * 40,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start();
    }, [index, scaleAnim, opacityAnim]);


    const handlePress = useCallback(() => {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.94,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start();
      onSelect(item.id);
    }, [item.id, onSelect, scaleAnim]);


    return (
      <Animated.View
        style={{
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
          marginRight: scale(10),
          marginBottom: verticalScale(10),
        }}
      >
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.chip,
            isSelected && styles.chipSelected,
            pressed && Platform.OS === "ios" && styles.chipPressed,
          ]}
          android_ripple={{
            color: `${item.color}30`,
            borderless: false,
          }}
        >
          <View
            style={[
              styles.chipIcon,
              {
                backgroundColor: isSelected ? item.color : `${item.color}20`,
              },
            ]}
          >
            <Icon
              name={item.icon}
              size={moderateScale(18)}
              color={isSelected ? "#FFFFFF" : item.color}
            />
          </View>
          <Text
            style={[styles.chipText, isSelected && styles.chipTextSelected]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }
);


CategoryChip.displayName = "CategoryChip";


const CategorySelectionScreen = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { availableCategories, loading } = useSelector(
    (state: RootState) => state.category
  );


  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);


  const selectedItem = availableCategories.find(
    (cat) => cat.id === selectedCategory
  );


  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    if (availableCategories.length === 0) {
      dispatch(fetchAvailableCategories());
    }
  }, [dispatch, availableCategories.length]);


  useEffect(() => {
    if (!loading && availableCategories.length > 0) {
      Animated.parallel([
        Animated.timing(headerFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(headerSlideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, availableCategories.length, headerFadeAnim, headerSlideAnim]);


  const handleContinue = useCallback(async () => {
    if (!selectedCategory) {
      Toast.show({
        type: "error",
        text1:
          t("categories.selectCategoryTitle") || "Select a category",
        text2:
          t("categories.selectCategorySubtitle") ||
          "Please choose a work category to continue",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }


    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();


    try {
      setSubmitting(true);
      await dispatch(
        selectCategoryForSession(selectedCategory)
      ).unwrap();
      Toast.show({
        type: "success",
        text1: t("categories.categorySelected") || "Category selected",
        position: "top",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Category selection error:", error);
      Toast.show({
        type: "error",
        text1: t("categories.selectionFailed") || "Selection failed",
        text2: t("common.tryAgain") || "Please try again",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  }, [selectedCategory, dispatch, t, buttonScaleAnim]);


  if (loading && availableCategories.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0B1020" />
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>
          {t("categories.loading") || "Loading categories..."}
        </Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B1020"
        translucent={false}
      />
      <AppHeader
        insets={{
          top: insets.top,
          bottom: insets.bottom,
          left: insets.left,
          right: insets.right,
        }}
        title={t("categories.headerTitle") || "Choose Category"}
        subtitle={
          t("categories.headerSubtitle") ||
          "Select your primary work type"
        }
        showCategory={false}
        showProfile={false}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: headerFadeAnim,
              transform: [{ translateY: headerSlideAnim }],
            },
          ]}
        >
          {/* Uncomment if you want to show hero section
          <View style={styles.heroSection}>
            <Text style={styles.welcomeText}>
              {t("categories.welcome") || "Welcome 👋"}
            </Text>
            <Text style={styles.mainTitle}>
              {t("categories.mainTitle") ||
                "What describes your\nwork best?"}
            </Text>
            <Text style={styles.subtitleText}>
              {t("categories.subtitle") ||
                "Select your primary category to personalize your experience"}
            </Text>
          </View>
          */}
        </Animated.View>


        <View style={styles.categoriesSection}>
          <Text style={styles.sectionLabel}>
            {t("categories.categoriesLabel") || "CATEGORIES"}
          </Text>
          <View style={styles.chipsContainer}>
            {availableCategories.map((item, index) => (
              <CategoryChip
                key={item.id}
                item={item}
                index={index}
                isSelected={selectedCategory === item.id}
                onSelect={setSelectedCategory}
              />
            ))}
          </View>
        </View>


        {selectedItem && (
          <Animated.View
            style={[
              styles.previewCard,
              {
                opacity: headerFadeAnim,
              },
            ]}
          >
            <View
              style={[
                styles.previewIcon,
                { backgroundColor: `${selectedItem.color}20` },
              ]}
            >
              <Icon
                name={selectedItem.icon}
                size={moderateScale(40)}
                color={selectedItem.color}
              />
            </View>
            <Text style={styles.previewTitle}>{selectedItem.name}</Text>
            <Text style={styles.previewDesc}>{selectedItem.description}</Text>
          </Animated.View>
        )}
      </ScrollView>


      {/* Footer with Continue Button */}
      <View
        style={[
          styles.footer,
          { 
            paddingBottom: insets.bottom + verticalScale(20) // Sensor padding + 20 extra
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <Pressable
            onPress={handleContinue}
            disabled={!selectedCategory || submitting}
            style={({ pressed }) => [
              styles.cta,
              (!selectedCategory || submitting) && styles.ctaDisabled,
              pressed && Platform.OS === "ios" && styles.ctaPressed,
            ]}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {t("categories.continue") || "Continue"}
                </Text>
                <Icon
                  name="arrow-right"
                  size={moderateScale(20)}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
});


CategorySelectionScreen.displayName = "CategorySelectionScreen";


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: moderateScale(14),
    color: "rgba(255,255,255,0.7)",
    marginTop: verticalScale(14),
    fontWeight: "500",
  },
  scrollContent: {
    paddingBottom: verticalScale(140), // Space for fixed footer
  },
  headerContainer: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: verticalScale(IS_SMALL_DEVICE ? 16 : 20),
    paddingBottom: verticalScale(IS_SMALL_DEVICE ? 24 : 32),
  },
  heroSection: {
    gap: verticalScale(10),
  },
  welcomeText: {
    fontSize: moderateScale(IS_SMALL_DEVICE ? 15 : 16),
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.2,
  },
  mainTitle: {
    fontSize: moderateScale(IS_SMALL_DEVICE ? 28 : 32),
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.8,
    lineHeight: moderateScale(IS_SMALL_DEVICE ? 36 : 40),
  },
  subtitleText: {
    fontSize: moderateScale(IS_SMALL_DEVICE ? 14 : 15),
    color: "rgba(255,255,255,0.5)",
    fontWeight: "400",
    lineHeight: moderateScale(21),
    marginTop: verticalScale(4),
  },
  categoriesSection: {
    paddingHorizontal: GRID_PADDING,
    marginBottom: verticalScale(24),
  },
  sectionLabel: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.2,
    marginBottom: verticalScale(16),
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: moderateScale(24),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(14),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chipSelected: {
    backgroundColor: "rgba(108,92,231,0.2)",
    borderColor: "#6C5CE7",
    borderWidth: 2,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipIcon: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  previewCard: {
    marginHorizontal: GRID_PADDING,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: moderateScale(20),
    padding: scale(24),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  previewIcon: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(16),
  },
  previewTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  previewDesc: {
    fontSize: moderateScale(14),
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: moderateScale(20),
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: GRID_PADDING,
    paddingTop: verticalScale(20), // Top padding for footer
    backgroundColor: "#0B1020",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  cta: {
    backgroundColor: "#6C5CE7",
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(IS_SMALL_DEVICE ? 16 : 18),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(10),
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: moderateScale(IS_SMALL_DEVICE ? 16 : 17),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});


export default CategorySelectionScreen;
