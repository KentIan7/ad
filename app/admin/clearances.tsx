/**
 * Admin Clearances Screen
 * Manage clearances - create, edit, delete
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextInput } from '@/components/ui/text-input';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AdminClearancesScreenProps {
  navigation?: any;
}

const AdminClearancesScreen: React.FC<AdminClearancesScreenProps> = ({ navigation }) => {
  const { clearances, staffRoles, departments, createClearance, updateClearance, deleteClearance } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editClearanceId, setEditClearanceId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [departmentsAllowed, setDepartmentsAllowed] = useState<string[]>([]);
  const [errors, setErrors] = useState<{name?: string; description?: string; staffRole?: string; departments?: string}>({});

  const handleSave = async () => {
    const safeName = name || '';
    const safeDescription = description || '';

    const newErrors: {name?: string; description?: string; staffRole?: string; departments?: string} = {};
    if (!safeName.trim()) newErrors.name = 'Clearance name is required';
    if (!safeDescription.trim()) newErrors.description = 'Description is required';
    if (!staffRole) newErrors.staffRole = 'Please select an assigned staff role';
    if (departmentsAllowed.length === 0) newErrors.departments = 'Please select at least one department';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    try {
      if (editClearanceId) {
        await updateClearance(editClearanceId, name, description, staffRole, departmentsAllowed);
        if (Platform.OS !== 'web') {
          Alert.alert('Success', 'Clearance updated successfully');
        } else {
          window.alert('Clearance updated successfully');
        }
      } else {
        await createClearance(
          name,
          description,
          staffRole,
          departmentsAllowed
        );
        if (Platform.OS !== 'web') {
          Alert.alert('Success', 'Clearance created successfully');
        } else {
          window.alert('Clearance created successfully');
        }
      }

      setName('');
      setDescription('');
      setStaffRole('');
      setDepartmentsAllowed([]);
      setErrors({});
      setEditClearanceId(null);
      setShowModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Operation failed');
    }
  };

  const handleEdit = (item: any) => {
    setEditClearanceId(item.id);
    setName(item.name || '');
    setDescription(item.description || '');
    setStaffRole(item.staffRole || '');
    setDepartmentsAllowed(item.departmentsAllowed || []);
    setShowModal(true);
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteClearance(id);
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Clearance deleted successfully');
      } else {
        window.alert('Clearance deleted successfully');
      }
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Alert.alert('Error', error.message || 'Failed to delete');
      } else {
        window.alert('Error: ' + (error.message || 'Failed to delete'));
      }
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this clearance?')) {
        handleDeleteConfirm(id);
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this clearance?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDeleteConfirm(id),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Clearances</Text>
        </View>
        <Button
          title="+ Add Clearance"
          onPress={() => {
            setEditClearanceId(null);
            setName('');
            setDescription('');
            setStaffRole('');
            setDepartmentsAllowed([]);
            setErrors({});
            setShowModal(true);
          }}
          variant="primary"
          size="small"
        />
      </View>

      {clearances.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No clearances yet</Text>
          <Text style={styles.emptySubtext}>Tap Add Clearance to create your first clearance</Text>
        </View>
      ) : (
        <FlatList
          data={clearances}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.clearanceCard}>
                <View style={styles.clearanceInfo}>
                  <Text style={styles.clearanceName}>{item.name}</Text>
                  <Text style={styles.clearanceDescription}>{item.description}</Text>
                  <View style={styles.partsList}>
                    <Text style={styles.partItem}>
                      Assigned to: {staffRoles.find(r => r.id === item.staffRole)?.name || item.staffRole}
                    </Text>
                  </View>
                  <View style={styles.departmentsList}>
                    <Text style={styles.clearanceMeta}>
                      {item.departmentsAllowed.length} department{item.departmentsAllowed.length !== 1 ? 's' : ''}
                    </Text>
                    {item.departmentsAllowed.length > 0 && (
                      <Text style={styles.partItem}>
                        {item.departmentsAllowed
                          .map(deptId => departments.find(d => d.id === deptId)?.name || deptId)
                          .join(', ')}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Text style={styles.editButton}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteButton}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal for creating new clearance */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editClearanceId ? 'Edit Clearance' : 'Create New Clearance'}
              </Text>

              <TextInput
                label="Clearance Name"
                placeholder="e.g., IT Clearance"
                value={name}
                onChangeText={(val) => { setName(val); setErrors(prev => ({ ...prev, name: undefined })); }}
                error={errors.name}
              />

              <TextInput
                label="Description"
                placeholder="What is this clearance for?"
                value={description}
                onChangeText={(val) => { setDescription(val); setErrors(prev => ({ ...prev, description: undefined })); }}
                multiline
                numberOfLines={2}
                error={errors.description}
              />

              <View style={styles.partContainer}>
                <Text style={styles.label}>Assigned Staff Role</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.roleSelector}
                >
                  {staffRoles.map(role => (
                    <TouchableOpacity
                      key={role.id}
                      style={[
                        styles.roleOption,
                        staffRole === role.id && styles.roleOptionSelected,
                        !!errors.staffRole && styles.roleOptionError,
                      ]}
                      onPress={() => { setStaffRole(role.id); setErrors(prev => ({ ...prev, staffRole: undefined })); }}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          staffRole === role.id && styles.roleOptionTextSelected,
                        ]}
                      >
                        {role.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  </ScrollView>
                {errors.staffRole ? <Text style={styles.fieldErrorText}>{errors.staffRole}</Text> : null}
              </View>

              {/* Departments Selection */}
              <View style={styles.partContainer}>
                <Text style={styles.label}>Assign to Departments</Text>
                <Text style={styles.helperText}>Select which departments require this clearance</Text>
                <View style={styles.departmentsGrid}>
                  {departments.filter(d => d.status === 'active').map(dept => (
                    <TouchableOpacity
                      key={dept.id}
                      style={[
                        styles.departmentOption,
                        departmentsAllowed.includes(dept.id) && styles.departmentOptionSelected,
                      ]}
                      onPress={() => {
                        setDepartmentsAllowed(prev =>
                          prev.includes(dept.id)
                            ? prev.filter(id => id !== dept.id)
                            : [...prev, dept.id]
                        );
                        setErrors(prev => ({ ...prev, departments: undefined }));
                      }}
                    >
                      <Text style={[
                        styles.departmentOptionText,
                        departmentsAllowed.includes(dept.id) && styles.departmentOptionTextSelected,
                      ]}>
                        {departmentsAllowed.includes(dept.id) ? '✓ ' : ''}{dept.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.departments ? <Text style={styles.fieldErrorText}>{errors.departments}</Text> : null}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowModal(false);
                  setEditClearanceId(null);
                  setName('');
                  setDescription('');
                  setStaffRole('');
                  setDepartmentsAllowed([]);
                  setErrors({});
                }}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title={editClearanceId ? "Save Changes" : "Create"}
                onPress={handleSave}
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
  clearanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearanceInfo: {
    flex: 1,
  },
  clearanceName: {
    ...Typography.h3,
    color: Colors.text,
  },
  clearanceDescription: {
    ...Typography.body,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  clearanceMeta: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  partsList: {
    marginTop: Spacing.sm,
  },
  departmentsList: {
    marginTop: Spacing.sm,
  },
  partItem: {
    ...Typography.caption,
    color: Colors.textLight,
    marginVertical: Spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    fontSize: 20,
    paddingLeft: Spacing.md,
  },
  deleteButton: {
    fontSize: 20,
    paddingLeft: Spacing.md,
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
    maxHeight: '85%',
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  partsTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  partContainer: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  roleSelector: {
    marginVertical: Spacing.sm,
  },
  roleOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleOptionText: {
    ...Typography.caption,
    color: Colors.text,
  },
  roleOptionTextSelected: {
    color: Colors.textInverse,
  },
  removePartButton: {
    marginTop: Spacing.md,
  },
  addPartButton: {
    marginVertical: Spacing.md,
  },
  roleOptionError: {
    borderColor: Colors.rejected,
  },
  fieldErrorText: {
    ...Typography.caption,
    color: Colors.rejected,
    marginTop: Spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  departmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  departmentOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  departmentOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  departmentOptionText: {
    ...Typography.caption,
    color: Colors.text,
  },
  departmentOptionTextSelected: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
});

export default AdminClearancesScreen;

