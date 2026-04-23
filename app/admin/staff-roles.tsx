/**
 * Admin Staff Roles Screen
 * Manage staff roles - create, edit, delete
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
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface AdminStaffRolesScreenProps {
  navigation?: any;
}

const AdminStaffRolesScreen: React.FC<AdminStaffRolesScreenProps> = ({ navigation }) => {
  const { staffRoles, createStaffRole, updateStaffRole, deleteStaffRole } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    const safeName = name || '';
    const safeDescription = description || '';

    if (!safeName.trim() || !safeDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (editRoleId) {
        await updateStaffRole(editRoleId, name, description);
        Alert.alert('Success', 'Staff role updated successfully');
      } else {
        await createStaffRole(name, description);
        Alert.alert('Success', 'Staff role created successfully');
      }

      setName('');
      setDescription('');
      setEditRoleId(null);
      setShowModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Operation failed');
    }
  };

  const handleEdit = (item: any) => {
    setEditRoleId(item.id);
    setName(item.name || '');
    setDescription(item.description || '');
    setShowModal(true);
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteStaffRole(id);
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Staff role deleted successfully');
      } else {
        window.alert('Staff role deleted successfully');
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
      if (window.confirm('Are you sure you want to delete this staff role?')) {
        handleDeleteConfirm(id);
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this staff role?',
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
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Staff Roles</Text>
        </View>
        <Button
          title="+ Add Role"
          onPress={() => {
            setEditRoleId(null);
            setName('');
            setDescription('');
            setShowModal(true);
          }}
          variant="primary"
          size="small"
        />
      </View>

      {staffRoles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No staff roles yet</Text>
          <Text style={styles.emptySubtext}>Tap "Add Role" to create your first staff role</Text>
        </View>
      ) : (
        <FlatList
          data={staffRoles}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.roleCard}>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>{item.name}</Text>
                  <Text style={styles.roleDescription}>{item.description}</Text>
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

      {/* Modal for creating new role */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editRoleId ? 'Edit Staff Role' : 'Create New Staff Role'}
            </Text>

            <TextInput
              label="Role Name"
              placeholder="e.g., IT Office"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              label="Description"
              placeholder="What does this role manage?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowModal(false);
                  setEditRoleId(null);
                  setName('');
                  setDescription('');
                }}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title={editRoleId ? "Save Changes" : "Create"}
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
    textAlign: 'center',
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
  roleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    ...Typography.h3,
    color: Colors.text,
  },
  roleDescription: {
    ...Typography.body,
    color: Colors.textLight,
    marginTop: Spacing.xs,
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
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default AdminStaffRolesScreen;

