/**
 * Admin Students Screen
 * View all students, their clearance status, and manage department assignments
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { Department, StudentClearance, User } from '@/types';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AdminStudentsScreenProps {
  navigation?: any;
}

const AdminStudentsScreen: React.FC<AdminStudentsScreenProps> = ({ navigation }) => {
  const { users, studentClearances, departments, updateStudentDepartment } = useApp();
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

  const students = useMemo(() => users.filter((user) => user.role === 'student'), [users]);
  const activeDepartments = departments.filter((department) => department.status === 'active');

  const getStudentClearances = (studentId: string) => {
    return studentClearances.filter((clearance) => clearance.studentId === studentId);
  };

  const getClearanceStatus = (items: StudentClearance[]) => {
    if (items.length === 0) return 'No clearances';
    if (items.every((clearance) => clearance.status === 'approved')) return 'Complete';
    if (items.some((clearance) => clearance.status === 'rejected')) return 'Needs Attention';
    return 'In Progress';
  };

  const getProgress = (items: StudentClearance[]) => {
    if (items.length === 0) return 0;
    const approved = items.filter((clearance) => clearance.status === 'approved').length;
    return Math.round((approved / items.length) * 100);
  };

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return 'Unassigned';
    return departments.find((department) => department.id === departmentId)?.name || 'Unknown Department';
  };

  const openDepartmentModal = (student: User) => {
    setSelectedStudent(student);
    setSelectedDepartment(student.department || '');
    setShowDepartmentModal(true);
  };

  const handleSaveDepartment = async () => {
    if (!selectedStudent?.id) {
      Alert.alert('Error', 'Student record not found');
      return;
    }

    if (!selectedDepartment) {
      Alert.alert('Error', 'Please select a department');
      return;
    }

    try {
      await updateStudentDepartment(selectedStudent.id, selectedDepartment);
      setShowDepartmentModal(false);
      setSelectedStudent(null);
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Student department updated successfully');
      } else {
        window.alert('Student department updated successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update department');
    }
  };

  const renderDepartmentOption = (department: Department) => {
    const isSelected = selectedDepartment === department.id;

    return (
      <TouchableOpacity
        key={department.id}
        style={[styles.departmentOption, isSelected && styles.departmentOptionSelected]}
        onPress={() => setSelectedDepartment(department.id)}
      >
        <Text
          style={[styles.departmentOptionText, isSelected && styles.departmentOptionTextSelected]}
        >
          {department.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Students</Text>
        </View>
        <Text style={styles.subtitle}>
          {students.length} student{students.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No students found</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const clearances = getStudentClearances(item.id);
            const status = getClearanceStatus(clearances);
            const progress = getProgress(clearances);

            return (
              <Card>
                <View style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentDept}>{getDepartmentName(item.department)}</Text>
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
                  </View>
                </View>

                <View style={styles.studentFooter}>
                  <StatusBadge
                    status={status === 'Complete' ? 'approved' : status === 'Needs Attention' ? 'rejected' : 'pending'}
                    size="small"
                  />
                  <Button
                    title="Change Department"
                    onPress={() => openDepartmentModal(item)}
                    variant="secondary"
                    size="small"
                  />
                </View>

                {clearances.length > 0 ? (
                  <View style={styles.clearancesPreview}>
                    {clearances.map((clearance) => (
                      <View key={clearance.id} style={styles.clearanceItem}>
                        <Text style={styles.clearanceName}>
                          {clearance.clearance?.name || 'Unknown Clearance'}
                        </Text>
                        <View style={styles.partsPreview}>
                          <StatusBadge status={clearance.status} size="small" />
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Card>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={showDepartmentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDepartmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Student Department</Text>
            <Text style={styles.modalSubtitle}>
              {selectedStudent?.name} ({selectedStudent?.email})
            </Text>

            <View style={styles.departmentList}>
              {activeDepartments.map(renderDepartmentOption)}
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowDepartmentModal(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Save"
                onPress={handleSaveDepartment}
                variant="primary"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    marginRight: Spacing.md,
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
  studentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    ...Typography.body,
    color: Colors.textLight,
    marginBottom: Spacing.lg,
  },
  departmentList: {
    marginBottom: Spacing.lg,
  },
  departmentOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  departmentOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  departmentOptionText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  departmentOptionTextSelected: {
    color: Colors.textInverse,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default AdminStudentsScreen;
