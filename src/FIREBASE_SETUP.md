# 🔥 Firebase Setup Instructions for MuralDB

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

## Step 8: Security Rules (Optional but Recommended)

### Firestore Rules
Go to **Firestore Database > Rules** and replace with:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Galleries - users can only access their own
    match /galleries/{galleryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Documents - users can only access their own
    match /documents/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Folders - users can only access their own
    match /folders/{folderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Tags - users can only access their own
    match /tags/{tagId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
\`\`\`

### Storage Rules
Go to **Storage > Rules** and replace with:

\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload/access their own files
    match /galleries/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /profile-pictures/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
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
/galleries/{userId}/{timestamp}_{filename}
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