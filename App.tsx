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

LogBox.ignoreLogs([
  "Non-serializable values",
  "Open debugger to view warnings",
]);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initializeRemoteConfig();
        // Keep this for any initialization logic
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

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
            <AppNavigator />
            <Toast />
          </SafeAreaProvider>
        </Provider>
      </View>
    </I18nextProvider>
  );
}
