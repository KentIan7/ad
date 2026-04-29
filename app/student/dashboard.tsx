/**
 * Student Dashboard Screen
 * Shows department-specific clearances, progress analytics, and account settings
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextInput } from '@/components/ui/text-input';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { StudentClearance } from '@/types';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';

interface StudentDashboardScreenProps {
  navigation?: any;
}

type StudentTab = 'clearances' | 'analytics' | 'settings';

const StudentDashboardScreen: React.FC<StudentDashboardScreenProps> = ({ navigation }) => {
  const { user, logout, updateAccountSettings, isLoading } = useAuth();
  const { clearances, studentClearances, departments } = useApp();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<StudentTab>('clearances');
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

  const departmentName = useMemo(() => {
    if (!user?.department) return 'Department not assigned';
    return departments.find((department) => department.id === user.department)?.name || 'Department not assigned';
  }, [departments, user?.department]);

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

  const totals = useMemo(() => {
    const totalAssigned = assignedClearances.length;
    const approved = assignedClearances.filter((clearance) => clearance.status === 'approved').length;
    const rejected = assignedClearances.filter((clearance) => clearance.status === 'rejected').length;
    const pending = assignedClearances.filter((clearance) => clearance.status === 'pending').length;
    const completionRate = totalAssigned === 0 ? 0 : Math.round((approved / totalAssigned) * 100);
    return {
      totalAssigned,
      approved,
      rejected,
      pending,
      completionRate,
    };
  }, [assignedClearances]);

  const handleLogout = () => {
    logout();
  };

  const handleSaveSettings = async () => {
    const nextErrors: typeof settingsErrors = {};

    if (!settingsName.trim()) nextErrors.name = 'Name is required';
    if (!settingsEmail.trim()) nextErrors.email = 'Email is required';
    else if (!settingsEmail.includes('@')) nextErrors.email = 'Please enter a valid email';

    if (newPassword && newPassword.length < 6) {
      nextErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

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
      <View style={styles.header}>
        <View style={[styles.headerTop, width < 600 && styles.headerTopMobile]}>
          <View style={styles.headerTextBlock}>
            <Text style={[styles.welcome, width < 600 && styles.welcomeMobile]}>Welcome, {user?.name}</Text>
            <Text style={[styles.department, width < 600 && styles.departmentMobile]}>{departmentName}</Text>
          </View>
          <Button title="Logout" onPress={handleLogout} variant="danger" size="small" />
        </View>
        <View style={[styles.headerStats, width < 600 && styles.headerStatsMobile]}>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatValue, width < 600 && styles.headerStatValueMobile]}>{totals.totalAssigned}</Text>
            <Text style={[styles.headerStatLabel, width < 600 && styles.headerStatLabelMobile]}>Assigned</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatValue, width < 600 && styles.headerStatValueMobile]}>{totals.approved}</Text>
            <Text style={[styles.headerStatLabel, width < 600 && styles.headerStatLabelMobile]}>Approved</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatValue, width < 600 && styles.headerStatValueMobile]}>{totals.pending}</Text>
            <Text style={[styles.headerStatLabel, width < 600 && styles.headerStatLabelMobile]}>Pending</Text>
          </View>
        </View>
      </View>

      <View style={[styles.tabContainer, width < 600 && styles.tabContainerMobile]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'clearances' && styles.activeTab]}
          onPress={() => setActiveTab('clearances')}
        >
          <Text style={[styles.tabText, activeTab === 'clearances' && styles.activeTabText]}>
            My Clearance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'clearances' ? (
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
      ) : null}

      {activeTab === 'analytics' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Analytics</Text>
          <Text style={styles.sectionSubtitle}>
            A quick view of your clearance completion and approval progress.
          </Text>

          <View style={[styles.analyticsGrid, width < 600 && styles.analyticsGridMobile]}>
            <Card style={[styles.analyticsCard, width < 600 && styles.analyticsCardMobile]}>
              <Text style={[styles.analyticsValue, width < 600 && styles.analyticsValueMobile]}>{totals.completionRate}%</Text>
              <Text style={styles.analyticsLabel}>Completion Rate</Text>
            </Card>
            <Card style={[styles.analyticsCard, width < 600 && styles.analyticsCardMobile]}>
              <Text style={[styles.analyticsValue, width < 600 && styles.analyticsValueMobile]}>{totals.pending}</Text>
              <Text style={styles.analyticsLabel}>Pending Review</Text>
            </Card>
          </View>

          <Card>
            <Text style={styles.chartTitle}>Progress Breakdown</Text>
            {renderProgressBar('Approved', totals.completionRate, Colors.approved)}
            {renderProgressBar(
              'Needs Attention',
              totals.totalAssigned === 0 ? 0 : Math.round((totals.rejected / totals.totalAssigned) * 100),
              Colors.rejected
            )}
          </Card>

          <Card>
            <Text style={styles.chartTitle}>Current Totals</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Assigned Clearances</Text>
              <Text style={styles.metricValue}>{totals.totalAssigned}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Approved</Text>
              <Text style={styles.metricValue}>{totals.approved}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Pending Review</Text>
              <Text style={styles.metricValue}>{totals.pending}</Text>
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
  department: {
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
  subsection: {
    marginBottom: Spacing.lg,
  },
  subsectionTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.sm,
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
  availableCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  availableInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  availableName: {
    ...Typography.h3,
    color: Colors.text,
  },
  availableDescription: {
    ...Typography.body,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  partListItem: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  submittedBadge: {
    backgroundColor: Colors.approvedBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  submittedBadgeText: {
    ...Typography.caption,
    color: Colors.approved,
    fontWeight: '600',
  },
  statusPill: {
    marginTop: Spacing.sm,
  },
  viewOnlyBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  viewOnlyBadgeText: {
    ...Typography.caption,
    color: Colors.textLight,
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
  departmentMobile: {
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

export default StudentDashboardScreen;
