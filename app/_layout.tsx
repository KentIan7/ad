/**
 * Root Layout
 * Wraps the entire app with Auth and App Context providers
 * Handles all navigation routing
 */

import { Colors } from '@/constants/colors';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <SafeAreaView style={styles.container}>
          <RootNavigator />
          <StatusBar style="auto" />
        </SafeAreaView>
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
