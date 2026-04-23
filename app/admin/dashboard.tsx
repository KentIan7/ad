/**
 * Admin Dashboard Screen
 * Main dashboard for admin users to manage staff roles and clearances
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AdminDashboardScreenProps {
  navigation?: any;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { staffRoles, clearances } = useApp();
  const [expandedStaffRoles, setExpandedStaffRoles] = useState(false);
  const [expandedClearances, setExpandedClearances] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const stats = [
    { label: 'Staff Roles', value: staffRoles.length, icon: '👥' },
    { label: 'Clearances', value: clearances.length, icon: '📋' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome, {user?.name}</Text>
          <Text style={styles.role}>Administrator</Text>
        </View>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          size="small"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <Card key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Quick Actions</Text>
        
        <Button
          title="Manage Staff Roles"
          onPress={() => navigation?.navigate('AdminStaffRoles')}
          variant="primary"
          style={styles.actionButton}
        />
        
        <Button
          title="Manage Clearances"
          onPress={() => navigation?.navigate('AdminClearances')}
          variant="primary"
          style={styles.actionButton}
        />
        
        <Button
          title="View All Students"
          onPress={() => navigation?.navigate('AdminStudents')}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      {/* Recent Staff Roles */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.dropdownHeader} 
          onPress={() => setExpandedStaffRoles(!expandedStaffRoles)}
        >
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>👥 Staff Roles</Text>
          <Text style={styles.dropdownIcon}>{expandedStaffRoles ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        
        {expandedStaffRoles && (
          staffRoles.length === 0 ? (
            <Card style={styles.dropdownContentCard}>
              <Text style={styles.emptyText}>No staff roles created yet</Text>
            </Card>
          ) : (
            <FlatList
              data={staffRoles.slice(0, 3)}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              style={styles.dropdownList}
              renderItem={({ item }) => (
                <Card>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </Card>
              )}
            />
          )
        )}
      </View>

      {/* Recent Clearances */}
      <View style={[styles.section, { marginBottom: Spacing.lg }]}>
        <TouchableOpacity 
          style={styles.dropdownHeader} 
          onPress={() => setExpandedClearances(!expandedClearances)}
        >
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>📋 Clearances</Text>
          <Text style={styles.dropdownIcon}>{expandedClearances ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {expandedClearances && (
          clearances.length === 0 ? (
            <Card style={styles.dropdownContentCard}>
              <Text style={styles.emptyText}>No clearances created yet</Text>
            </Card>
          ) : (
            <FlatList
              data={clearances.slice(0, 3)}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              style={styles.dropdownList}
              renderItem={({ item }) => (
                <Card>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </Card>
              )}
            />
          )
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
  header: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xl,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  dropdownIcon: {
    ...Typography.body,
    color: Colors.textLight,
  },
  dropdownList: {
    marginTop: Spacing.sm,
  },
  dropdownContentCard: {
    marginTop: Spacing.sm,
  },
  actionButton: {
    marginVertical: Spacing.sm,
  },
  itemTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  itemDescription: {
    ...Typography.body,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
  itemMeta: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});

export default AdminDashboardScreen;

