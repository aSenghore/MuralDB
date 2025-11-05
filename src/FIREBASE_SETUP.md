# 🔥 Firebase Setup Instructions for MuralDB

> **⚠️ IMPORTANT:** After completing the initial setup, you MUST update the Firestore and Storage security rules as shown in Step 8 below. The showcase pin and bookmarks features will not work without these updated rules.

> **📝 NOTE FOR EXISTING USERS:** If you already have images uploaded, see `STORAGE_PATH_UPDATE.md` for important information about the storage path structure update.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `muraldb` (or your preferred name)
4. Follow the setup wizard

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** authentication
5. Save settings

## Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Test mode** for now (you can secure it later)
4. Select your preferred region
5. Click **Done**

## Step 4: Set up Storage

1. Go to **Storage**
2. Click **Get started**
3. Choose **Test mode** for now
4. Select your preferred region
5. Click **Done**

## Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click **Web app** icon (`</>`)
4. Register your app with name: `MuralDB`
5. Copy the Firebase configuration object

## Step 6: Update Your Firebase Config

Replace the contents of `/config/firebase.ts` with your actual configuration:

\`\`\`typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replace with YOUR actual Firebase config
const firebaseConfig = {
apiKey: "your-actual-api-key",
authDomain: "your-project.firebaseapp.com",
projectId: "your-actual-project-id",
storageBucket: "your-project.appspot.com",
messagingSenderId: "your-messaging-sender-id",
appId: "your-actual-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
\`\`\`

## Step 7: Install Firebase SDK

Make sure you have Firebase installed in your project:

\`\`\`bash
npm install firebase
\`\`\`

## Step 8: Security Rules ⚠️ REQUIRED

> **CRITICAL:** These security rules are REQUIRED for showcase pins, bookmarks, and public galleries to work properly. Without these rules, you will get "permission-denied" errors.

### Firestore Rules
Go to **Firestore Database > Rules** in Firebase Console and replace the entire content with:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
// Users can only read/write their own data
match /users/{userId} {
allow read, write: if request.auth != null && request.auth.uid == userId;
}

    // Galleries - users can access their own galleries, and anyone can read showcase pinned galleries
    match /galleries/{galleryId} {
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        resource.data.showcasePinned == true
      );
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Documents - users can only access their own
    match /documents/{documentId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Folders - users can access their own folders, and anyone can read showcase pinned folders
    match /folders/{folderId} {
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        resource.data.showcasePinned == true
      );
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Tags - users can only access their own
    match /tags/{tagId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Bookmarks - users can only access their own bookmarks
    match /bookmarks/{bookmarkId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
}
}
\`\`\`

### Storage Rules
Go to **Storage > Rules** in Firebase Console and replace the entire content with:

\`\`\`javascript
rules_version = '2';
service firebase.storage {
match /b/{bucket}/o {
// Galleries - allow authenticated users to read (showcase functionality), but only owners can write
match /galleries/{userId}/{allPaths=**} {
allow read: if request.auth != null;
allow write: if request.auth != null && request.auth.uid == userId;
}

    // Documents - allow authenticated users to read (showcase functionality), but only owners can write
    match /documents/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Profile pictures - anyone can read, but only owner can write
    match /profile-pictures/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
}
}
\`\`\`

## Step 9: Test Your Setup

1. Start your development server
2. Try to sign up with a new account
3. Check Firebase Console to see if:
    - User appears in **Authentication > Users**
    - User document is created in **Firestore Database**

## Troubleshooting Permission Errors

If you're getting "permission-denied" errors, verify the following:

### For Showcase Pin/Unpin Errors:
1. Go to **Firestore Database > Rules** in Firebase Console
2. Verify that galleries and folders have these specific rules:
   ```
   allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
   ```
3. Click **Publish** to apply the rules

### For Bookmark Errors:
1. Ensure the bookmarks collection rule exists:
   ```
   match /bookmarks/{bookmarkId} {
     allow read: if request.auth != null && request.auth.uid == resource.data.userId;
     allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
     allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
   }
   ```

### For Public Gallery/Folder Viewing Errors:
1. Verify galleries and folders allow reading showcase items:
   ```
   allow read: if request.auth != null && (
     request.auth.uid == resource.data.userId ||
     resource.data.showcasePinned == true
   );
   ```
2. Verify Storage rules allow authenticated users to read all files:
   ```
   allow read: if request.auth != null;
   ```

## Firestore Database Structure

Your database will automatically create these collections:

\`\`\`
/users/{userId}
- uid: string
- email: string
- firstName: string
- lastName: string
- screenName: string
- profilePicture?: string
- createdAt: timestamp
- updatedAt: timestamp

/galleries/{galleryId}
- id: string
- name: string
- description: string
- userId: string
- images: array
- tags: array
- createdAt: timestamp
- updatedAt: timestamp
- isPublic: boolean

/documents/{documentId}
- id: string
- name: string
- url: string
- storageRef: string
- size: number
- type: string
- folderId?: string
- userId: string
- tags: array
- uploadedAt: timestamp

/folders/{folderId}
- id: string
- name: string
- description?: string
- userId: string
- documents: array
- createdAt: timestamp
- updatedAt: timestamp

/tags/{tagId}
- id: string
- name: string
- color: string
- userId: string
- createdAt: timestamp
  \`\`\`

## Storage Structure

Files will be organized as:
\`\`\`
/galleries/{userId}/{galleryId}/{timestamp}_{filename}
/documents/{userId}/{timestamp}_{filename}  
/profile-pictures/{userId}
\`\`\`

## What This Firebase Integration Provides

✅ **User Authentication**: Email/password signup and signin with duplicate email prevention
✅ **User Profiles**: Profile data stored in Firestore with profile picture upload
✅ **Gallery Management**: Create, read, update, delete galleries with image uploads
✅ **Document Management**: Upload and organize documents in folders
✅ **File Storage**: Secure file uploads to Firebase Storage
✅ **Data Security**: Users can only access their own data
✅ **Real-time Sync**: Data updates in real-time across sessions
✅ **Offline Support**: Firestore provides offline capabilities

Your MuralDB app is now fully integrated with Firebase! 🎉