/**
 * Clearance Detail Screen
 * Shows detailed status of an assigned clearance
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface ClearanceDetailScreenProps {
  route?: any;
  navigation?: any;
}

const ClearanceDetailScreen: React.FC<ClearanceDetailScreenProps> = ({ route, navigation }) => {
  const { studentClearances, staffRoles } = useApp();
  const { clearanceId } = route?.params || {};

  const studentClearance = studentClearances.find((clearance) => clearance.id === clearanceId);

  if (!studentClearance) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Clearance not found</Text>
      </View>
    );
  }

  const clearance = studentClearance.clearance;
  const assignedDate = new Date(studentClearance.submittedAt);
  const completedDate = studentClearance.completedAt ? new Date(studentClearance.completedAt) : null;
  const isComplete = studentClearance.status === 'approved';
  const hasRejection = studentClearance.status === 'rejected';
  const roleName = staffRoles.find((role) => role.id === clearance.staffRole)?.name || 'Unassigned Staff Role';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation?.goBack()} variant="secondary" size="small" />
      </View>

      <Card>
        <Text style={styles.clearanceName}>{clearance.name}</Text>
        <Text style={styles.clearanceDescription}>{clearance.description}</Text>
      </Card>

      <Card>
        <View style={styles.statusOverview}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Status</Text>
            <StatusBadge status={hasRejection ? 'rejected' : isComplete ? 'approved' : 'pending'} />
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Assigned Staff Role</Text>
            <Text style={styles.progressText}>{roleName}</Text>
          </View>
        </View>

        {studentClearance.remarks ? (
          <View style={[styles.remarksContainer, hasRejection && styles.remarksRejected]}>
            <Text style={styles.remarksLabel}>
              {studentClearance.status === 'approved' ? 'Remarks' : 'Reason'}
            </Text>
            <Text style={styles.remarksText}>{studentClearance.remarks}</Text>
          </View>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.timelineTitle}>Timeline</Text>
        <View style={styles.timelineItem}>
          <Text style={styles.timelineDate}>Assigned</Text>
          <Text style={styles.timelineTime}>{assignedDate.toLocaleString()}</Text>
        </View>
        {completedDate ? (
          <View style={styles.timelineItem}>
            <Text style={styles.timelineDate}>Completed</Text>
            <Text style={styles.timelineTime}>{completedDate.toLocaleString()}</Text>
          </View>
        ) : null}
      </Card>

      {hasRejection ? (
        <Card style={styles.actionCard}>
          <Text style={styles.actionTitle}>Changes Required</Text>
          <Text style={styles.actionText}>
            This clearance has been rejected. Please review the reason above and contact the assigned office if you need clarification.
          </Text>
        </Card>
      ) : null}

      {isComplete && !hasRejection ? (
        <Card style={styles.completeCard}>
          <Text style={styles.completeTitle}>Clearance Complete</Text>
          <Text style={styles.completeText}>
            All approval steps for this clearance have been completed successfully.
          </Text>
        </Card>
      ) : null}
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
  errorText: {
    ...Typography.h3,
    color: Colors.rejected,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  clearanceName: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  clearanceDescription: {
    ...Typography.body,
    color: Colors.textLight,
  },
  statusOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
  progressText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  remarksContainer: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: Colors.approved,
    borderRadius: 8,
  },
  remarksRejected: {
    borderLeftColor: Colors.rejected,
  },
  remarksLabel: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  remarksText: {
    ...Typography.body,
    color: Colors.text,
  },
  timelineTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  timelineItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timelineDate: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  timelineTime: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  actionCard: {
    backgroundColor: Colors.rejectedBg,
    marginTop: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.rejected,
  },
  actionTitle: {
    ...Typography.h3,
    color: Colors.rejected,
    marginBottom: Spacing.sm,
  },
  actionText: {
    ...Typography.body,
    color: Colors.text,
  },
  completeCard: {
    backgroundColor: Colors.approvedBg,
    marginTop: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.approved,
  },
  completeTitle: {
    ...Typography.h3,
    color: Colors.approved,
    marginBottom: Spacing.sm,
  },
  completeText: {
    ...Typography.body,
    color: Colors.text,
  },
});

export default ClearanceDetailScreen;
