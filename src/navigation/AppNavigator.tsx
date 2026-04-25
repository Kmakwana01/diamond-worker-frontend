import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { RootState, AppDispatch } from "../store/store";
import { setUser, setAuthenticated } from "../store/slices/authSlice";
import { selectCategoryForSession } from "../store/slices/categorySlice";
import { loadLanguage } from "../store/slices/appSlice";
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { STORAGE_KEYS } from "../utils/constants";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import HelpCenterScreen from "../screens/support/HelpCenterScreen";
import AboutScreen from "../screens/support/AboutScreen";
import { navigationRef } from "../services/navigationService";
import { setSessionExpiredCallback } from "../api/client"; // ✅ Import

const RootStack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // ✅ Set up session expired callback
    setSessionExpiredCallback(() => {
      console.log("🚨 Session expired callback triggered");
      dispatch(setAuthenticated(false));
      dispatch(setUser(null));
    });

    const initializeApp = async () => {
      console.log("🚀 [AppNavigator] Initializing...");
      
      // ⏱️ Safety timeout: Ensure app proceeds even if initialization is slow
      const timeoutId = setTimeout(() => {
        console.log("⏱️ [AppNavigator] Initialization timeout hit, forcing display");
        setIsLoading(false);
      }, 4000); 

      try {
        await dispatch(loadLanguage()).catch(e => console.error("loadLanguage fail:", e));

        const [token, userData, refreshToken] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN).catch(() => null),
          AsyncStorage.getItem(STORAGE_KEYS.USER).catch(() => null),
          AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN).catch(() => null),
        ]);

        console.log("🔍 [AppNavigator] Auth status:", { hasToken: !!token, hasUser: !!userData });

        if (token && userData && refreshToken) {
          try {
            const user = JSON.parse(userData);
            dispatch(setUser(user));
            dispatch(setAuthenticated(true));

            const storedCategories = await AsyncStorage.getItem("userCategories").catch(() => null);
            const storedPrimary = await AsyncStorage.getItem("selectedCategory").catch(() => null);
            
            const categoryToRestore =
              storedPrimary ||
              (storedCategories ? JSON.parse(storedCategories)[0] : "DIAMOND");

            console.log("📦 [AppNavigator] Restoring category:", categoryToRestore);

            // Fast race for category config
            await Promise.race([
              dispatch(selectCategoryForSession(categoryToRestore)).unwrap(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
            ]).catch(e => console.warn("⚠️ Category fetch was slow/failed, skipping wait:", e.message));

          } catch (parseError) {
            console.error("❌ Auth data parse error:", parseError);
            dispatch(setAuthenticated(false));
          }
        } else {
          dispatch(setAuthenticated(false));
          console.log("👤 [AppNavigator] No valid session found");
        }
      } catch (error) {
        console.error("❌ [AppNavigator] Fatal init error:", error);
        dispatch(setAuthenticated(false));
      } finally {
        clearTimeout(timeoutId);
        console.log("🏁 [AppNavigator] Initialization complete");
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f1724",
        }}
      >
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Tabs" component={MainTabNavigator} />
            <RootStack.Screen name="ProfileMain" component={ProfileScreen} />
            <RootStack.Screen
              name="EditProfile"
              component={EditProfileScreen}
            />
            <RootStack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <RootStack.Screen name="About" component={AboutScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
