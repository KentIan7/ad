/**
 * Login Screen
 * Allows users to authenticate with email and password
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

interface LoginScreenProps {
  navigation?: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const handleLogin = async () => {
    const newErrors: {email?: string; password?: string} = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Failed', (error as any).message || 'Invalid credentials');
    }
  };

  const handleForgotPassword = () => {
    navigation?.navigate('ForgotPassword', { email });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>University Clearance System</Text>
        <Text style={styles.subtitle}>Sign In to Your Account</Text>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>👋 Welcome!</Text>
        <Text style={styles.infoText}>
          Please log in with the credentials provided by your department.
        </Text>
      </View>

      {/* Login Form */}
      <View style={styles.form}>
        <TextInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(val) => { setEmail(val); setErrors(prev => ({ ...prev, email: undefined })); }}
          keyboardType="email-address"
         // autoCapitalize="none"
          editable={!isLoading}
          error={errors.email}
        />

        <TextInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(val) => { setPassword(val); setErrors(prev => ({ ...prev, password: undefined })); }}
          secureTextEntry
          editable={!isLoading}
          error={errors.password}
        />

        <TouchableOpacity 
          onPress={handleForgotPassword} 
          style={styles.forgotPasswordContainer}
          disabled={isLoading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title={isLoading ? 'Signing in...' : 'Sign In'}
          onPress={handleLogin}
          disabled={isLoading}
          style={styles.loginButton}
        />
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
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textLight,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  forgotPasswordText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});

export default LoginScreen;

