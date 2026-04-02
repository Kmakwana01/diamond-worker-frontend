// src/components/layout/AppScreen.tsx
import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import appTheme from "@/styles/appTheme";

interface Props {
  children: React.ReactNode;
  withKeyboard?: boolean;
}

const AppScreen: React.FC<Props> = ({ children, withKeyboard = false }) => {
  const { colors } = appTheme;
  const Wrapper = withKeyboard ? KeyboardAvoidingView : View;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />
      <Wrapper
        style={[styles.content, { backgroundColor: colors.background }]}
        behavior={withKeyboard && Platform.OS === "ios" ? "padding" : undefined}
      >
        {children}
      </Wrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default AppScreen;
