# CRUD Operations Documentation

This document outlines the **CRUD (Create, Read, Update, Delete)** operations currently implemented in the University Clearance System application. The application utilizes Firebase Firestore for its real-time database capabilities, meaning most read operations use `onSnapshot` to automatically update the user interfaces across the app instantaneously when data changes.

## 1. Staff Roles
**Database Collection:** `staffRoles`
**Coverage:** Full CRUD

*   **Create:** Admins can define new staff roles (e.g., "IT Office", "Library") by clicking the "+ Add Role" button in the `AdminStaffRoles` screen.
*   **Read:** Roles are continuously fetched from Firestore and displayed in the Admin Dashboard and the Staff Roles management screen.
*   **Update:** Admins can edit an existing role's name and description using the ✏️ Edit button on the item card. This pre-fills the form with current data and overwrites the existing document upon saving.
*   **Delete:** Admins can permanently remove a staff role from the system using the 🗑️ Delete button on the item card.

## 2. Clearances
**Database Collection:** `clearances`
**Coverage:** Full CRUD

*   **Create:** Admins can create overarching clearance flows (e.g., "Graduation Clearance") via the `AdminClearances` screen. This includes adding multiple "parts" (steps) and assigning each part to a specific Staff Role.
*   **Read:** Clearances are visible to Admins on the Dashboard and Management screens. Students can view available clearances assigned to their specific department on their Student Dashboard.
*   **Update:** Admins can update the name, description, and individual parts (including assigned roles) using the ✏️ Edit button. 
*   **Delete:** Admins can completely delete a clearance configuration using the 🗑️ Delete button.

## 3. Student Clearances (Submissions)
**Database Collection:** `studentClearances`
**Coverage:** Partial CRUD (Intentionally lacks Delete)

*   **Create:** Students initiate a new clearance request from their dashboard (`StudentSubmitScreen`). This copies the clearance structure and creates a new document with an initial "pending" status for all parts.
*   **Read:**
    *   **Students:** Can view their submitted clearances and track the real-time progress, including seeing which staff members have approved or rejected specific parts.
    *   **Staff:** Can view all pending and cleared requests assigned to their specific role.
    *   **Admins:** Have a global view of all students and their overall progress percentages across all active submissions.
*   **Update:** Staff handle updates by interacting with specific parts of a student's clearance:
    *   **Approve:** Marks the part as 'approved' and stamps it with an `approvedAt` timestamp (`StaffApproveScreen`).
    *   **Reject:** Marks the part as 'rejected' and requires the staff member to input remarks explaining the rejection (`StaffRejectScreen`).
*   **Delete:** Clearance history serves as an official academic record and is not meant to be deleted through the standard UI by users or admins.

## 4. Users
**Database Collection:** `users`
**Coverage:** Partial CRUD

*   **Create:** Automatically created the first time a user successfully authenticates, pulling basic data. Custom accounts (like the `admin@admin.com` account) auto-generate their own initial user documents upon first login if they are missing.
*   **Read:** The authentication state actively syncs with the `users` document to manage the current user's role (Admin, Staff, or Student). Admins can also read all student records in the `AdminStudents` screen.
*   **Update:** Real-time role and session tracking is maintained via Firebase Auth context listeners.
*   **Delete:** Handled directly in the Firebase Console rather than through the application UI to prevent accidental lockout.

---
*Generated based on application state as of April 2026.*
