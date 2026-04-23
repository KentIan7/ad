/**
 * Root Navigation Setup
 * Routes users to appropriate screen based on auth status and role
 */

import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

// Import screens
import AdminClearancesScreen from '@/app/admin/clearances';
import AdminDashboardScreen from '@/app/admin/dashboard';
import AdminStaffRolesScreen from '@/app/admin/staff-roles';
import AdminStudentsScreen from '@/app/admin/students';
import LoginScreen from '@/app/login';
import ForgotPasswordScreen from '@/app/forgot-password';
import ResetPasswordScreen from '@/app/reset-password';
import StaffApproveScreen from '@/app/staff/approve';
import StaffDashboardScreen from '@/app/staff/dashboard';
import StaffRejectScreen from '@/app/staff/reject';
import ClearanceDetailScreen from '@/app/student/clearance-detail';
import StudentDashboardScreen from '@/app/student/dashboard';
import StudentSubmitScreen from '@/app/student/submit';

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
 * Admin Navigator
 * Nested navigation for admin features
 */
const AdminNavigator: React.FC = () => {
  const [screen, setScreen] = React.useState('dashboard');
  const [params, setParams] = React.useState<any>(null);

  const navigation = {
    navigate: (name: string, p?: any) => {
      setScreen(name);
      setParams(p);
    },
    goBack: () => setScreen('dashboard'),
  };

  switch (screen) {
    case 'dashboard':
      return <AdminDashboardScreen navigation={navigation} />;
    case 'AdminStaffRoles':
      return <AdminStaffRolesScreen navigation={navigation} />;
    case 'AdminClearances':
      return <AdminClearancesScreen navigation={navigation} />;
    case 'AdminStudents':
      return <AdminStudentsScreen navigation={navigation} />;
    default:
      return <AdminDashboardScreen navigation={navigation} />;
  }
};

/**
 * Staff Navigator
 * Nested navigation for staff features
 */
const StaffNavigator: React.FC = () => {
  const [screen, setScreen] = React.useState('dashboard');
  const [params, setParams] = React.useState<any>(null);

  const navigation = {
    navigate: (name: string, p?: any) => {
      setScreen(name);
      setParams(p);
    },
    goBack: () => setScreen('dashboard'),
  };

  switch (screen) {
    case 'dashboard':
      return <StaffDashboardScreen navigation={navigation} />;
    case 'StaffApprove':
      return (
        <StaffApproveScreen route={{ params }} navigation={navigation} />
      );
    case 'StaffReject':
      return <StaffRejectScreen route={{ params }} navigation={navigation} />;
    default:
      return <StaffDashboardScreen navigation={navigation} />;
  }
};

/**
 * Student Navigator
 * Nested navigation for student features
 */
const StudentNavigator: React.FC = () => {
  const [screen, setScreen] = React.useState('dashboard');
  const [params, setParams] = React.useState<any>(null);

  const navigation = {
    navigate: (name: string, p?: any) => {
      setScreen(name);
      setParams(p);
    },
    goBack: () => setScreen('dashboard'),
  };

  switch (screen) {
    case 'dashboard':
      return <StudentDashboardScreen navigation={navigation} />;
    case 'StudentSubmit':
      return <StudentSubmitScreen route={{ params }} navigation={navigation} />;
    case 'StudentClearanceDetail':
      return (
        <ClearanceDetailScreen route={{ params }} navigation={navigation} />
      );
    default:
      return <StudentDashboardScreen navigation={navigation} />;
  }
};
