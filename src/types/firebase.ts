import { Timestamp } from 'firebase/firestore';

export interface FirebaseUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  screenName: string;
  profilePicture?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseGallery {
  id: string;
  name: string;
  description: string;
  userId: string;
  type: 'references' | 'art'; // Add type to distinguish gallery types
  images: FirebaseImage[];
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
  pinned?: boolean;
  pinnedOrder?: number; // 0, 1, 2 for up to 3 pinned items
}

export interface FirebaseImage {
  id: string;
  name: string;
  downloadURL: string; // Changed from 'url' to 'downloadURL'
  storageRef: string;
  size: number;
  type: string;
  galleryId: string; // Add galleryId reference
  userId: string; // Add userId
  tags: string[];
  uploadedAt: Timestamp;
}

export interface FirebaseDocument {
  id: string;
  name: string;
  downloadURL: string; // Changed from 'url' to 'downloadURL'
  storageRef: string;
  size: number;
  type: string;
  folderId?: string;
  userId: string;
  tags: string[];
  uploadedAt: Timestamp;
}

export interface FirebaseFolder {
  id: string;
  name: string;
  description?: string;
  userId: string;
  documents: string[]; // Document IDs
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  pinned?: boolean;
  pinnedOrder?: number; // 0, 1, 2 for up to 3 pinned items
}

export interface FirebaseTag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Timestamp;
}