import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import Toast from "react-native-toast-message";
import store from "./src/store/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { LogBox, View, StatusBar } from "react-native";
import i18n from "./src/utils/i18n";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initializeRemoteConfig } from "./src/services/firebaseConfig";
import { initializeAdMob } from "./src/utils/admob";
import * as SplashScreen from "expo-splash-screen";

LogBox.ignoreLogs([
  "Non-serializable values",
  "Open debugger to view warnings",
]);

export default function App() {
  useEffect(() => {
    async function prepare() {
      try {
        console.log("🚀 [App] Starting preparation...");
        
        // Parallel init with a tight 3s timeout
        const initPromise = Promise.all([
          initializeRemoteConfig().catch(e => console.error("RemoteConfig fail:", e)),
          initializeAdMob().catch(e => console.error("AdMob fail:", e)),
          new Promise(resolve => setTimeout(resolve, 200))
        ]);

        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));

        await Promise.race([initPromise, timeoutPromise]);
        console.log("✅ [App] Init phase finished");
      } catch (e) {
        console.warn("❌ [App] Preparation error:", e);
      } finally {
        // Attempt to hide splash screen multiple times
        console.log("🔓 [App] Hiding splash screen");
        SplashScreen.hideAsync().catch(() => {});
        setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 500);
        setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 2000);
      }
    }
    prepare();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <View style={{ flex: 1, backgroundColor: "#0f1724" }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0f1724"
          translucent
        />
        <Provider store={store}>
          <SafeAreaProvider>
            {/* Render navigator immediately, it handles its own loading state */}
            <AppNavigator />
            <Toast />
          </SafeAreaProvider>
        </Provider>
      </View>
    </I18nextProvider>
  );
}
