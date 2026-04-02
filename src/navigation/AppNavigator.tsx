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
      try {
        await dispatch(loadLanguage());

        const [token, userData, refreshToken] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        ]);

        console.log("🔍 Auth check:", {
          token: !!token,
          user: !!userData,
          refresh: !!refreshToken,
        });

        // ✅ FIX: Require ALL THREE tokens for valid session
        if (token && userData && refreshToken) {
          const user = JSON.parse(userData);
          dispatch(setUser(user));
          dispatch(setAuthenticated(true));

          // ✅ RESTORE CATEGORY FROM STORAGE
          const storedCategories = await AsyncStorage.getItem("userCategories");
          const storedPrimary = await AsyncStorage.getItem("selectedCategory");
          const categoryToRestore =
            storedPrimary ||
            (storedCategories ? JSON.parse(storedCategories)[0] : "DIAMOND");

          await dispatch(selectCategoryForSession(categoryToRestore)).unwrap();
          console.log("✅ Restored category:", categoryToRestore);
        } else {
          // ✅ Clear incomplete sessions
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.USER,
          ]);
          dispatch(setAuthenticated(false));
          console.log("❌ Incomplete auth data - forcing login");
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        dispatch(setAuthenticated(false));
      } finally {
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
