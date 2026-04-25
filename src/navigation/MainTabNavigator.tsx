import React from "react";
import { View, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DashboardScreen from "../screens/home/DashboardScreen";
import WorkListScreen from "../screens/work/WorkListScreen";
import ReportsScreen from "../screens/reports/ReportsScreen";
import PaymentsScreen from "@/screens/payment/PaymentScreen";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const NoHeader = { headerShown: false };

const WorkStack = () => (
  <Stack.Navigator screenOptions={NoHeader}>
    <Stack.Screen name="WorkList" component={WorkListScreen} />
  </Stack.Navigator>
);

const PaymentStack = () => (
  <Stack.Navigator screenOptions={NoHeader}>
    <Stack.Screen name="PaymentList" component={PaymentsScreen} />
  </Stack.Navigator>
);

const tabIcons: any = {
  Dashboard: "view-dashboard",
  Work: "briefcase",
  Reports: "chart-bar",
  Payments: "credit-card",
};

const MainTabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={NoHeader}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Work" component={WorkStack} />
    <Tab.Screen name="Reports" component={ReportsScreen} />
    <Tab.Screen name="Payments" component={PaymentStack} />
  </Tab.Navigator>
);

const CustomTabBar = ({ state, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { showAd } = useInterstitialAd();

  return (
    <View
      style={[
        styles.container,
        {
          // lift bar above system nav
          paddingBottom:
            Platform.OS === 'android'
              ? (insets.bottom || 0) + 8
              : insets.bottom,
        },
      ]}
    >
      <View style={styles.dock}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => {
                showAd();
                navigation.navigate(route.name);
              }}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <Icon
                  name={tabIcons[route.name]}
                  size={24}
                  color={isFocused ? '#6C5CE7' : 'rgba(255,255,255,0.4)'}
                />
                {isFocused && <View style={styles.indicator} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18,18,28,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  dock: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 12
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#6C5CE7',
  },
});


export default MainTabNavigator;
