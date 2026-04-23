# Firebase Database Setup

This document explains how to set up and use Firebase Firestore for the University Clearance System.

## Prerequisites

1. **Firebase Project**: Create a project at [firebase.google.com](https://firebase.google.com)
2. **Firestore Database**: Enable Cloud Firestore in Firebase Console
3. **Authentication**: Enable Email/Password authentication
4. **Service Account Key**: Download from Firebase Console → Project Settings → Service Accounts → Generate New Private Key

## Setup Steps

### Step 1: Configure Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Scroll to **Service Accounts**
5. Click **Generate New Private Key**
6. Save the JSON file as `scripts/serviceAccountKey.json`

### Step 2: Update Firebase Config

The Firebase config in `utils/firebase.ts` is already configured for your project:
- Project ID: `crud-c1d90`
- Auth Domain: `crud-c1d90.firebaseapp.com`

If you need to update it, edit `utils/firebase.ts`.

### Step 3: Initialize Database

Run the setup script to seed Firestore with initial data:

```bash
node scripts/setup-firebase.js
```

This will create:
- **staffRoles** collection with 4 roles (IT Office, Registrar, Library, Finance)
- **clearances** collection with 2 clearance types (IT Clearance, Graduation Clearance)
- **users** collection with sample users (1 admin, 4 staff, 3 students)
- **studentClearances** collection with sample submissions

### Step 4: Configure Security Rules

In Firebase Console → Firestore Database → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Staff can read all, write their own approvals
    match /studentClearances/{clearanceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.token.role == 'student';
      allow update: if request.auth != null;
    }
    
    // Admin can manage all collections
    match /{collection}/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

## Database Service

The app uses `services/database.ts` which provides:

- **userService**: CRUD operations for users
- **staffRoleService**: CRUD operations for staff roles
- **clearanceService**: CRUD operations for clearances
- **studentClearanceService**: Student clearance submissions, approvals, rejections

## Collections Structure

### users
```
{
  id: string,
  name: string,
  email: string,
  role: 'admin' | 'staff' | 'student',
  department?: string,
  staffRole?: string,
  createdAt: string
}
```

### staffRoles
```
{
  id: string,
  name: string,
  description: string,
  createdAt: string
}
```

### clearances
```
{
  id: string,
  name: string,
  description: string,
  parts: [{
    id: string,
    name: string,
    staffRole: string,
    status: 'pending'
  }],
  departmentsAllowed: string[],
  createdAt: string,
  updatedAt: string
}
```

### studentClearances
```
{
  id: string,
  studentId: string,
  clearanceId: string,
  clearance: Clearance,
  parts: ClearancePart[],
  submittedAt: string,
  completedAt?: string
}
```

## Switching Between Mock and Real Data

Currently the app uses mock data from `data/mockData.ts`. To switch to Firebase:

1. Update `context/AppContext.tsx` to use `services/database.ts`
2. Update `context/AuthContext.tsx` to use Firebase Authentication

## Troubleshooting

### Permission Denied Errors
- Ensure Firestore security rules allow your operations
- Check that you're authenticated

### Collection Not Found
- Run `node scripts/setup-firebase.js` to create collections
- Ensure your service account key is valid

### Data Not Loading
- Check Firebase Console to verify data exists
- Check browser console for errors