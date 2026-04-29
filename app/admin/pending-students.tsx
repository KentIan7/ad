/**
 * Admin Pending Students Screen
 * View and approve/reject pending student registrations
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { StudentRegistration } from '@/types';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface AdminPendingStudentsScreenProps {
  navigation?: any;
}

const AdminPendingStudentsScreen: React.FC<AdminPendingStudentsScreenProps> = ({ navigation }) => {
  const { pendingStudents, approvePendingStudent, rejectPendingStudent, departments } = useApp();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRegistration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const activePending = pendingStudents.filter((student) => student.status === 'pending');
  const processedStudents = pendingStudents.filter((student) => student.status !== 'pending');
  const displayedStudents = showArchived ? processedStudents : activePending;

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return 'No department selected';
    return departments.find((department) => department.id === departmentId)?.name || 'Unknown Department';
  };

  const handleApprove = async (student: StudentRegistration) => {
    try {
      await approvePendingStudent(student.id);
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Student approved successfully');
      } else {
        window.alert('Student approved successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve');
    }
  };

  const handleRejectClick = (student: StudentRegistration) => {
    setSelectedStudent(student);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedStudent?.id) {
      Alert.alert('Error', 'Student record not found');
      return;
    }

    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    try {
      await rejectPendingStudent(selectedStudent.id, rejectionReason);
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Student rejected successfully');
      } else {
        window.alert('Student rejected successfully');
      }
      setShowRejectModal(false);
      setSelectedStudent(null);
      setRejectionReason('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reject');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.primary;
      case 'approved':
        return Colors.approved;
      case 'rejected':
        return Colors.rejected;
      default:
        return Colors.textLight;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Pending Students</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, !showArchived && styles.activeTab]}
          onPress={() => setShowArchived(false)}
        >
          <Text style={[styles.tabText, !showArchived && styles.activeTabText]}>
            Pending ({activePending.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, showArchived && styles.activeTab]}
          onPress={() => setShowArchived(true)}
        >
          <Text style={[styles.tabText, showArchived && styles.activeTabText]}>
            Processed ({processedStudents.length})
          </Text>
        </TouchableOpacity>
      </View>

      {displayedStudents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {showArchived ? 'No processed registrations' : 'No pending registrations'}
          </Text>
          <Text style={styles.emptySubtext}>
            {showArchived
              ? 'Approved and rejected registrations will appear here'
              : 'All pending students have been reviewed'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedStudents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.studentCard}>
                <View style={styles.studentInfo}>
                  <View style={styles.studentHeader}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                      <Text style={styles.statusText}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.studentEmail}>{item.email}</Text>
                  {item.phone ? <Text style={styles.studentPhone}>Phone: {item.phone}</Text> : null}
                  <Text style={styles.studentDepartment}>
                    Department: {getDepartmentName(item.department)}
                  </Text>
                  <Text style={styles.studentDate}>
                    Registered: {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                  {item.rejectionReason ? (
                    <View style={styles.rejectionReasonBox}>
                      <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                      <Text style={styles.rejectionText}>{item.rejectionReason}</Text>
                    </View>
                  ) : null}
                </View>
                {item.status === 'pending' ? (
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={() => handleApprove(item)} style={styles.approveButton}>
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRejectClick(item)} style={styles.rejectButton}>
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={showRejectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Student Registration</Text>
            <Text style={styles.modalSubtitle}>
              {selectedStudent?.name} ({selectedStudent?.email})
            </Text>

            <Text style={styles.fieldLabel}>Rejection Reason</Text>
            <RNTextInput
              style={styles.reasonInput}
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.textLight}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowRejectModal(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Reject"
                onPress={handleRejectConfirm}
                variant="danger"
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
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.surface,
    fontWeight: '600',
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    flex: 1,
    textAlign: 'left',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...Typography.body,
    color: Colors.textLight,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textLight,
  },
  listContent: {
    paddingVertical: Spacing.md,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentInfo: {
    flex: 1,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  studentName: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.surface,
    fontSize: 11,
    fontWeight: '600',
  },
  studentEmail: {
    ...Typography.body,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  studentPhone: {
    ...Typography.caption,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  studentDepartment: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  studentDate: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
  rejectionReasonBox: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderLeftWidth: 3,
    borderLeftColor: Colors.rejected,
    borderRadius: 4,
  },
  rejectionLabel: {
    ...Typography.caption,
    color: Colors.rejected,
    fontWeight: '600',
  },
  rejectionText: {
    ...Typography.caption,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  approveButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.approved,
    borderRadius: 6,
  },
  approveButtonText: {
    ...Typography.caption,
    color: Colors.surface,
    fontWeight: '600',
  },
  rejectButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.rejected,
    borderRadius: 6,
  },
  rejectButtonText: {
    ...Typography.caption,
    color: Colors.surface,
    fontWeight: '600',
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
  fieldLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default AdminPendingStudentsScreen;
