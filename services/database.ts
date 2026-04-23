/**
 * Firestore Database Service
 * Handles all database operations for the University Clearance System
 */

import {
    Clearance,
    ClearanceStatus,
    StaffRole,
    StudentClearance,
    User
} from '@/types';
import { db } from '@/utils/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where
} from 'firebase/firestore';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  CLEARANCES: 'clearances',
  STAFF_ROLES: 'staffRoles',
  STUDENT_CLEARANCES: 'studentClearances',
};

// ==================== USER OPERATIONS ====================

export const userService = {
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User | null> {
    const docRef = doc(db, COLLECTIONS.USERS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  },

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return null;
  },

  /**
   * Get users by role
   */
  async getByRole(role: string): Promise<User[]> {
    const q = query(collection(db, COLLECTIONS.USERS), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  },

  /**
   * Create user
   */
  async create(user: Omit<User, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...user,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  /**
   * Update user
   */
  async update(id: string, data: Partial<User>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, id);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, id);
    await deleteDoc(docRef);
  },
};

// ==================== STAFF ROLE OPERATIONS ====================

export const staffRoleService = {
  /**
   * Get all staff roles
   */
  async getAll(): Promise<StaffRole[]> {
    const q = query(collection(db, COLLECTIONS.STAFF_ROLES), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffRole));
  },

  /**
   * Get staff role by ID
   */
  async getById(id: string): Promise<StaffRole | null> {
    const docRef = doc(db, COLLECTIONS.STAFF_ROLES, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as StaffRole;
    }
    return null;
  },

  /**
   * Create staff role
   */
  async create(name: string, description: string): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.STAFF_ROLES), {
      name,
      description,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  /**
   * Update staff role
   */
  async update(id: string, name: string, description: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.STAFF_ROLES, id);
    await updateDoc(docRef, { name, description, updatedAt: new Date().toISOString() });
  },

  /**
   * Delete staff role
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.STAFF_ROLES, id);
    await deleteDoc(docRef);
  },
};

// ==================== CLEARANCE OPERATIONS ====================

export const clearanceService = {
  /**
   * Get all clearances
   */
  async getAll(): Promise<Clearance[]> {
    const q = query(collection(db, COLLECTIONS.CLEARANCES), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Clearance));
  },

  /**
   * Get clearance by ID
   */
  async getById(id: string): Promise<Clearance | null> {
    const docRef = doc(db, COLLECTIONS.CLEARANCES, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Clearance;
    }
    return null;
  },

  /**
   * Get clearances by department
   */
  async getByDepartment(department: string): Promise<Clearance[]> {
    const q = query(
      collection(db, COLLECTIONS.CLEARANCES),
      where('departmentsAllowed', 'array-contains', department)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Clearance));
  },

  /**
   * Create clearance
   */
  async create(clearance: Omit<Clearance, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.CLEARANCES), {
      ...clearance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  /**
   * Update clearance
   */
  async update(id: string, data: Partial<Clearance>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CLEARANCES, id);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  },

  /**
   * Delete clearance
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CLEARANCES, id);
    await deleteDoc(docRef);
  },
};

// ==================== STUDENT CLEARANCE OPERATIONS ====================

export const studentClearanceService = {
  /**
   * Get all student clearances
   */
  async getAll(): Promise<StudentClearance[]> {
    const q = query(collection(db, COLLECTIONS.STUDENT_CLEARANCES), orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentClearance));
  },

  /**
   * Get student clearance by ID
   */
  async getById(id: string): Promise<StudentClearance | null> {
    const docRef = doc(db, COLLECTIONS.STUDENT_CLEARANCES, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as StudentClearance;
    }
    return null;
  },

  /**
   * Get student clearances by student ID
   */
  async getByStudentId(studentId: string): Promise<StudentClearance[]> {
    const q = query(
      collection(db, COLLECTIONS.STUDENT_CLEARANCES), 
      where('studentId', '==', studentId),
      orderBy('submittedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentClearance));
  },

  /**
   * Get pending clearances for a staff member
   */
  async getPendingForStaff(staffRole: string): Promise<StudentClearance[]> {
    const allClearances = await this.getAll();
    return allClearances.filter(sc => 
      sc.parts.some(part => part.staffRole === staffRole && part.status === 'pending')
    );
  },

  /**
   * Submit a new student clearance
   */
  async submit(studentId: string, clearanceId: string, clearance: Clearance): Promise<string> {
    const parts = clearance.parts.map(part => ({
      ...part,
      status: 'pending' as ClearanceStatus,
    }));

    const docRef = await addDoc(collection(db, COLLECTIONS.STUDENT_CLEARANCES), {
      studentId,
      clearanceId,
      clearance,
      parts,
      submittedAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  /**
   * Approve a clearance part
   */
  async approvePart(studentClearanceId: string, partId: string, staffId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.STUDENT_CLEARANCES, studentClearanceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as StudentClearance;
      const updatedParts = data.parts.map(part => {
        if (part.id === partId) {
          return {
            ...part,
            status: 'approved' as ClearanceStatus,
            approvedBy: staffId,
            approvedAt: new Date().toISOString(),
          };
        }
        return part;
      });

      // Check if all parts are approved
      const allApproved = updatedParts.every(p => p.status === 'approved');
      
      await updateDoc(docRef, {
        parts: updatedParts,
        completedAt: allApproved ? new Date().toISOString() : null,
      });
    }
  },

  /**
   * Reject a clearance part
   */
  async rejectPart(studentClearanceId: string, partId: string, staffId: string, remarks: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.STUDENT_CLEARANCES, studentClearanceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as StudentClearance;
      const updatedParts = data.parts.map(part => {
        if (part.id === partId) {
          return {
            ...part,
            status: 'rejected' as ClearanceStatus,
            approvedBy: staffId,
            approvedAt: new Date().toISOString(),
            remarks,
          };
        }
        return part;
      });

      await updateDoc(docRef, { parts: updatedParts });
    }
  },

  /**
   * Delete student clearance
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.STUDENT_CLEARANCES, id);
    await deleteDoc(docRef);
  },
};