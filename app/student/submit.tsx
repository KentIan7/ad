/**
 * Student Submit Clearance Screen
 * Student confirms and submits a clearance request
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

interface StudentSubmitScreenProps {
  route?: any;
  navigation?: any;
}

const StudentSubmitScreen: React.FC<StudentSubmitScreenProps> = ({
  route,
  navigation,
}) => {
  const { user } = useAuth();
  const { clearances, submitStudentClearance, staffRoles } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const { clearanceId } = route?.params || {};
  const clearance = clearances.find(c => c.id === clearanceId);

  if (!clearance) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Clearance not found</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!user?.id) {
        throw new Error('User not found');
      }

      submitStudentClearance(user.id, clearanceId);

      Alert.alert('Success', 'Clearance submitted successfully!', [
        {
          text: 'OK',
          onPress: () => navigation?.navigate('StudentDashboard'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit clearance');
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
          <Text style={styles.title}>Submit Clearance</Text>
        </View>
      </View>

      {/* Clearance Details */}
      <Card>
        <Text style={styles.infoLabel}>Clearance</Text>
        <Text style={styles.clearanceName}>{clearance.name}</Text>
        <Text style={styles.description}>{clearance.description}</Text>
      </Card>

      {/* Approval Details */}
      <Card>
        <Text style={styles.stepsTitle}>📋 Approval Details</Text>
        <Text style={styles.stepsDescription}>
          This clearance request will be sent to and reviewed by:
        </Text>

        <View style={styles.stepItem}>
          <View style={styles.stepInfo}>
            <Text style={styles.stepName}>Assigned Staff Role</Text>
            <Text style={styles.stepAssignee}>
              {staffRoles.find(r => r.id === clearance.staffRole)?.name || clearance.staffRole}
            </Text>
          </View>
        </View>
      </Card>

      {/* Info */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoTitle}>What happens next?</Text>
        <Text style={styles.infoText}>
          After you submit, the designated staff will review your request. You can track the status in real-time. If it is rejected, you'll receive details on what needs to be fixed.
        </Text>
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
          title={isProcessing ? 'Submitting...' : '✅ Submit Clearance'}
          onPress={handleSubmit}
          variant="primary"
          style={styles.button}
          disabled={isProcessing}
        />
      </View>

      {isProcessing && (
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
  errorText: {
    ...Typography.h3,
    color: Colors.rejected,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  clearanceName: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.textLight,
  },
  stepsTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  stepsDescription: {
    ...Typography.body,
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    color: Colors.textInverse,
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  stepAssignee: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  infoText: {
    ...Typography.body,
    color: Colors.primary,
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

export default StudentSubmitScreen;
