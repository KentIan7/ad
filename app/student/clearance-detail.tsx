/**
 * Clearance Detail Screen
 * Shows detailed status of a submitted clearance with all parts
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import React from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface ClearanceDetailScreenProps {
  route?: any;
  navigation?: any;
}

const ClearanceDetailScreen: React.FC<ClearanceDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { studentClearances } = useApp();
  const { clearanceId } = route?.params || {};

  const studentClearance = studentClearances.find(sc => sc.id === clearanceId);

  if (!studentClearance) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Clearance not found</Text>
      </View>
    );
  }

  const clearance = studentClearance.clearance;
  const submittedDate = new Date(studentClearance.submittedAt);
  const completedDate = studentClearance.completedAt
    ? new Date(studentClearance.completedAt)
    : null;

  // Calculate progress
  let approvedCount = 0;
  let rejectedCount = 0;
  studentClearance.parts.forEach(part => {
    if (part.status === 'approved') approvedCount++;
    if (part.status === 'rejected') rejectedCount++;
  });

  const pendingCount = studentClearance.parts.length - approvedCount - rejectedCount;
  const progressPercent = Math.round(
    ((approvedCount + rejectedCount) / studentClearance.parts.length) * 100
  );

  const isComplete = pendingCount === 0;
  const hasRejection = rejectedCount > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={() => navigation?.goBack()}
          variant="secondary"
          size="small"
        />
      </View>

      {/* Clearance Title */}
      <Card>
        <Text style={styles.clearanceName}>{clearance.name}</Text>
        <Text style={styles.clearanceDescription}>{clearance.description}</Text>
      </Card>

      {/* Status Overview */}
      <Card>
        <View style={styles.statusOverview}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Status</Text>
            <StatusBadge
              status={
                hasRejection ? 'rejected' : isComplete ? 'approved' : 'pending'
              }
            />
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Progress</Text>
            <Text style={styles.progressText}>{progressPercent}%</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercent}%`,
                backgroundColor: hasRejection ? Colors.rejected : Colors.approved,
              },
            ]}
          />
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>✅ {approvedCount} Approved</Text>
          <Text style={styles.statText}>⏳ {pendingCount} Pending</Text>
          {rejectedCount > 0 && (
            <Text style={[styles.statText, { color: Colors.rejected }]}>
              ❌ {rejectedCount} Rejected
            </Text>
          )}
        </View>
      </Card>

      {/* Timeline */}
      <Card>
        <Text style={styles.timelineTitle}>📅 Timeline</Text>
        <View style={styles.timelineItem}>
          <Text style={styles.timelineDate}>Submitted</Text>
          <Text style={styles.timelineTime}>{submittedDate.toLocaleString()}</Text>
        </View>

        {completedDate && (
          <View style={styles.timelineItem}>
            <Text style={styles.timelineDate}>Completed</Text>
            <Text style={styles.timelineTime}>{completedDate.toLocaleString()}</Text>
          </View>
        )}
      </Card>

      {/* Approval Steps */}
      <Text style={styles.stepsTitle}>📋 Approval Steps</Text>

      <FlatList
        data={studentClearance.parts}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <Card
            style={[
              styles.stepCard,
              item.status === 'rejected' && styles.stepCardRejected,
            ]}
          >
            <View style={styles.stepHeader}>
              <View style={styles.stepInfo}>
                <Text style={styles.stepNumber}>Step {index + 1}</Text>
                <Text style={styles.stepName}>{item.name}</Text>
                <Text style={styles.stepRole}>{item.staffRole}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            {item.remarks && (
              <View
                style={[
                  styles.remarksContainer,
                  item.status === 'rejected' && styles.remarksRejected,
                ]}
              >
                <Text style={styles.remarksLabel}>
                  {item.status === 'approved' ? '✍️ Remarks' : '⚠️ Reason'}
                </Text>
                <Text style={styles.remarksText}>{item.remarks}</Text>
              </View>
            )}

            {item.approvedAt && (
              <Text style={styles.approvedAt}>
                {item.status === 'approved' ? '✅ Approved' : '❌ Rejected'} on{' '}
                {new Date(item.approvedAt).toLocaleString()}
              </Text>
            )}
          </Card>
        )}
      />

      {/* Action */}
      {hasRejection && (
        <Card style={styles.actionCard}>
          <Text style={styles.actionTitle}>❌ Changes Required</Text>
          <Text style={styles.actionText}>
            This clearance has been rejected. Please address the reasons mentioned above and resubmit your clearance request.
          </Text>
          <Button
            title="Resubmit Clearance"
            onPress={() => navigation?.goBack()}
            variant="primary"
            style={styles.actionButton}
          />
        </Card>
      )}

      {isComplete && !hasRejection && (
        <Card style={styles.completeCard}>
          <Text style={styles.completeTitle}>🎉 Clearance Complete!</Text>
          <Text style={styles.completeText}>
            Congratulations! All approval steps have been completed successfully.
          </Text>
        </Card>
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
  },
  statusLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
  progressText: {
    ...Typography.h2,
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginVertical: Spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statText: {
    ...Typography.caption,
    color: Colors.approved,
    fontWeight: '600',
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
  stepsTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  stepCard: {
    marginVertical: Spacing.sm,
  },
  stepCardRejected: {
    backgroundColor: Colors.rejectedBg,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepInfo: {
    flex: 1,
  },
  stepNumber: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  stepName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  stepRole: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
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
  approvedAt: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.md,
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
    marginBottom: Spacing.md,
  },
  actionButton: {
    marginTop: Spacing.md,
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
