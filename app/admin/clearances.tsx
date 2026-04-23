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
  const { clearances, staffRoles, createClearance, updateClearance, deleteClearance } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editClearanceId, setEditClearanceId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parts, setParts] = useState<any[]>([
    { name: '', staffRole: '' },
  ]);

  const handleAddPart = () => {
    setParts([...parts, { name: '', staffRole: '' }]);
  };

  const handleRemovePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleUpdatePart = (index: number, field: string, value: string) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setParts(newParts);
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in clearance name and description');
      return;
    }

    if (parts.some(p => !p.name.trim() || !p.staffRole)) {
      Alert.alert('Error', 'Please complete all clearance parts');
      return;
    }

    const departmentsAllowed = ['Computer Science', 'Engineering', 'Business Administration'];
    
    try {
      if (editClearanceId) {
        const updatedParts = parts.map(p => ({
          ...p,
          status: p.status || 'pending'
        }));
        await updateClearance(editClearanceId, name, description, updatedParts, departmentsAllowed);
        Alert.alert('Success', 'Clearance updated successfully');
      } else {
        await createClearance(
          name,
          description,
          parts.map(p => ({ name: p.name, staffRole: p.staffRole })),
          departmentsAllowed
        );
        Alert.alert('Success', 'Clearance created successfully');
      }

      setName('');
      setDescription('');
      setParts([{ name: '', staffRole: '' }]);
      setEditClearanceId(null);
      setShowModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Operation failed');
    }
  };

  const handleEdit = (item: any) => {
    setEditClearanceId(item.id);
    setName(item.name);
    setDescription(item.description);
    setParts(item.parts);
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
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Clearances</Text>
        </View>
        <Button
          title="+ Add Clearance"
          onPress={() => {
            setEditClearanceId(null);
            setName('');
            setDescription('');
            setParts([{ name: '', staffRole: '' }]);
            setShowModal(true);
          }}
          variant="primary"
          size="small"
        />
      </View>

      {clearances.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No clearances yet</Text>
          <Text style={styles.emptySubtext}>Tap "Add Clearance" to create your first clearance</Text>
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
                  <Text style={styles.clearanceMeta}>
                    {item.parts.length} part{item.parts.length !== 1 ? 's' : ''} • {' '}
                    {item.departmentsAllowed.length} department{item.departmentsAllowed.length !== 1 ? 's' : ''}
                  </Text>
                  <View style={styles.partsList}>
                    {item.parts.map((part, idx) => (
                      <Text key={idx} style={styles.partItem}>
                        • {part.name} ({part.staffRole})
                      </Text>
                    ))}
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
                onChangeText={setName}
              />

              <TextInput
                label="Description"
                placeholder="What is this clearance for?"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
              />

              <Text style={styles.partsTitle}>Clearance Parts</Text>
              {parts.map((part, index) => (
                <View key={index} style={styles.partContainer}>
                  <TextInput
                    label={`Part ${index + 1} Name`}
                    placeholder="e.g., IT Equipment Check"
                    value={part.name}
                    onChangeText={value => handleUpdatePart(index, 'name', value)}
                  />

                  {/* Staff Role Selector */}
                  <View>
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
                            part.staffRole === role.id && styles.roleOptionSelected,
                          ]}
                          onPress={() => handleUpdatePart(index, 'staffRole', role.id)}
                        >
                          <Text
                            style={[
                              styles.roleOptionText,
                              part.staffRole === role.id && styles.roleOptionTextSelected,
                            ]}
                          >
                            {role.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {parts.length > 1 && (
                    <Button
                      title="Remove Part"
                      onPress={() => handleRemovePart(index)}
                      variant="danger"
                      size="small"
                      style={styles.removePartButton}
                    />
                  )}
                </View>
              ))}

              <Button
                title="+ Add Another Part"
                onPress={handleAddPart}
                variant="secondary"
                style={styles.addPartButton}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowModal(false);
                  setEditClearanceId(null);
                  setName('');
                  setDescription('');
                  setParts([{ name: '', staffRole: '' }]);
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
  modalActions: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default AdminClearancesScreen;

