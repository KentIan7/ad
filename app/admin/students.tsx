/**
 * Admin Students Screen
 * View all students and their clearance status
 */

import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AdminStudentsScreenProps {
  navigation?: any;
}

const AdminStudentsScreen: React.FC<AdminStudentsScreenProps> = ({ navigation }) => {
  const { users, studentClearances } = useApp();

  // Get all students
  const students = users.filter(u => u.role === 'student');

  // Get clearance status for each student
  const getStudentClearances = (studentId: string) => {
    return studentClearances.filter(sc => sc.studentId === studentId);
  };

  const getClearanceStatus = (studentClearances: any[]) => {
    if (studentClearances.length === 0) return 'No clearances';

    const allCompleted = studentClearances.every(sc =>
      sc.parts.every((p: any) => p.status !== 'pending')
    );

    if (allCompleted) return 'Complete';
    return 'In Progress';
  };

  const getProgress = (studentClearances: any[]) => {
    if (studentClearances.length === 0) return 0;

    let total = 0;
    let approved = 0;

    studentClearances.forEach(sc => {
      sc.parts.forEach((p: any) => {
        total++;
        if (p.status === 'approved') approved++;
      });
    });

    return total === 0 ? 0 : Math.round((approved / total) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Students</Text>
        </View>
        <Text style={styles.subtitle}>{students.length} student{students.length !== 1 ? 's' : ''}</Text>
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No students found</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const clearances = getStudentClearances(item.id);
            const status = getClearanceStatus(clearances);
            const progress = getProgress(clearances);

            return (
              <Card>
                <View style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentDept}>{item.department}</Text>
                    <Text style={styles.studentEmail}>{item.email}</Text>
                  </View>

                  <View style={styles.studentStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Clearances</Text>
                      <Text style={styles.statValue}>{clearances.length}</Text>
                    </View>

                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Progress</Text>
                      <Text style={styles.statValue}>{progress}%</Text>
                    </View>

                    <View style={styles.statusContainer}>
                      <StatusBadge
                        status={status === 'Complete' ? 'approved' : 'pending'}
                        size="small"
                      />
                    </View>
                  </View>
                </View>

                {clearances.length > 0 && (
                  <View style={styles.clearancesPreview}>
                    {clearances.map((sc, idx) => (
                      <View key={idx} style={styles.clearanceItem}>
                        <Text style={styles.clearanceName}>{sc.clearance?.name || 'Unknown Clearance'}</Text>
                        <View style={styles.partsPreview}>
                          {sc.parts.slice(0, 2).map((p, pidx) => (
                            <StatusBadge key={pidx} status={p.status} size="small" />
                          ))}
                          {sc.parts.length > 2 && (
                            <Text style={styles.moreText}>+{sc.parts.length - 2}</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  subtitle: {
    ...Typography.body,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.textLight,
  },
  listContent: {
    paddingVertical: Spacing.md,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...Typography.h3,
    color: Colors.text,
  },
  studentDept: {
    ...Typography.body,
    color: Colors.primary,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  studentEmail: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  studentStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  statusContainer: {
    marginLeft: Spacing.sm,
  },
  clearancesPreview: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clearanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  clearanceName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  partsPreview: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  moreText: {
    ...Typography.caption,
    color: Colors.textLight,
    marginLeft: Spacing.xs,
  },
});

export default AdminStudentsScreen;

