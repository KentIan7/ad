/**
 * Student Clearances Screen
 * Shows assigned clearances and allows students to view details.
 */

import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { StudentClearance } from '@/types';
import React, { useMemo } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface StudentClearancesScreenProps {
  navigation?: any;
}

const StudentClearancesScreen: React.FC<StudentClearancesScreenProps> = ({ navigation }) => {
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
      })
      .map((studentClearance) => ({
        ...studentClearance,
        clearance:
          clearances.find((clearance) => clearance.id === studentClearance.clearanceId) ||
          studentClearance.clearance,
      }));
  }, [clearances, studentClearances, user?.department, user?.id]);

  const renderAssignedClearance = ({ item }: { item: StudentClearance }) => (
    <TouchableOpacity
      onPress={() => navigation?.navigate('StudentClearanceDetail', { clearanceId: item.id })}
    >
      <Card>
        <View style={[styles.clearanceCard, width < 600 && styles.clearanceCardMobile]}>
          <View style={styles.clearanceInfo}>
            <Text style={[styles.clearanceName, width < 600 && styles.clearanceNameMobile]}>{item.clearance.name}</Text>
            <Text style={styles.submittedDate}>
              Assigned: {new Date(item.submittedAt).toLocaleDateString()}
            </Text>
            <View style={styles.partsStatusContainer}>
              <View style={styles.partStatusItem}>
                <StatusBadge status={item.status} size="small" />
                <Text style={styles.partStatusText}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.arrow, width < 600 && styles.arrowMobile]}>{'>'}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Clearance</Text>
        <Text style={styles.sectionSubtitle}>
          Clearances shown here are assigned to your department and routed to the designated staff for review.
        </Text>

        {assignedClearances.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No clearances are assigned to your department yet.</Text>
          </Card>
        ) : (
          <FlatList
            data={assignedClearances}
            keyExtractor={(item) => item.id}
            renderItem={renderAssignedClearance}
            scrollEnabled={false}
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
  clearanceCardMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  clearanceNameMobile: {
    fontSize: 16,
  },
  arrowMobile: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
});

export default StudentClearancesScreen;
