/**
 * Authentication Context
 * Manages user login/logout and authentication state
 */

import { auth, db } from '@/utils/firebase';
import { AuthContextType, User } from '@/types';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { apiService } from '@/services/api';
import React, { createContext, useCallback, useEffect, useState } from 'react';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  setUser: () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({
              id: firebaseUser.uid,
              ...userDoc.data() as Omit<User, 'id'>
            });
          } else {
            console.warn('User document not found in Firestore');
            
            // AUTO-FIX for user: If this is admin@admin.com, create the document
            if (firebaseUser.email === 'admin@admin.com') {
              console.log('Auto-creating admin document...');
              const adminData = {
                name: 'Admin User',
                email: 'admin@admin.com',
                role: 'admin' as const,
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), adminData);
              setUser({
                id: firebaseUser.uid,
                ...adminData
              });
            } else {
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await apiService.forgotPassword(email);
    } catch (error: any) {
      console.error('Forgot password error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await apiService.resetPassword(token, newPassword);
    } catch (error: any) {
      console.error('Reset password error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        setUser: updateUser,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
