# 🚨 URGENT: Firebase Rules Update Required

## Quick Fix for Permission Errors

You're seeing permission errors because the Firebase security rules need to be updated to support the new showcase pins and bookmarks features.

## Step 1: Update Firestore Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your MuralDB project
3. Navigate to **Firestore Database > Rules**
4. **Replace ALL content** with the code below
5. Click **Publish**

```
javascript
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
```

## Step 2: Update Storage Rules

1. In Firebase Console, navigate to **Storage > Rules**
2. **Replace ALL content** with the code below
3. Click **Publish**

```
javascript
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
```

## What These Rules Do

### Firestore Rules:
- **Galleries & Folders**: Owners can read/write their own items. Everyone can READ showcase-pinned items (but not modify them)
- **Documents & Tags**: Private to each user
- **Bookmarks**: Each user can only read/write their own bookmarks
- **Users**: Each user can only read/write their own profile data

### Storage Rules:
- **Galleries & Documents**: Any authenticated user can read files (needed for showcase viewing), but only the owner can upload/delete. Files are organized by userId first for proper permissions.
- **Profile Pictures**: Any authenticated user can view profile pictures, but only owners can upload their own

### Storage Structure:
```
/galleries/{userId}/{galleryId}/{timestamp}_{filename}
/documents/{userId}/{timestamp}_{filename}
/profile-pictures/{userId}
```

## After Updating

1. Refresh your MuralDB app
2. Try the showcase pin feature - it should work now
3. Try the public galleries page - you should see other users' showcase items
4. Try the bookmarks feature - you should be able to bookmark and unbookmark items

## Still Having Issues?

Make sure you clicked **Publish** after pasting the rules in both Firestore and Storage sections!
