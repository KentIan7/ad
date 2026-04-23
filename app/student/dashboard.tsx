/**
 * Student Dashboard Screen
 * Shows student their available clearances and submitted clearances
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface StudentDashboardScreenProps {
  navigation?: any;
}

const StudentDashboardScreen: React.FC<StudentDashboardScreenProps> = ({
  navigation,
}) => {
  const { user, logout } = useAuth();
  const { clearances, studentClearances } = useApp();

  // Get clearances available to this student's department
  const availableClearances = clearances.filter(c =>
    c.departmentsAllowed.includes(user?.department || '')
  );

  // Get submitted clearances for this student
  const submittedClearances = studentClearances.filter(
    sc => sc.studentId === user?.id
  );

  // Get clearance IDs that have been submitted
  const submittedClearanceIds = new Set(
    submittedClearances.map(sc => sc.clearanceId)
  );

  const handleLogout = () => {
    logout();
  };

  // Calculate progress stats
  let totalParts = 0;
  let approvedParts = 0;
  let rejectedParts = 0;

  submittedClearances.forEach(sc => {
    sc.parts.forEach(part => {
      totalParts++;
      if (part.status === 'approved') approvedParts++;
      if (part.status === 'rejected') rejectedParts++;
    });
  });

  const pendingParts = totalParts - approvedParts - rejectedParts;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome, {user?.name}</Text>
          <Text style={styles.department}>{user?.department}</Text>
        </View>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          size="small"
        />
      </View>

      {/* Progress Stats */}
      {submittedClearances.length > 0 && (
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={styles.statValue}>{submittedClearances.length}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{approvedParts}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statValue}>{pendingParts}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
        </View>
      )}

      {/* Submitted Clearances */}
      {submittedClearances.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Your Clearances</Text>

          <FlatList
            data={submittedClearances}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation?.navigate('StudentClearanceDetail', {
                    clearanceId: item.id,
                  })
                }
              >
                <Card>
                  <View style={styles.clearanceCard}>
                    <View style={styles.clearanceInfo}>
                      <Text style={styles.clearanceName}>{item.clearance.name}</Text>
                      <Text style={styles.submittedDate}>
                        Submitted: {new Date(item.submittedAt).toLocaleDateString()}
                      </Text>
                      <View style={styles.partsStatusContainer}>
                        {item.parts.map((part, idx) => (
                          <View key={idx} style={styles.partStatusItem}>
                            <StatusBadge status={part.status} size="small" />
                            <Text style={styles.partStatusText}>{part.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Available Clearances */}
      <View style={[styles.section, { marginBottom: Spacing.lg }]}>
        <Text style={styles.sectionTitle}>🆕 Available Clearances</Text>

        {availableClearances.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No clearances available for your department</Text>
          </Card>
        ) : (
          <FlatList
            data={availableClearances}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const isSubmitted = submittedClearanceIds.has(item.id);

              return (
                <Card>
                  <View style={styles.availableCard}>
                    <View style={styles.availableInfo}>
                      <Text style={styles.availableName}>{item.name}</Text>
                      <Text style={styles.availableDescription}>
                        {item.description}
                      </Text>
                      <Text style={styles.partCount}>
                        {item.parts.length} step{item.parts.length !== 1 ? 's' : ''}
                      </Text>
                      {item.parts.map((part, idx) => (
                        <Text key={idx} style={styles.partListItem}>
                          • {part.name} ({part.staffRole})
                        </Text>
                      ))}
                    </View>
                    {!isSubmitted && (
                      <Button
                        title="Submit"
                        onPress={() =>
                          navigation?.navigate('StudentSubmit', {
                            clearanceId: item.id,
                          })
                        }
                        variant="primary"
                        size="small"
                      />
                    )}
                    {isSubmitted && (
                      <View style={styles.submittedBadge}>
                        <Text style={styles.submittedBadgeText}>Submitted</Text>
                      </View>
                    )}
                  </View>
                </Card>
              );
            }}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  welcome: {
    ...Typography.h2,
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
  },
  department: {
    ...Typography.body,
    color: Colors.textInverse,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  clearanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearanceInfo: {
    flex: 1,
  },
  clearanceName: {
    ...Typography.h3,
    color: Colors.text,
  },
  submittedDate: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  partsStatusContainer: {
    marginTop: Spacing.md,
  },
  partStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  partStatusText: {
    ...Typography.caption,
    color: Colors.text,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  arrow: {
    ...Typography.h2,
    color: Colors.primary,
    marginLeft: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  availableCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  availableInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  availableName: {
    ...Typography.h3,
    color: Colors.text,
  },
  availableDescription: {
    ...Typography.body,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  partCount: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  partListItem: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  submittedBadge: {
    backgroundColor: Colors.approvedBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  submittedBadgeText: {
    ...Typography.caption,
    color: Colors.approved,
    fontWeight: '600',
  },
});

export default StudentDashboardScreen;
