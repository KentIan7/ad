/**
 * Root Layout
 * Wraps the entire app with Auth and App Context providers
 * Handles all navigation routing
 * Includes GestureHandlerRootView for drawer swipe gestures
 */

import { Colors } from '@/constants/colors';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppProvider>
          <SafeAreaView style={styles.container}>
            <RootNavigator />
            <StatusBar style="auto" />
          </SafeAreaView>
        </AppProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
