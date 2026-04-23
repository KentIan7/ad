/**
 * Mock data for the University Clearance System
 */

import { Clearance, StaffRole, StudentClearance, User } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'admin1',
    name: 'John Administrator',
    email: 'admin@university.edu',
    role: 'admin',
  },
  {
    id: 'staff1',
    name: 'Alice IT Officer',
    email: 'alice@university.edu',
    role: 'staff',
    staffRole: 'IT Office',
  },
  {
    id: 'staff2',
    name: 'Bob Registrar',
    email: 'bob@university.edu',
    role: 'staff',
    staffRole: 'Registrar',
  },
  {
    id: 'staff3',
    name: 'Carol Librarian',
    email: 'carol@university.edu',
    role: 'staff',
    staffRole: 'Library',
  },
  {
    id: 'student1',
    name: 'Emma Johnson',
    email: 'emma@university.edu',
    role: 'student',
    department: 'Computer Science',
  },
  {
    id: 'student2',
    name: 'David Smith',
    email: 'david@university.edu',
    role: 'student',
    department: 'Engineering',
  },
  {
    id: 'student3',
    name: 'Sophia Williams',
    email: 'sophia@university.edu',
    role: 'student',
    department: 'Business Administration',
  },
];

// Mock Staff Roles
export const mockStaffRoles: StaffRole[] = [
  {
    id: 'role1',
    name: 'IT Office',
    description: 'Responsible for IT clearances and system access',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role2',
    name: 'Registrar',
    description: 'Handles academic records and registration clearances',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role3',
    name: 'Library',
    description: 'Manages library clearances and book returns',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role4',
    name: 'Finance',
    description: 'Handles fee clearances and financial obligations',
    createdAt: new Date().toISOString(),
  },
];

// Mock Clearances
export const mockClearances: Clearance[] = [
  {
    id: 'clearance1',
    name: 'IT Clearance',
    description: 'Required for IT system access and email account',
    parts: [
      {
        id: 'part1',
        name: 'IT Equipment Check',
        staffRole: 'IT Office',
        status: 'pending',
      },
    ],
    departmentsAllowed: ['Computer Science', 'Engineering'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'clearance2',
    name: 'Academic Clearance',
    description: 'Required for graduation and transcript issuance',
    parts: [
      {
        id: 'part2',
        name: 'Academic Records Review',
        staffRole: 'Registrar',
        status: 'pending',
      },
      {
        id: 'part3',
        name: 'Grade Verification',
        staffRole: 'Registrar',
        status: 'pending',
      },
    ],
    departmentsAllowed: ['Computer Science', 'Engineering', 'Business Administration'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'clearance3',
    name: 'Library Clearance',
    description: 'Verify all library books have been returned',
    parts: [
      {
        id: 'part4',
        name: 'Book Return Verification',
        staffRole: 'Library',
        status: 'pending',
      },
    ],
    departmentsAllowed: ['Computer Science', 'Engineering', 'Business Administration'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'clearance4',
    name: 'Financial Clearance',
    description: 'Confirm all fees and fines have been paid',
    parts: [
      {
        id: 'part5',
        name: 'Fee Payment Verification',
        staffRole: 'Finance',
        status: 'pending',
      },
      {
        id: 'part6',
        name: 'Fine Settlement Check',
        staffRole: 'Finance',
        status: 'pending',
      },
    ],
    departmentsAllowed: ['Computer Science', 'Engineering', 'Business Administration'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Student Clearances (some submitted, some with approvals)
export const mockStudentClearances: StudentClearance[] = [
  {
    id: 'sclearance1',
    studentId: 'student1',
    clearanceId: 'clearance1',
    clearance: mockClearances[0],
    parts: [
      {
        id: 'part1',
        name: 'IT Equipment Check',
        staffRole: 'IT Office',
        status: 'approved',
        remarks: 'All equipment checked and configured',
        approvedBy: 'staff1',
        approvedAt: new Date().toISOString(),
      },
    ],
    submittedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    completedAt: new Date().toISOString(),
  },
  {
    id: 'sclearance2',
    studentId: 'student1',
    clearanceId: 'clearance2',
    clearance: mockClearances[1],
    parts: [
      {
        id: 'part2',
        name: 'Academic Records Review',
        staffRole: 'Registrar',
        status: 'approved',
        remarks: 'Records verified',
        approvedBy: 'staff2',
        approvedAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: 'part3',
        name: 'Grade Verification',
        staffRole: 'Registrar',
        status: 'pending',
      },
    ],
    submittedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: 'sclearance3',
    studentId: 'student2',
    clearanceId: 'clearance3',
    clearance: mockClearances[2],
    parts: [
      {
        id: 'part4',
        name: 'Book Return Verification',
        staffRole: 'Library',
        status: 'rejected',
        remarks: 'You still have 3 books checked out. Please return them first.',
        approvedBy: 'staff3',
        approvedAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    submittedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];
