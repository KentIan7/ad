/**
 * Reset Password Screen
 * Allows users to enter a reset token and set a new password
 */

import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ResetPasswordScreenProps {
  route?: {
    params?: {
      email?: string;
      token?: string;
    }
  };
  navigation?: any;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ route, navigation }) => {
  const { resetPassword, isLoading } = useAuth();
  const [token, setToken] = useState(route?.params?.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter the reset token');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await resetPassword(token, newPassword);
      Alert.alert(
        'Success',
        'Your password has been reset successfully. You can now log in with your new password.',
        [
          { 
            text: 'Login', 
            onPress: () => navigation?.navigate('Login') 
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter the token sent to your email and your new password</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          label="Reset Token"
          placeholder="Enter token"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          editable={!isLoading}
        />

        <TextInput
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <TextInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <Button
          title={isLoading ? 'Resetting...' : 'Reset Password'}
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitButton}
        />

        <TouchableOpacity 
          onPress={() => navigation?.goBack()} 
          style={styles.backButton}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
  },
  form: {
    marginBottom: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  backButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});

export default ResetPasswordScreen;
