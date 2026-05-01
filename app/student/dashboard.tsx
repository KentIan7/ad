/**
 * Student Dashboard Screen
 * Shows progress analytics.
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

interface StudentDashboardScreenProps {
  navigation?: any;
}

const StudentDashboardScreen: React.FC<StudentDashboardScreenProps> = () => {
  const { user } = useAuth();
  const { clearances, studentClearances } = useApp();
  const { width } = useWindowDimensions();

  const assignedClearances = useMemo(() => {
    return studentClearances
      .filter((studentClearance) => studentClearance.studentId === user?.id)
      .filter((studentClearance) => {
        const currentClearance =
          clearances.find((clearance) => clearance.id === studentClearance.clearanceId) ||
          studentClearance.clearance;

        return Boolean(currentClearance?.departmentsAllowed.includes(user?.department || ''));
      });
  }, [clearances, studentClearances, user?.department, user?.id]);

  const totals = useMemo(() => {
    const totalAssigned = assignedClearances.length;
    const approved = assignedClearances.filter((clearance) => clearance.status === 'approved').length;
    const rejected = assignedClearances.filter((clearance) => clearance.status === 'rejected').length;
    const pending = assignedClearances.filter((clearance) => clearance.status === 'pending').length;
    const completionRate = totalAssigned === 0 ? 0 : Math.round((approved / totalAssigned) * 100);
    return {
      totalAssigned,
      approved,
      rejected,
      pending,
      completionRate,
    };
  }, [assignedClearances]);

  const renderProgressBar = (label: string, value: number, color: string) => (
    <View style={styles.progressRow} key={label}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Analytics</Text>
        <Text style={styles.sectionSubtitle}>
          A quick view of your clearance completion and approval progress.
        </Text>

        <View style={[styles.analyticsGrid, width < 600 && styles.analyticsGridMobile]}>
          <Card style={[styles.analyticsCard, width < 600 && styles.analyticsCardMobile]}>
            <Text style={[styles.analyticsValue, width < 600 && styles.analyticsValueMobile]}>{totals.completionRate}%</Text>
            <Text style={styles.analyticsLabel}>Completion Rate</Text>
          </Card>
          <Card style={[styles.analyticsCard, width < 600 && styles.analyticsCardMobile]}>
            <Text style={[styles.analyticsValue, width < 600 && styles.analyticsValueMobile]}>{totals.pending}</Text>
            <Text style={styles.analyticsLabel}>Pending Review</Text>
          </Card>
        </View>

        <Card>
          <Text style={styles.chartTitle}>Progress Breakdown</Text>
          {renderProgressBar('Approved', totals.completionRate, Colors.approved)}
          {renderProgressBar(
            'Needs Attention',
            totals.totalAssigned === 0 ? 0 : Math.round((totals.rejected / totals.totalAssigned) * 100),
            Colors.rejected
          )}
        </Card>

        <Card>
          <Text style={styles.chartTitle}>Current Totals</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Assigned Clearances</Text>
            <Text style={styles.metricValue}>{totals.totalAssigned}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Approved</Text>
            <Text style={styles.metricValue}>{totals.approved}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Pending Review</Text>
            <Text style={styles.metricValue}>{totals.pending}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Rejected</Text>
            <Text style={styles.metricValue}>{totals.rejected}</Text>
          </View>
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
  analyticsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  analyticsCard: {
    flex: 1,
    alignItems: 'center',
  },
  analyticsValue: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  analyticsLabel: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  chartTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  progressRow: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  progressValue: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  progressTrack: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metricLabel: {
    ...Typography.body,
    color: Colors.textLight,
  },
  metricValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '700',
  },
  analyticsGridMobile: {
    flexDirection: 'column',
  },
  analyticsCardMobile: {
    width: '100%',
  },
  analyticsValueMobile: {
    fontSize: 28,
  },
});

export default StudentDashboardScreen;
