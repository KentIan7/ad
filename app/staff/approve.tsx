/**
 * Staff Approve Screen
 * Staff can add remarks when approving a clearance part
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextInput } from '@/components/ui/text-input';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
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

interface StaffApproveScreenProps {
  route?: any;
  navigation?: any;
}

const StaffApproveScreen: React.FC<StaffApproveScreenProps> = ({ route, navigation }) => {
  const { user } = useAuth();
  const { approveClearance } = useApp();
  const [remarks, setRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { studentClearanceId } = route?.params || {};

  const handleApprove = async () => {
    if (!studentClearanceId) {
      Alert.alert('Error', 'Invalid clearance information');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      await approveClearance(studentClearanceId, user?.id || '', remarks);

      Alert.alert('Success', 'Clearance approved successfully', [
        {
          text: 'OK',
          onPress: () => navigation?.goBack(),
        },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to approve clearance');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Approve Clearance</Text>
        </View>
      </View>

      {/* Remarks Section */}
      <Card>
        <Text style={styles.sectionTitle}>Add Remarks (Optional)</Text>
        <Text style={styles.description}>
          Add any notes or remarks about this approval. This will be visible to the student.
        </Text>

        <TextInput
          label="Remarks"
          placeholder="e.g., All equipment checked and configured..."
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={4}
        />
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={() => navigation?.goBack()}
          variant="secondary"
          style={styles.button}
          disabled={isProcessing}
        />
        <Button
          title={isProcessing ? 'Processing...' : '✅ Approve'}
          onPress={handleApprove}
          variant="success"
          style={styles.button}
          disabled={isProcessing}
        />
      </View>

      {isProcessing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.approved} />
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  backButtonText: {
    color: Colors.surface,
    fontWeight: '600',
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    ...Typography.h3,
    color: Colors.approved,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});

export default StaffApproveScreen;
