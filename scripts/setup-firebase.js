/**
 * Firebase Database Setup Script
 * Run this script to initialize Firestore with seed data
 * 
 * Usage: node scripts/setup-firebase.js
 * 
 * Prerequisites:
 * 1. Install Firebase Admin: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Save as: serviceAccountKey.json in the scripts folder
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Seed Data
const staffRoles = [
  {
    id: 'role_it',
    name: 'IT Office',
    description: 'Responsible for IT clearances and system access',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role_registrar',
    name: 'Registrar',
    description: 'Handles academic records and registration clearances',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role_library',
    name: 'Library',
    description: 'Manages library clearances and book returns',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role_finance',
    name: 'Finance',
    description: 'Handles fee clearances and financial obligations',
    createdAt: new Date().toISOString(),
  },
];

const clearances = [
  {
    id: 'clearance_it',
    name: 'IT Clearance',
    description: 'Required for IT system access and email account',
    parts: [
      {
        id: 'part_it_equipment',
        name: 'IT Equipment Check',
        staffRole: 'IT Office',
        status: 'pending',
      },
      {
        id: 'part_email_access',
        name: 'Email Account Setup',
        staffRole: 'IT Office',
        status: 'pending',
      },
    ],
    departmentsAllowed: ['Computer Science', 'Engineering', 'Business Administration'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'clearance_graduation',
    name: 'Graduation Clearance',
    description: 'Required for graduation eligibility',
    parts: [
      {
        id: 'part_academic',
        name: 'Academic Records',
        staffRole: 'Registrar',
        status: 'pending',
      },
      {
        id: 'part_library_clearance',
        name: 'Library Clearance',
        staffRole: 'Library',
        status: 'pending',
      },
      {
        id: 'part_finance_clearance',
        name: 'Finance Clearance',
        staffRole: 'Finance',
        status: 'pending',
      },
    ],
    departmentsAllowed: ['Computer Science', 'Engineering', 'Business Administration'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const users = [
  {
    id: 'admin1',
    name: 'John Administrator',
    email: 'admin@university.edu',
    role: 'admin',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff_it',
    name: 'Alice IT Officer',
    email: 'alice@university.edu',
    role: 'staff',
    staffRole: 'IT Office',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff_registrar',
    name: 'Bob Registrar',
    email: 'bob@university.edu',
    role: 'staff',
    staffRole: 'Registrar',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff_library',
    name: 'Carol Librarian',
    email: 'carol@university.edu',
    role: 'staff',
    staffRole: 'Library',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff_finance',
    name: 'David Finance',
    email: 'david@university.edu',
    role: 'staff',
    staffRole: 'Finance',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'student1',
    name: 'Emma Johnson',
    email: 'emma@university.edu',
    role: 'student',
    department: 'Computer Science',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'student2',
    name: 'David Smith',
    email: 'david.student@university.edu',
    role: 'student',
    department: 'Engineering',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'student3',
    name: 'Sophia Williams',
    email: 'sophia@university.edu',
    role: 'student',
    department: 'Business Administration',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  },
];

async function setupDatabase() {
  console.log('🚀 Starting Firebase Database Setup...\n');

  try {
    // Setup Staff Roles
    console.log('📁 Creating staffRoles collection...');
    const staffRolesRef = db.collection('staffRoles');
    for (const role of staffRoles) {
      await staffRolesRef.doc(role.id).set(role);
      console.log(`   ✓ Created staff role: ${role.name}`);
    }

    // Setup Clearances
    console.log('\n📁 Creating clearances collection...');
    const clearancesRef = db.collection('clearances');
    for (const clearance of clearances) {
      await clearancesRef.doc(clearance.id).set(clearance);
      console.log(`   ✓ Created clearance: ${clearance.name}`);
    }

    // Setup Users
    console.log('\n📁 Creating users collection...');
    const usersRef = db.collection('users');
    for (const user of users) {
      await usersRef.doc(user.id).set(user);
      console.log(`   ✓ Created user: ${user.email} (${user.role})`);
    }

    // Setup Student Clearances (sample data)
    console.log('\n📁 Creating studentClearances collection...');
    const studentClearancesRef = db.collection('studentClearances');
    
    const sampleStudentClearances = [
      {
        id: 'sc_1',
        studentId: 'student1',
        clearanceId: 'clearance_it',
        clearance: clearances[0],
        parts: clearances[0].parts.map(part => ({
          ...part,
          status: 'pending',
        })),
        submittedAt: new Date().toISOString(),
      },
      {
        id: 'sc_2',
        studentId: 'student1',
        clearanceId: 'clearance_graduation',
        clearance: clearances[1],
        parts: clearances[1].parts.map(part => ({
          ...part,
          status: 'pending',
        })),
        submittedAt: new Date().toISOString(),
      },
    ];

    for (const sc of sampleStudentClearances) {
      await studentClearancesRef.doc(sc.id).set(sc);
      console.log(`   ✓ Created student clearance: ${sc.id}`);
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Set up Firebase Authentication (enable Email/Password)');
    console.log('   2. Configure Firestore security rules');
    console.log('   3. Update app to use real Firebase data');

  } catch (error) {
    console.error('\n❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();