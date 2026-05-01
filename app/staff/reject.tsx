/**
 * Staff Reject Screen
 * Staff must provide remarks when rejecting a clearance part
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
    useWindowDimensions,
} from 'react-native';

interface StaffRejectScreenProps {
  route?: any;
  navigation?: any;
}

const StaffRejectScreen: React.FC<StaffRejectScreenProps> = ({ route, navigation }) => {
  const { user } = useAuth();
  const { rejectClearance } = useApp();
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { studentClearanceId } = route?.params || {};
  const { width } = useWindowDimensions();

  const handleReject = async () => {
    if (!studentClearanceId) {
      Alert.alert('Error', 'Invalid clearance information');
      return;
    }

    if (!remarks.trim()) {
      setRemarksError('Please provide a reason for rejection');
      return;
    }
    setRemarksError('');

    setIsProcessing(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      await rejectClearance(studentClearanceId, user?.id || '', remarks);

      Alert.alert('Success', 'Clearance rejected successfully', [
        {
          text: 'OK',
          onPress: () => navigation?.goBack(),
        },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to reject clearance');
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
          <Text style={styles.title}>Reject Clearance</Text>
        </View>
      </View>

      {/* Warning Card */}
      <Card style={styles.warningCard}>
        <Text style={styles.warningTitle}>⚠️ Rejection</Text>
        <Text style={styles.warningText}>
          When you reject this clearance, the student will need to resubmit it after addressing the issues mentioned in the remarks.
        </Text>
      </Card>



      {/* Remarks Section */}
      <Card>
        <Text style={styles.sectionTitle}>Reason for Rejection (Required)</Text>
        <Text style={styles.description}>
          Please explain why this clearance is being rejected. This will help the student understand what needs to be fixed.
        </Text>

        <TextInput
          label="Rejection Reason"
          placeholder="e.g., You still have 3 books checked out. Please return them first."
          value={remarks}
          onChangeText={(val) => { setRemarks(val); if (val.trim()) setRemarksError(''); }}
          multiline
          numberOfLines={4}
          error={remarksError || undefined}
        />
      </Card>

      {/* Action Buttons */}
      <View style={[styles.buttonContainer, width < 600 && styles.buttonContainerMobile]}>
        <Button
          title="Cancel"
          onPress={() => navigation?.goBack()}
          variant="secondary"
          style={styles.button}
          disabled={isProcessing}
        />
        <Button
          title={isProcessing ? 'Processing...' : '❌ Reject'}
          onPress={handleReject}
          variant="danger"
          style={styles.button}
          disabled={isProcessing || !remarks.trim()}
        />
      </View>

      {isProcessing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.rejected} />
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
  warningCard: {
    backgroundColor: Colors.rejectedBg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.rejected,
    marginBottom: Spacing.lg,
  },
  warningTitle: {
    ...Typography.h3,
    color: Colors.rejected,
    marginBottom: Spacing.sm,
  },
  warningText: {
    ...Typography.body,
    color: Colors.rejected,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    ...Typography.h3,
    color: Colors.rejected,
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
  buttonContainerMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  button: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});

export default StaffRejectScreen;
