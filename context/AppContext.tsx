/**
 * App Context
 * Manages all app data: clearances, staff roles, and student submissions
 */

import { db } from '@/utils/firebase';
import { AppContextType, Clearance, ClearancePart, StaffRole, StudentClearance, User } from '@/types';
import { 
  addDoc, 
  collection, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  updateDoc 
} from 'firebase/firestore';
import React, { createContext, useCallback, useEffect, useState } from 'react';

export const AppContext = createContext<AppContextType>({
  users: [],
  clearances: [],
  staffRoles: [],
  studentClearances: [],
  createStaffRole: () => {},
  updateStaffRole: () => {},
  deleteStaffRole: () => {},
  createClearance: () => {},
  updateClearance: () => {},
  deleteClearance: () => {},
  submitStudentClearance: () => {},
  approveClearancePart: () => {},
  rejectClearancePart: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [clearances, setClearances] = useState<Clearance[]>([]);
  const [staffRoles, setStaffRoles] = useState<StaffRole[]>([]);
  const [studentClearances, setStudentClearances] = useState<StudentClearance[]>([]);

  // Real-time listeners
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });

    const unsubClearances = onSnapshot(collection(db, 'clearances'), (snapshot) => {
      setClearances(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Clearance)));
    });

    const unsubStaffRoles = onSnapshot(collection(db, 'staffRoles'), (snapshot) => {
      setStaffRoles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffRole)));
    });

    const unsubStudentClearances = onSnapshot(collection(db, 'studentClearances'), (snapshot) => {
      setStudentClearances(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentClearance)));
    });

    return () => {
      unsubUsers();
      unsubClearances();
      unsubStaffRoles();
      unsubStudentClearances();
    };
  }, []);

  // Staff Role Management
  const createStaffRole = useCallback(async (name: string, description: string) => {
    try {
      await addDoc(collection(db, 'staffRoles'), {
        name,
        description,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error creating staff role:", error);
      throw error;
    }
  }, []);

  const updateStaffRole = useCallback(async (id: string, name: string, description: string) => {
    try {
      await updateDoc(doc(db, 'staffRoles', id), {
        name,
        description,
      });
    } catch (error) {
      console.error("Error updating staff role:", error);
      throw error;
    }
  }, []);

  const deleteStaffRole = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'staffRoles', id));
    } catch (error) {
      console.error("Error deleting staff role:", error);
      throw error;
    }
  }, []);

  // Clearance Management
  const createClearance = useCallback(
    async (
      name: string,
      description: string,
      staffRole: string,
      departmentsAllowed: string[]
    ) => {
      try {
        await addDoc(collection(db, 'clearances'), {
          name,
          description,
          staffRole,
          departmentsAllowed,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error creating clearance:", error);
        throw error;
      }
    },
    []
  );

  const updateClearance = useCallback(
    async (id: string, name: string, description: string, staffRole: string, departmentsAllowed: string[]) => {
      try {
        await updateDoc(doc(db, 'clearances', id), {
          name,
          description,
          staffRole,
          departmentsAllowed,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error updating clearance:", error);
        throw error;
      }
    },
    []
  );

  const deleteClearance = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'clearances', id));
    } catch (error) {
      console.error("Error deleting clearance:", error);
      throw error;
    }
  }, []);

  // Student Clearance Management
  const submitStudentClearance = useCallback(async (studentId: string, clearanceId: string) => {
    const clearance = clearances.find(c => c.id === clearanceId);
    if (!clearance) return;

    await addDoc(collection(db, 'studentClearances'), {
      studentId,
      clearanceId,
      clearance,
      status: 'pending' as const,
      submittedAt: new Date().toISOString(),
    });
  }, [clearances]);

  const approveClearance = useCallback(
    async (studentClearanceId: string, staffId: string, remarks?: string) => {
      const sc = studentClearances.find(s => s.id === studentClearanceId);
      if (!sc) return;

      const now = new Date().toISOString();

      await updateDoc(doc(db, 'studentClearances', studentClearanceId), {
        status: 'approved' as const,
        remarks: remarks || '',
        approvedBy: staffId,
        approvedAt: now,
        completedAt: now,
      });
    },
    [studentClearances]
  );

  const rejectClearance = useCallback(
    async (studentClearanceId: string, staffId: string, remarks: string) => {
      const sc = studentClearances.find(s => s.id === studentClearanceId);
      if (!sc) return;

      await updateDoc(doc(db, 'studentClearances', studentClearanceId), {
        status: 'rejected' as const,
        remarks,
        approvedBy: staffId,
        approvedAt: new Date().toISOString(),
      });
    },
    [studentClearances]
  );

  return (
    <AppContext.Provider
      value={{
        users,
        clearances,
        staffRoles,
        studentClearances,
        createStaffRole,
        updateStaffRole,
        deleteStaffRole,
        createClearance,
        updateClearance,
        deleteClearance,
        submitStudentClearance,
        approveClearance,
        rejectClearance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook to use app context
export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
