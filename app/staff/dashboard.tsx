/**
 * Staff Dashboard Screen
 * Shows staff members their assigned clearance parts and students waiting for approval
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface StaffDashboardScreenProps {
  navigation?: any;
}

const StaffDashboardScreen: React.FC<StaffDashboardScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { studentClearances, users } = useApp();

  // Get all pending parts for this staff member
  const getPendingParts = () => {
    const pending: any[] = [];

    studentClearances.forEach(sc => {
      sc.parts.forEach((part, partIndex) => {
        if (
          part.status === 'pending' &&
          part.staffRole === user?.staffRole
        ) {
          const student = users.find(u => u.id === sc.studentId);
          pending.push({
            studentClearanceId: sc.id,
            partIndex,
            part,
            clearanceName: sc.clearance.name,
            student,
          });
        }
      });
    });

    return pending;
  };

  // Get all cleared parts (approved + rejected) for stats
  const getClearedParts = () => {
    let cleared = 0;
    studentClearances.forEach(sc => {
      sc.parts.forEach(part => {
        if (
          part.staffRole === user?.staffRole &&
          part.status !== 'pending'
        ) {
          cleared++;
        }
      });
    });
    return cleared;
  };

  const pendingParts = getPendingParts();
  const clearedParts = getClearedParts();
  const totalParts = pendingParts.length + clearedParts;

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome, {user?.name}</Text>
          <Text style={styles.role}>{user?.staffRole}</Text>
        </View>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          size="small"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>⏳</Text>
          <Text style={styles.statValue}>{pendingParts.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statValue}>{clearedParts}</Text>
          <Text style={styles.statLabel}>Processed</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>📋</Text>
          <Text style={styles.statValue}>{totalParts}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </Card>
      </View>

      {/* Pending Approvals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Pending Approvals</Text>

        {pendingParts.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No pending approvals</Text>
            <Text style={styles.emptySubtext}>All clearance parts have been processed</Text>
          </Card>
        ) : (
          <FlatList
            data={pendingParts}
            keyExtractor={(item, idx) => idx.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Card>
                <View style={styles.partCard}>
                  <View style={styles.partInfo}>
                    <Text style={styles.studentName}>{item.student?.name}</Text>
                    <Text style={styles.departmentText}>{item.student?.department}</Text>
                    <Text style={styles.clearanceNameText}>{item.clearanceName}</Text>
                    <Text style={styles.partNameText}>
                      Part: {item.part.name}
                    </Text>
                  </View>

                  <View style={styles.partActions}>
                    <Button
                      title="✅"
                      onPress={() =>
                        navigation?.navigate('StaffApprove', {
                          studentClearanceId: item.studentClearanceId,
                          partIndex: item.partIndex,
                          partName: item.part.name,
                        })
                      }
                      variant="success"
                      size="small"
                    />
                    <Button
                      title="❌"
                      onPress={() =>
                        navigation?.navigate('StaffReject', {
                          studentClearanceId: item.studentClearanceId,
                          partIndex: item.partIndex,
                          partName: item.part.name,
                        })
                      }
                      variant="danger"
                      size="small"
                    />
                  </View>
                </View>
              </Card>
            )}
          />
        )}
      </View>

      {/* Recent Actions */}
      <View style={[styles.section, { marginBottom: Spacing.lg }]}>
        <Text style={styles.sectionTitle}>📝 Recently Processed</Text>
        {clearedParts === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No processed items yet</Text>
          </Card>
        ) : (
          <Card>
            <Text style={styles.infoText}>
              You have processed {clearedParts} clearance part{clearedParts !== 1 ? 's' : ''}
            </Text>
          </Card>
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
  role: {
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
  emptyText: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: Spacing.md,
    fontWeight: '600',
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  partCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  studentName: {
    ...Typography.h3,
    color: Colors.text,
  },
  departmentText: {
    ...Typography.caption,
    color: Colors.primary,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  clearanceNameText: {
    ...Typography.body,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  partNameText: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  partActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});

export default StaffDashboardScreen;

