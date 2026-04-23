/**
 * Type definitions for the University Clearance System
 */

export type UserRole = 'admin' | 'staff' | 'student';
export type ClearanceStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string; // For students
  staffRole?: string; // For staff (e.g., "IT Office", "Registrar")
}


export interface Clearance {
  id: string;
  name: string;
  description: string;
  staffRole: string; // The single staff role that approves this clearance
  departmentsAllowed: string[]; // Which departments can access this clearance
  createdAt: string;
  updatedAt: string;
}

export interface StudentClearance {
  id: string;
  studentId: string;
  clearanceId: string;
  clearance: Clearance;
  status: ClearanceStatus;
  remarks?: string;
  approvedBy?: string; // ID of staff member who approved/rejected
  approvedAt?: string; // ISO date string
  submittedAt: string;
  completedAt?: string;
}

export interface StaffRole {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

export interface AppContextType {
  users: User[];
  clearances: Clearance[];
  staffRoles: StaffRole[];
  studentClearances: StudentClearance[];
  
  // Staff role management (Admin)
  createStaffRole: (name: string, description: string) => void;
  updateStaffRole: (id: string, name: string, description: string) => void;
  deleteStaffRole: (id: string) => void;
  
  // Clearance management (Admin)
  createClearance: (name: string, description: string, staffRole: string, departmentsAllowed: string[]) => void;
  updateClearance: (id: string, name: string, description: string, staffRole: string, departmentsAllowed: string[]) => void;
  deleteClearance: (id: string) => void;
  
  // Student clearance management
  submitStudentClearance: (studentId: string, clearanceId: string) => void;
  approveClearance: (studentClearanceId: string, staffId: string, remarks?: string) => void;
  rejectClearance: (studentClearanceId: string, staffId: string, remarks: string) => void;
}
