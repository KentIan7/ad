/**
 * Staff Dashboard Screen
 * Shows assigned clearances, department filters, analytics, and account settings
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextInput } from '@/components/ui/text-input';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface StaffDashboardScreenProps {
  navigation?: any;
}

type StaffTab = 'assigned' | 'analytics' | 'settings';

const StaffDashboardScreen: React.FC<StaffDashboardScreenProps> = ({ navigation }) => {
  const { user, logout, updateAccountSettings, isLoading } = useAuth();
  const { clearances, studentClearances, users, departments, staffRoles } = useApp();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<StaffTab>('assigned');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsName, setSettingsName] = useState(user?.name || '');
  const [settingsEmail, setSettingsEmail] = useState(user?.email || '');
  const [settingsPhone, setSettingsPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsErrors, setSettingsErrors] = useState<{
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    setSettingsName(user?.name || '');
    setSettingsEmail(user?.email || '');
    setSettingsPhone(user?.phone || '');
  }, [user?.name, user?.email, user?.phone]);

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

  const totals = useMemo(() => {
    const total = filteredClearances.length;
    const pending = filteredClearances.filter((clearance) => clearance.status === 'pending').length;
    const approved = filteredClearances.filter((clearance) => clearance.status === 'approved').length;
    const rejected = filteredClearances.filter((clearance) => clearance.status === 'rejected').length;
    const processed = approved + rejected;
    const approvalRate = total === 0 ? 0 : Math.round((approved / total) * 100);
    const processingRate = total === 0 ? 0 : Math.round((processed / total) * 100);
    return { total, pending, approved, rejected, processed, approvalRate, processingRate };
  }, [filteredClearances]);

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return 'Unassigned';
    return departments.find((department) => department.id === departmentId)?.name || 'Unknown Department';
  };

  const staffRoleName = useMemo(() => {
    if (!user?.staffRole) return 'Staff Member';
    return staffRoles.find((role) => role.id === user.staffRole)?.name || 'Staff Member';
  }, [staffRoles, user?.staffRole]);

  const handleSaveSettings = async () => {
    const nextErrors: typeof settingsErrors = {};

    if (!settingsName.trim()) nextErrors.name = 'Name is required';
    if (!settingsEmail.trim()) nextErrors.email = 'Email is required';
    else if (!settingsEmail.includes('@')) nextErrors.email = 'Please enter a valid email';
    if (newPassword && newPassword.length < 6) nextErrors.newPassword = 'New password must be at least 6 characters';
    if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';

    const emailChanged = settingsEmail.trim().toLowerCase() !== (user?.email || '').toLowerCase();
    const passwordChanged = newPassword.trim().length > 0;
    if ((emailChanged || passwordChanged) && !currentPassword.trim()) {
      nextErrors.currentPassword = 'Current password is required for email or password changes';
    }

    setSettingsErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await updateAccountSettings({
        name: settingsName,
        email: settingsEmail,
        phone: settingsPhone,
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Your account settings were updated.');
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'Unable to update account settings');
    }
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

  const renderProgressBar = (label: string, value: number, color: string) => (
    <View style={styles.progressRow} key={label}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerTop, width < 600 && styles.headerTopMobile]}>
          <View style={styles.headerTextBlock}>
            <Text style={[styles.welcome, width < 600 && styles.welcomeMobile]}>Welcome, {user?.name}</Text>
            <Text style={[styles.role, width < 600 && styles.roleMobile]}>{staffRoleName}</Text>
          </View>
          <Button title="Logout" onPress={logout} variant="danger" size="small" />
        </View>
        <View style={[styles.headerStats, width < 600 && styles.headerStatsMobile]}>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatValue, width < 600 && styles.headerStatValueMobile]}>{totals.total}</Text>
            <Text style={[styles.headerStatLabel, width < 600 && styles.headerStatLabelMobile]}>Assigned</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatValue, width < 600 && styles.headerStatValueMobile]}>{totals.pending}</Text>
            <Text style={[styles.headerStatLabel, width < 600 && styles.headerStatLabelMobile]}>Pending</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatValue, width < 600 && styles.headerStatValueMobile]}>{totals.processed}</Text>
            <Text style={[styles.headerStatLabel, width < 600 && styles.headerStatLabelMobile]}>Processed</Text>
          </View>
        </View>
      </View>

      <View style={[styles.tabContainer, width < 600 && styles.tabContainerMobile]}>
        <TouchableOpacity style={[styles.tab, activeTab === 'assigned' && styles.activeTab]} onPress={() => setActiveTab('assigned')}>
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>Assigned</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'analytics' && styles.activeTab]} onPress={() => setActiveTab('analytics')}>
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'settings' && styles.activeTab]} onPress={() => setActiveTab('settings')}>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'assigned' ? (
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
      ) : null}

      {activeTab === 'analytics' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Processing Analytics</Text>
          <Text style={styles.sectionSubtitle}>
            Analytics reflect the currently selected department filter from your assigned queue.
          </Text>

          <View style={[styles.analyticsGrid, width < 600 && styles.analyticsGridMobile]}>
            <Card style={[styles.analyticsCard, width < 600 && styles.analyticsCardMobile]}>
              <Text style={[styles.analyticsValue, width < 600 && styles.analyticsValueMobile]}>{totals.approvalRate}%</Text>
              <Text style={styles.analyticsLabel}>Approval Rate</Text>
            </Card>
            <Card style={[styles.analyticsCard, width < 600 && styles.analyticsCardMobile]}>
              <Text style={[styles.analyticsValue, width < 600 && styles.analyticsValueMobile]}>{totals.processingRate}%</Text>
              <Text style={styles.analyticsLabel}>Processing Rate</Text>
            </Card>
          </View>

          <Card>
            <Text style={styles.chartTitle}>Status Breakdown</Text>
            {renderProgressBar('Processed', totals.processingRate, Colors.primary)}
            {renderProgressBar('Approved', totals.approvalRate, Colors.approved)}
            {renderProgressBar(
              'Rejected',
              totals.total === 0 ? 0 : Math.round((totals.rejected / totals.total) * 100),
              Colors.rejected
            )}
          </Card>

          <Card>
            <Text style={styles.chartTitle}>Current Totals</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Assigned</Text>
              <Text style={styles.metricValue}>{totals.total}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Pending</Text>
              <Text style={styles.metricValue}>{totals.pending}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Approved</Text>
              <Text style={styles.metricValue}>{totals.approved}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Rejected</Text>
              <Text style={styles.metricValue}>{totals.rejected}</Text>
            </View>
          </Card>
        </View>
      ) : null}

      {activeTab === 'settings' ? (
        <View style={[styles.section, styles.settingsSection]}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <Text style={styles.sectionSubtitle}>
            Update your profile details. Current password is required for email or password changes.
          </Text>

          <Card>
            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              value={settingsName}
              onChangeText={(value) => {
                setSettingsName(value);
                setSettingsErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={settingsErrors.name}
            />
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={settingsEmail}
              onChangeText={(value) => {
                setSettingsEmail(value);
                setSettingsErrors((prev) => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
              error={settingsErrors.email}
            />
            <TextInput
              label="Phone Number"
              placeholder="Enter your phone number"
              value={settingsPhone}
              onChangeText={setSettingsPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              label="Current Password"
              placeholder="Required for email or password changes"
              value={currentPassword}
              onChangeText={(value) => {
                setCurrentPassword(value);
                setSettingsErrors((prev) => ({ ...prev, currentPassword: undefined }));
              }}
              secureTextEntry
              error={settingsErrors.currentPassword}
            />
            <TextInput
              label="New Password"
              placeholder="Leave blank to keep your current password"
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                setSettingsErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              secureTextEntry
              error={settingsErrors.newPassword}
            />
            <TextInput
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setSettingsErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              secureTextEntry
              error={settingsErrors.confirmPassword}
            />
            <Button
              title={isLoading ? 'Saving...' : 'Save Changes'}
              onPress={handleSaveSettings}
              variant="primary"
              disabled={isLoading}
              style={styles.settingsButton}
            />
          </Card>
        </View>
      ) : null}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  headerTextBlock: {
    flex: 1,
    marginRight: Spacing.md,
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
  headerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  headerStat: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    ...Typography.h2,
    color: Colors.textInverse,
  },
  headerStatLabel: {
    ...Typography.caption,
    color: Colors.textInverse,
    marginTop: Spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: Spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.body,
    color: Colors.textLight,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.textInverse,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  settingsSection: {
    marginBottom: Spacing.lg,
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
  typeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  requestSectionTitle: {
    marginTop: Spacing.lg,
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
  analyticsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  analyticsCard: {
    flex: 1,
    alignItems: 'center',
  },
  analyticsValue: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  analyticsLabel: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  chartTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  progressRow: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  progressValue: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  progressTrack: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metricLabel: {
    ...Typography.body,
    color: Colors.textLight,
  },
  metricValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '700',
  },
  settingsButton: {
    marginTop: Spacing.md,
  },
  headerTopMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  welcomeMobile: {
    fontSize: 20,
  },
  roleMobile: {
    fontSize: 13,
  },
  headerStatsMobile: {
    flexDirection: 'column',
    gap: Spacing.md,
  },
  tabContainerMobile: {
    flexDirection: 'column',
    marginHorizontal: Spacing.sm,
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
    flexDirection: 'row',
  },
  reviewedBadgeMobile: {
    marginTop: Spacing.md,
    width: '100%',
  },
  analyticsGridMobile: {
    flexDirection: 'column',
  },
  analyticsCardMobile: {
    width: '100%',
  },
  analyticsValueMobile: {
    fontSize: 28,
  },
  headerStatValueMobile: {
    fontSize: 20,
  },
  headerStatLabelMobile: {
    fontSize: 11,
  },
});

export default StaffDashboardScreen;
