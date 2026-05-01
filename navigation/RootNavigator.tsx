/**
 * Root Navigation Setup
 * Routes users to appropriate screen based on auth status and role
 * Uses custom mobile drawer for navigation on small screens
 */

import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View, ScrollView } from 'react-native';
import { createDrawerNavigator, DrawerScreenProps, DrawerNavigationProp } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

// Import screens
import AdminClearancesScreen from '@/app/admin/clearances';
import AdminDashboardScreen from '@/app/admin/dashboard';
import AdminDepartmentsScreen from '@/app/admin/departments';
import AdminPendingStudentsScreen from '@/app/admin/pending-students';
import AdminStaffAccountsScreen from '@/app/admin/staff-accounts';
import AdminStaffRolesScreen from '@/app/admin/staff-roles';
import AdminStudentsScreen from '@/app/admin/students';
import ForgotPasswordScreen from '@/app/forgot-password';
import LoginScreen from '@/app/login';
import ResetPasswordScreen from '@/app/reset-password';
import StaffApproveScreen from '@/app/staff/approve';
import StaffClearancesScreen from '@/app/staff/clearances';
import StaffDashboardScreen from '@/app/staff/dashboard';
import StaffRejectScreen from '@/app/staff/reject';
import StaffSettingsScreen from '@/app/staff/settings';
import ClearanceDetailScreen from '@/app/student/clearance-detail';
import StudentClearancesScreen from '@/app/student/clearances';
import StudentDashboardScreen from '@/app/student/dashboard';
import StudentSettingsScreen from '@/app/student/settings';

/**
 * Root Navigator Component
 * Conditionally renders screens based on authentication state and user role
 */
export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [loggedOutScreen, setLoggedOutScreen] = React.useState<'login' | 'forgot-password' | 'reset-password'>('login');
  const [params, setParams] = React.useState<any>(null);

  const navigation = {
    navigate: (name: string, p?: any) => {
      if (name === 'ForgotPassword') {
        setLoggedOutScreen('forgot-password');
      } else if (name === 'ResetPassword') {
        setLoggedOutScreen('reset-password');
      } else if (name === 'Login') {
        setLoggedOutScreen('login');
      }
      setParams(p);
    },
    goBack: () => setLoggedOutScreen('login'),
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Not logged in - show login or auth flow screens
  if (!user) {
    switch (loggedOutScreen) {
      case 'forgot-password':
        return <ForgotPasswordScreen navigation={navigation} />;
      case 'reset-password':
        return <ResetPasswordScreen route={{ params }} navigation={navigation} />;
      case 'login':
      default:
        return <LoginScreen navigation={navigation} />;
    }
  }

  // Admin screens
  if (user.role === 'admin') {
    return <AdminNavigator />;
  }

  // Staff screens
  if (user.role === 'staff') {
    return <StaffNavigator />;
  }

  // Student screens
  if (user.role === 'student') {
    return <StudentNavigator />;
  }

  return <LoginScreen navigation={navigation} />;
};

/**
 * Drawer Navigation Setup
 * Custom drawer for mobile-optimized navigation
 */
interface SidebarItem {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  badge?: number;
}

/**
 * Custom Mobile Drawer Component
 */
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
  onItemPress: (key: string) => void;
  activeItem: string;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, items, onItemPress, activeItem }) => {
  const drawerAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(drawerAnimation, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={0.5}
          onPress={onClose}
        />
      )}
      <Animated.View
        style={[
          styles.mobileDrawer,
          {
            transform: [
              {
                translateX: drawerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-260, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView style={{ flex: 1 }} scrollEnabled={false}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.adminNavItem, activeItem === item.key && styles.adminNavItemActive]}
              onPress={() => {
                onItemPress(item.key);
                onClose();
              }}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons 
                name={item.icon} 
                size={20} 
                color={activeItem === item.key ? '#ffffff' : '#cbd5e1'} 
              />
              <Text style={[styles.adminNavText, activeItem === item.key && styles.adminNavTextActive]}>
                {item.label}
              </Text>
              {typeof item.badge === 'number' ? (
                <View style={[styles.adminNavBadge, item.badge > 0 && styles.adminNavBadgeAlert]}>
                  <Text style={[styles.adminNavBadgeText, item.badge > 0 && styles.adminNavBadgeAlertText]}>
                    {item.badge}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
};

interface AdminHeaderProps {
  adminName: string;
  isCompact: boolean;
  isMobileDrawer: boolean;
  onDrawerToggle: () => void;
  onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ adminName, isCompact, isMobileDrawer, onDrawerToggle, onLogout }) => (
  <View style={styles.adminHeader}>
    <View style={styles.adminBrandBlock}>
      {isMobileDrawer && (
        <TouchableOpacity onPress={onDrawerToggle} style={styles.hamburgerButton} accessibilityRole="button">
          <MaterialCommunityIcons name="menu" size={24} color="#0f172a" />
        </TouchableOpacity>
      )}
      <View style={styles.adminBrandMark}>
        <MaterialCommunityIcons name="check-decagram" size={18} color="#ffffff" />
      </View>
      <Text style={styles.adminBrandText}>ClearanceHub</Text>
    </View>

    <View style={styles.adminHeaderRight}>
      {!isCompact ? <Text style={styles.adminWelcome}>Welcome, {adminName}</Text> : null}
      <View style={styles.adminRoleBadge}>
        <Text style={styles.adminRoleBadgeText}>Administrator</Text>
      </View>
      <TouchableOpacity style={styles.adminLogoutButton} onPress={onLogout} accessibilityRole="button">
        <MaterialCommunityIcons name="logout" size={18} color="#ffffff" />
        {!isCompact ? <Text style={styles.adminLogoutText}>Logout</Text> : null}
      </TouchableOpacity>
    </View>
  </View>
);

/**
 * Admin Navigator
 */
const AdminNavigator: React.FC = () => {
  const { user, logout } = useAuth();
  const { pendingStudents } = useApp();
  const [screen, setScreen] = React.useState('dashboard');
  const [params, setParams] = React.useState<any>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isMobileDrawer = width < 760;
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const pendingCount = pendingStudents.filter((student) => student.status === 'pending').length;

  const navigation = {
    navigate: (name: string, p?: any) => {
      setScreen(name);
      setParams(p);
    },
    goBack: () => setScreen('dashboard'),
  };

  const sidebarItems: SidebarItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'view-dashboard-outline' as const },
    { key: 'AdminDepartments', label: 'Departments', icon: 'office-building-outline' as const },
    { key: 'AdminStaffRoles', label: 'Roles', icon: 'shield-account-outline' as const },
    { key: 'AdminStaffAccounts', label: 'Staff', icon: 'account-tie-outline' as const },
    { key: 'AdminClearances', label: 'All Clearances', icon: 'clipboard-check-outline' as const },
    { key: 'AdminPendingStudents', label: 'Pending', icon: 'clock-alert-outline' as const, badge: pendingCount },
    { key: 'AdminStudents', label: 'Students', icon: 'account-school-outline' as const },
  ];

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <AdminDashboardScreen navigation={navigation} />;
      case 'AdminDepartments':
        return <AdminDepartmentsScreen navigation={navigation} />;
      case 'AdminStaffRoles':
        return <AdminStaffRolesScreen navigation={navigation} />;
      case 'AdminStaffAccounts':
        return <AdminStaffAccountsScreen navigation={navigation} />;
      case 'AdminClearances':
        return <AdminClearancesScreen navigation={navigation} />;
      case 'AdminPendingStudents':
        return <AdminPendingStudentsScreen navigation={navigation} />;
      case 'AdminStudents':
        return <AdminStudentsScreen navigation={navigation} />;
      default:
        return <AdminDashboardScreen navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.adminShell}>
      <AdminHeader
        adminName={user?.name || 'Admin User'}
        onLogout={logout}
        isCompact={isCompact}
        isMobileDrawer={isMobileDrawer}
        onDrawerToggle={() => setDrawerOpen(!drawerOpen)}
      />
      <View style={styles.adminBody}>
        {!isMobileDrawer && (
          <View style={[styles.adminSidebar, isCompact && styles.adminSidebarCompact]}>
            <View style={styles.adminNavGroup}>
              {sidebarItems.map((item) => (
                <AdminNavItem
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                  isActive={screen === item.key}
                  isCompact={isCompact}
                  onPress={() => navigation.navigate(item.key)}
                />
              ))}
            </View>
          </View>
        )}

        {isMobileDrawer && (
          <MobileDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            items={sidebarItems}
            onItemPress={(key) => navigation.navigate(key)}
            activeItem={screen}
          />
        )}

        <View style={styles.adminContent}>{renderScreen()}</View>
      </View>
    </SafeAreaView>
  );
};

interface AdminNavItemProps {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  badge?: number;
  isActive: boolean;
  isCompact: boolean;
  onPress: () => void;
}

const AdminNavItem: React.FC<AdminNavItemProps> = ({ label, icon, badge, isActive, isCompact, onPress }) => (
  <TouchableOpacity
    style={[styles.adminNavItem, isActive && styles.adminNavItemActive, isCompact && styles.adminNavItemCompact]}
    onPress={onPress}
    accessibilityRole="button"
  >
    <MaterialCommunityIcons name={icon} size={20} color={isActive ? '#ffffff' : '#cbd5e1'} />
    {!isCompact ? (
      <Text style={[styles.adminNavText, isActive && styles.adminNavTextActive]}>{label}</Text>
    ) : null}
    {typeof badge === 'number' ? (
      <View style={[styles.adminNavBadge, badge > 0 && styles.adminNavBadgeAlert]}>
        <Text style={[styles.adminNavBadgeText, badge > 0 && styles.adminNavBadgeAlertText]}>{badge}</Text>
      </View>
    ) : null}
  </TouchableOpacity>
);

/**
 * Staff Navigator
 */
const StaffNavigator: React.FC = () => {
  const { user, logout } = useAuth();
  const [screen, setScreen] = React.useState('dashboard');
  const [params, setParams] = React.useState<any>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isMobileDrawer = width < 600;
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const navigation = {
    navigate: (name: string, p?: any) => {
      setScreen(name);
      setParams(p);
    },
    goBack: () => setScreen('dashboard'),
  };

  const sidebarItems: SidebarItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'view-dashboard-outline' as const },
    { key: 'StaffClearances', label: 'Student Clearances', icon: 'clipboard-check-outline' as const },
    { key: 'StaffSettings', label: 'Settings', icon: 'cog-outline' as const },
  ];

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <StaffDashboardScreen navigation={navigation} />;
      case 'StaffClearances':
        return <StaffClearancesScreen navigation={navigation} />;
      case 'StaffSettings':
        return <StaffSettingsScreen navigation={navigation} />;
      case 'StaffApprove':
        return <StaffApproveScreen route={{ params }} navigation={navigation} />;
      case 'StaffReject':
        return <StaffRejectScreen route={{ params }} navigation={navigation} />;
      default:
        return <StaffDashboardScreen navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.adminShell}>
      <StaffHeader
        staffName={user?.name || 'Staff Member'}
        onLogout={logout}
        isCompact={isCompact}
        isMobileDrawer={isMobileDrawer}
        onDrawerToggle={() => setDrawerOpen(!drawerOpen)}
      />
      <View style={styles.adminBody}>
        {!isMobileDrawer && (
          <View style={[styles.adminSidebar, isCompact && styles.adminSidebarCompact]}>
            <View style={styles.adminNavGroup}>
              {sidebarItems.map((item) => (
                <AdminNavItem
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  isActive={screen === item.key}
                  isCompact={isCompact}
                  onPress={() => navigation.navigate(item.key)}
                />
              ))}
            </View>
          </View>
        )}

        {isMobileDrawer && (
          <MobileDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            items={sidebarItems}
            onItemPress={(key) => navigation.navigate(key)}
            activeItem={screen}
          />
        )}

        <View style={styles.adminContent}>{renderScreen()}</View>
      </View>
    </SafeAreaView>
  );
};

interface StaffHeaderProps {
  staffName: string;
  isCompact: boolean;
  isMobileDrawer: boolean;
  onDrawerToggle: () => void;
  onLogout: () => void;
}

const StaffHeader: React.FC<StaffHeaderProps> = ({ staffName, isCompact, isMobileDrawer, onDrawerToggle, onLogout }) => (
  <View style={styles.adminHeader}>
    <View style={styles.adminBrandBlock}>
      {isMobileDrawer && (
        <TouchableOpacity onPress={onDrawerToggle} style={styles.hamburgerButton} accessibilityRole="button">
          <MaterialCommunityIcons name="menu" size={24} color="#0f172a" />
        </TouchableOpacity>
      )}
      <View style={styles.adminBrandMark}>
        <MaterialCommunityIcons name="check-decagram" size={18} color="#ffffff" />
      </View>
      <Text style={styles.adminBrandText}>ClearanceHub</Text>
    </View>

    <View style={styles.adminHeaderRight}>
      {!isCompact ? <Text style={styles.adminWelcome}>Welcome, {staffName}</Text> : null}
      <View style={styles.adminRoleBadge}>
        <Text style={styles.adminRoleBadgeText}>Staff</Text>
      </View>
      <TouchableOpacity style={styles.adminLogoutButton} onPress={onLogout} accessibilityRole="button">
        <MaterialCommunityIcons name="logout" size={18} color="#ffffff" />
        {!isCompact ? <Text style={styles.adminLogoutText}>Logout</Text> : null}
      </TouchableOpacity>
    </View>
  </View>
);

/**
 * Student Navigator
 */
const StudentNavigator: React.FC = () => {
  const { user, logout } = useAuth();
  const [screen, setScreen] = React.useState('dashboard');
  const [params, setParams] = React.useState<any>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const isMobileDrawer = width < 760;
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const navigation = {
    navigate: (name: string, p?: any) => {
      setScreen(name);
      setParams(p);
    },
    goBack: () => setScreen('dashboard'),
  };

  const sidebarItems: SidebarItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'view-dashboard-outline' as const },
    { key: 'StudentClearances', label: 'My Clearances', icon: 'clipboard-check-outline' as const },
    { key: 'StudentSettings', label: 'Settings', icon: 'cog-outline' as const },
  ];

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <StudentDashboardScreen navigation={navigation} />;
      case 'StudentClearances':
        return <StudentClearancesScreen navigation={navigation} />;
      case 'StudentSettings':
        return <StudentSettingsScreen navigation={navigation} />;
      case 'StudentClearanceDetail':
        return <ClearanceDetailScreen route={{ params }} navigation={navigation} />;
      default:
        return <StudentDashboardScreen navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.adminShell}>
      <StudentHeader
        studentName={user?.name || 'Student'}
        onLogout={logout}
        isCompact={isCompact}
        isMobileDrawer={isMobileDrawer}
        onDrawerToggle={() => setDrawerOpen(!drawerOpen)}
      />
      <View style={styles.adminBody}>
        {!isMobileDrawer && (
          <View style={[styles.adminSidebar, isCompact && styles.adminSidebarCompact]}>
            <View style={styles.adminNavGroup}>
              {sidebarItems.map((item) => (
                <AdminNavItem
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  isActive={screen === item.key}
                  isCompact={isCompact}
                  onPress={() => navigation.navigate(item.key)}
                />
              ))}
            </View>
          </View>
        )}

        {isMobileDrawer && (
          <MobileDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            items={sidebarItems}
            onItemPress={(key) => navigation.navigate(key)}
            activeItem={screen}
          />
        )}

        <View style={styles.adminContent}>{renderScreen()}</View>
      </View>
    </SafeAreaView>
  );
};

interface StudentHeaderProps {
  studentName: string;
  isCompact: boolean;
  isMobileDrawer: boolean;
  onDrawerToggle: () => void;
  onLogout: () => void;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ studentName, isCompact, isMobileDrawer, onDrawerToggle, onLogout }) => (
  <View style={styles.adminHeader}>
    <View style={styles.adminBrandBlock}>
      {isMobileDrawer && (
        <TouchableOpacity onPress={onDrawerToggle} style={styles.hamburgerButton} accessibilityRole="button">
          <MaterialCommunityIcons name="menu" size={24} color="#0f172a" />
        </TouchableOpacity>
      )}
      <View style={styles.adminBrandMark}>
        <MaterialCommunityIcons name="check-decagram" size={18} color="#ffffff" />
      </View>
      <Text style={styles.adminBrandText}>ClearanceHub</Text>
    </View>

    <View style={styles.adminHeaderRight}>
      {!isCompact ? <Text style={styles.adminWelcome}>Welcome, {studentName}</Text> : null}
      <View style={styles.adminRoleBadge}>
        <Text style={styles.adminRoleBadgeText}>Student</Text>
      </View>
      <TouchableOpacity style={styles.adminLogoutButton} onPress={onLogout} accessibilityRole="button">
        <MaterialCommunityIcons name="logout" size={18} color="#ffffff" />
        {!isCompact ? <Text style={styles.adminLogoutText}>Logout</Text> : null}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  adminShell: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  adminHeader: {
    minHeight: 72,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  adminBrandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  adminBrandMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBrandText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  adminHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    flex: 1,
  },
  adminWelcome: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  adminRoleBadge: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  adminRoleBadgeText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
  },
  adminLogoutButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  adminLogoutText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  adminBody: {
    flex: 1,
    flexDirection: 'row',
  },
  adminSidebar: {
    width: 248,
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  adminSidebarCompact: {
    width: 76,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  drawerContent: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
  },
  mobileDrawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 260,
    backgroundColor: '#1e293b',
    zIndex: 50,
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  adminContent: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  adminNavGroup: {
    marginBottom: 22,
    width: '100%',
  },
  adminNavGroupTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  adminNavItem: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  adminNavItemActive: {
    backgroundColor: '#2563eb',
  },
  adminNavItemCompact: {
    width: 48,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  adminNavText: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '700',
  },
  adminNavTextActive: {
    color: '#ffffff',
  },
  adminNavBadge: {
    minWidth: 24,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#475569',
    paddingHorizontal: 6,
  },
  adminNavBadgeAlert: {
    backgroundColor: '#f97316',
  },
  adminNavBadgeText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '800',
  },
  adminNavBadgeAlertText: {
    color: '#ffffff',
  },
});
