/**
 * Staff Clearances Screen
 * Shows assigned student clearances and allows staff to review, approve, or reject.
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextInput } from '@/components/ui/text-input';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface StaffClearancesScreenProps {
  navigation?: any;
}

const StaffClearancesScreen: React.FC<StaffClearancesScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { clearances, studentClearances, users, departments } = useApp();
  const { width } = useWindowDimensions();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const departmentOptions = useMemo(() => {
    return departments.filter((department) => department.status === 'active');
  }, [departments]);

  const assignedClearances = useMemo(() => {
    if (!user?.staffRole) {
      return [];
    }

    return studentClearances
      .filter((studentClearance) => {
        const student = users.find((currentUser) => currentUser.id === studentClearance.studentId);
        const currentClearance =
          clearances.find((clearance) => clearance.id === studentClearance.clearanceId) ||
          studentClearance.clearance;
        const assignedRole = currentClearance?.staffRole;
        const assignedToStudentDepartment = currentClearance?.departmentsAllowed.includes(student?.department || '');

        return student?.role === 'student' && assignedToStudentDepartment && assignedRole === user.staffRole;
      })
      .map((studentClearance) => {
        const student = users.find((currentUser) => currentUser.id === studentClearance.studentId);
        const currentClearance =
          clearances.find((clearance) => clearance.id === studentClearance.clearanceId) ||
          studentClearance.clearance;
        return {
          ...studentClearance,
          clearance: currentClearance,
          student,
        };
      });
  }, [clearances, studentClearances, user?.staffRole, users]);

  const filteredClearances = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return assignedClearances.filter((clearance) => {
      const matchesDepartment =
        selectedDepartment === 'all' || clearance.student?.department === selectedDepartment;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        (clearance.student?.name || '').toLowerCase().includes(normalizedSearch);

      return matchesDepartment && matchesSearch;
    });
  }, [assignedClearances, searchQuery, selectedDepartment]);

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return 'Unassigned';
    return departments.find((department) => department.id === departmentId)?.name || 'Unknown Department';
  };

  const renderAssignedClearance = ({ item }: { item: typeof filteredClearances[number] }) => (
    <Card>
      <View style={[styles.assignedCard, width < 600 && styles.assignedCardMobile]}>
        <View style={styles.assignedInfo}>
          <Text style={[styles.studentName, width < 600 && styles.studentNameMobile]}>{item.student?.name || 'Unknown Student'}</Text>
          <Text style={styles.departmentText}>{getDepartmentName(item.student?.department)}</Text>
          <Text style={styles.clearanceName}>{item.clearance.name}</Text>
          <Text style={styles.metaText}>{item.student?.email || 'No email available'}</Text>
          <View style={styles.statusRow}>
            <StatusBadge status={item.status} size="small" />
          </View>
        </View>

        {item.status === 'pending' ? (
          <View style={[styles.actionColumn, width < 600 && styles.actionColumnMobile]}>
            <Button
              title="Approve"
              onPress={() => navigation?.navigate('StaffApprove', { studentClearanceId: item.id })}
              variant="success"
              size="small"
            />
            <Button
              title="Reject"
              onPress={() => navigation?.navigate('StaffReject', { studentClearanceId: item.id })}
              variant="danger"
              size="small"
            />
          </View>
        ) : (
          <View style={[styles.reviewedBadge, width < 600 && styles.reviewedBadgeMobile]}>
            <Text style={styles.reviewedBadgeText}>Reviewed</Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Clearances</Text>
        <Text style={styles.sectionSubtitle}>
          Review clearances routed to your staff role. Filter by department or search by student name.
        </Text>

        <TextInput
          label="Search Student"
          placeholder="Enter student name"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedDepartment === 'all' && styles.filterChipSelected]}
            onPress={() => setSelectedDepartment('all')}
          >
            <Text style={[styles.filterChipText, selectedDepartment === 'all' && styles.filterChipTextSelected]}>
              All Departments
            </Text>
          </TouchableOpacity>
          {departmentOptions.map((department) => {
            const isSelected = selectedDepartment === department.id;
            return (
              <TouchableOpacity
                key={department.id}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setSelectedDepartment(department.id)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                  {department.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredClearances.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No student clearances match the current filters.</Text>
          </Card>
        ) : (
          <FlatList
            data={filteredClearances}
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
  filterScroll: {
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    marginRight: Spacing.sm,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: Colors.textInverse,
  },
  assignedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  assignedInfo: {
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
  clearanceName: {
    ...Typography.body,
    color: Colors.text,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  statusRow: {
    marginTop: Spacing.md,
  },
  actionColumn: {
    gap: Spacing.sm,
  },
  reviewedBadge: {
    backgroundColor: Colors.approvedBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  reviewedBadgeText: {
    ...Typography.caption,
    color: Colors.approved,
    fontWeight: '600',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  assignedCardMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  studentNameMobile: {
    fontSize: 16,
  },
  actionColumnMobile: {
    width: '100%',
    marginTop: Spacing.md,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  reviewedBadgeMobile: {
    marginTop: Spacing.md,
    width: '100%',
  },
});

export default StaffClearancesScreen;
