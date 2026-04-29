/**
 * Admin Dashboard Screen
 * Main dashboard for admin users to monitor departments, staff, clearances, and pending registrations.
 */

import { Card } from '@/components/ui/card';
import { BorderRadius, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface AdminDashboardScreenProps {
  navigation?: any;
}

type OverviewTab = 'departments' | 'roles' | 'clearances';

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  actionLabel: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  isAttention?: boolean;
  onPress?: () => void;
  isMobile?: boolean;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { staffRoles, clearances, departments, pendingStudents, users } = useApp();
  const [activeOverviewTab, setActiveOverviewTab] = useState<OverviewTab>('departments');
  const { width } = useWindowDimensions();
  const [showOverview, setShowOverview] = useState(width >= 760);
  const isMobile = width < 600;

  const activeDepartments = useMemo(
    () => departments.filter((department) => department.status === 'active'),
    [departments]
  );
  const pendingCount = pendingStudents.filter((student) => student.status === 'pending').length;
  const staffCount = users.filter((currentUser) => currentUser.role === 'staff').length;
  const useWideGrid = width >= 980;

  const stats: StatCardProps[] = [
    {
      title: 'Departments',
      value: activeDepartments.length,
      description: `${activeDepartments.length} Departments`,
      actionLabel: 'Manage',
      icon: 'office-building-outline',
      onPress: () => navigation?.navigate('AdminDepartments'),
    },
    {
      title: 'Staff',
      value: staffCount,
      description: `${staffCount} Staff Accounts`,
      actionLabel: 'View all',
      icon: 'account-tie-outline',
      onPress: () => navigation?.navigate('AdminStaffAccounts'),
    },
    {
      title: 'Clearances',
      value: clearances.length,
      description: `${clearances.length} Clearance Types`,
      actionLabel: 'Manage',
      icon: 'clipboard-check-outline',
      onPress: () => navigation?.navigate('AdminClearances'),
    },
    {
      title: 'Pending',
      value: pendingCount,
      description: pendingCount === 1 ? '1 Pending Registration' : `${pendingCount} Pending Registrations`,
      actionLabel: 'Review',
      icon: 'clock-alert-outline',
      isAttention: pendingCount > 0,
      onPress: () => navigation?.navigate('AdminPendingStudents'),
    },
  ];

  const overviewTabs: { key: OverviewTab; label: string }[] = [
    { key: 'departments', label: 'Departments' },
    { key: 'roles', label: 'Roles' },
    { key: 'clearances', label: 'Clearances' },
  ];

  const overviewItems = useMemo(() => {
    if (activeOverviewTab === 'departments') {
      return activeDepartments.slice(0, 5).map((department) => ({
        id: department.id,
        title: department.name,
        description: department.description || 'No description provided',
        meta: 'Active department',
      }));
    }

    if (activeOverviewTab === 'roles') {
      return staffRoles.slice(0, 5).map((role) => ({
        id: role.id,
        title: role.name,
        description: role.description || 'No description provided',
        meta: 'Staff role',
      }));
    }

    return clearances.slice(0, 5).map((clearance) => ({
      id: clearance.id,
      title: clearance.name,
      description: clearance.description || 'No description provided',
      meta: `${clearance.departmentsAllowed.length} department${clearance.departmentsAllowed.length === 1 ? '' : 's'}`,
    }));
  }, [activeDepartments, activeOverviewTab, clearances, staffRoles]);

  const emptyOverviewText =
    activeOverviewTab === 'departments'
      ? 'No active departments yet.'
      : activeOverviewTab === 'roles'
        ? 'No staff roles created yet.'
        : 'No clearances created yet.';

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {isMobile ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentMobile} scrollEnabled={false}>
          <View style={[styles.pageHeader, styles.pageHeaderMobile]}>
            <Text style={styles.pageTitleMobile}>Dashboard</Text>
          </View>

          <View style={[styles.statsGrid, styles.statsGridMobile]}>
            {stats.map((stat) => (
              <View key={stat.title} style={[styles.statGridItem, styles.statGridItemCompact]}>
                <StatCard {...stat} isMobile={isMobile} />
              </View>
            ))}
          </View>

          {showOverview && !isMobile && (
            <View style={styles.overviewSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Overview</Text>
                <Text style={styles.sectionSubtitle}>A short preview of your core management lists.</Text>
              </View>

              <View style={styles.tabs}>
                {overviewTabs.map((tab) => {
                  const isActive = activeOverviewTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[styles.tab, isActive && styles.tabActive]}
                      onPress={() => setActiveOverviewTab(tab.key)}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Card style={styles.overviewCard}>
                {overviewItems.length === 0 ? (
                  <Text style={styles.emptyText}>{emptyOverviewText}</Text>
                ) : (
                  <FlatList
                    data={overviewItems}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                    renderItem={({ item }) => (
                      <View style={styles.overviewItem}>
                        <View style={styles.overviewItemText}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <Text style={styles.itemDescription}>{item.description}</Text>
                        </View>
                        <View style={styles.metaBadge}>
                          <Text style={styles.metaBadgeText}>{item.meta}</Text>
                        </View>
                      </View>
                    )}
                  />
                )}
              </Card>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.content}>
          <View style={[styles.pageHeader, width < 600 && styles.pageHeaderMobile]}>
            <Text style={[styles.pageTitle, width < 600 && styles.pageTitleMobile]}>Dashboard</Text>
            <Text style={[styles.pageSubtitle, width < 600 && styles.pageSubtitleMobile]}>Monitor the clearance workflow and jump into the areas that need attention.</Text>
          </View>

          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.title} style={[styles.statGridItem, useWideGrid ? styles.statGridItemWide : width < 600 ? styles.statGridItemSmall : styles.statGridItemMobile]}>
                <StatCard {...stat} />
              </View>
            ))}
          </View>

          <View style={styles.overviewSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Overview</Text>
              <Text style={styles.sectionSubtitle}>A short preview of your core management lists.</Text>
            </View>

            <View style={styles.tabs}>
              {overviewTabs.map((tab) => {
                const isActive = activeOverviewTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, isActive && styles.tabActive]}
                    onPress={() => setActiveOverviewTab(tab.key)}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Card style={styles.overviewCard}>
              {overviewItems.length === 0 ? (
                <Text style={styles.emptyText}>{emptyOverviewText}</Text>
              ) : (
                <FlatList
                  data={overviewItems}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                  renderItem={({ item }) => (
                    <View style={styles.overviewItem}>
                      <View style={styles.overviewItemText}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemDescription}>{item.description}</Text>
                      </View>
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaBadgeText}>{item.meta}</Text>
                      </View>
                    </View>
                  )}
                />
              )}
            </Card>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  actionLabel,
  icon,
  isAttention,
  onPress,
  isMobile,
}) => (
  <TouchableOpacity
    style={[styles.statCard, isAttention && styles.statCardAttention, isMobile && styles.statCardMobile]}
    onPress={onPress}
    accessibilityRole="button"
  >
    <View style={styles.statCardHeader}>
      <View style={[styles.statIcon, isAttention && styles.statIconAttention, isMobile && styles.statIconMobile]}>
        <MaterialCommunityIcons name={icon} size={isMobile ? 18 : 22} color={isAttention ? '#c2410c' : '#2563eb'} />
      </View>
      <Text style={[styles.statTitle, isMobile && styles.statTitleMobile]}>{title}</Text>
    </View>
    <Text style={[styles.statValue, isMobile && styles.statValueMobile, isAttention && styles.statValueAttention]}>{value}</Text>
    <Text style={[styles.statDescription, isMobile && styles.statDescriptionMobile]}>{description}</Text>
    <View style={styles.statActionRow}>
      <Text style={[styles.statAction, isMobile && styles.statActionMobile, isAttention && styles.statActionAttention]}>{actionLabel}</Text>
      <MaterialCommunityIcons name="arrow-right" size={isMobile ? 14 : 16} color={isAttention ? '#c2410c' : '#2563eb'} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 24,
  },
  pageHeaderMobile: {
    marginBottom: 16,
  },
  pageTitle: {
    ...Typography.h1,
    color: '#0f172a',
    marginBottom: 6,
  },
  pageTitleMobile: {
    fontSize: 22,
    marginBottom: 4,
  },
  pageSubtitle: {
    ...Typography.body,
    color: '#64748b',
    lineHeight: 20,
  },
  pageSubtitleMobile: {
    fontSize: 13,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statGridItem: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statGridItemSmall: {
    width: '100%',
  },
  statGridItemMobile: {
    width: '50%',
  },
  statGridItemWide: {
    width: '25%',
  },
  statCard: {
    minHeight: 176,
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  statCardAttention: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconAttention: {
    backgroundColor: '#ffedd5',
  },
  statTitle: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontWeight: '800',
  },
  statValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 6,
  },
  statValueAttention: {
    color: '#9a3412',
  },
  statDescription: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 18,
  },
  statActionRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statAction: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '800',
  },
  statActionAttention: {
    color: '#c2410c',
  },
  overviewSection: {
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    ...Typography.h3,
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: '#64748b',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  tab: {
    minHeight: 38,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#0f172a',
  },
  overviewCard: {
    marginHorizontal: 0,
    marginVertical: 0,
    padding: 0,
    overflow: 'hidden',
  },
  overviewItem: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  overviewItemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '800',
    marginBottom: 4,
  },
  itemDescription: {
    ...Typography.body,
    color: '#64748b',
    lineHeight: 20,
  },
  metaBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 1,
  },
  metaBadgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '800',
  },
  listSeparator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  emptyText: {
    ...Typography.body,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 28,
    paddingHorizontal: 18,
  },
  containerMobile: {
    flex: 1,
  },
  contentMobile: {
    padding: 12,
    paddingBottom: 16,
  },
  statsGridMobile: {
    marginHorizontal: -4,
    marginBottom: 12,
    gap: 8,
  },
  statGridItemCompact: {
    width: '100%',
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  statCardMobile: {
    minHeight: 120,
    padding: 12,
  },
  statIconMobile: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  statTitleMobile: {
    fontSize: 12,
  },
  statValueMobile: {
    fontSize: 24,
    marginBottom: 4,
  },
  statDescriptionMobile: {
    fontSize: 11,
    marginBottom: 12,
  },
  statActionMobile: {
    fontSize: 11,
  },
});

export default AdminDashboardScreen;
