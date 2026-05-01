/**
 * Student Settings Screen
 * Allows students to manage their account profile and change password.
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextInput } from '@/components/ui/text-input';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

interface StudentSettingsScreenProps {
  navigation?: any;
}

const StudentSettingsScreen: React.FC<StudentSettingsScreenProps> = () => {
  const { user, updateAccountSettings, isLoading } = useAuth();

  const [settingsName, setSettingsName] = useState(user?.name || '');
  const [settingsEmail, setSettingsEmail] = useState(user?.email || '');
  const [settingsPhone, setSettingsPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsErrors, setSettingsErrors] = useState<{
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    setSettingsName(user?.name || '');
    setSettingsEmail(user?.email || '');
    setSettingsPhone(user?.phone || '');
  }, [user?.name, user?.email, user?.phone]);

  const handleSaveSettings = async () => {
    const nextErrors: typeof settingsErrors = {};

    if (!settingsName.trim()) nextErrors.name = 'Name is required';
    if (!settingsEmail.trim()) nextErrors.email = 'Email is required';
    else if (!settingsEmail.includes('@')) nextErrors.email = 'Please enter a valid email';

    if (newPassword && newPassword.length < 6) {
      nextErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    const emailChanged = settingsEmail.trim().toLowerCase() !== (user?.email || '').toLowerCase();
    const passwordChanged = newPassword.trim().length > 0;
    if ((emailChanged || passwordChanged) && !currentPassword.trim()) {
      nextErrors.currentPassword = 'Current password is required for email or password changes';
    }

    setSettingsErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await updateAccountSettings({
        name: settingsName,
        email: settingsEmail,
        phone: settingsPhone,
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Your account settings were updated.');
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'Unable to update account settings');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <Text style={styles.sectionSubtitle}>
          Update your profile details. Current password is required for email or password changes.
        </Text>

        <Card>
          <TextInput
            label="Full Name"
            placeholder="Enter your full name"
            value={settingsName}
            onChangeText={(value) => {
              setSettingsName(value);
              setSettingsErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={settingsErrors.name}
          />
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={settingsEmail}
            onChangeText={(value) => {
              setSettingsEmail(value);
              setSettingsErrors((prev) => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            error={settingsErrors.email}
          />
          <TextInput
            label="Phone Number"
            placeholder="Enter your phone number"
            value={settingsPhone}
            onChangeText={setSettingsPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            label="Current Password"
            placeholder="Required for email or password changes"
            value={currentPassword}
            onChangeText={(value) => {
              setCurrentPassword(value);
              setSettingsErrors((prev) => ({ ...prev, currentPassword: undefined }));
            }}
            secureTextEntry
            error={settingsErrors.currentPassword}
          />
          <TextInput
            label="New Password"
            placeholder="Leave blank to keep your current password"
            value={newPassword}
            onChangeText={(value) => {
              setNewPassword(value);
              setSettingsErrors((prev) => ({ ...prev, newPassword: undefined }));
            }}
            secureTextEntry
            error={settingsErrors.newPassword}
          />
          <TextInput
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setSettingsErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            secureTextEntry
            error={settingsErrors.confirmPassword}
          />
          <Button
            title={isLoading ? 'Saving...' : 'Save Changes'}
            onPress={handleSaveSettings}
            variant="primary"
            disabled={isLoading}
            style={styles.settingsButton}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textLight,
    marginBottom: Spacing.lg,
  },
  settingsButton: {
    marginTop: Spacing.md,
  },
});

export default StudentSettingsScreen;
