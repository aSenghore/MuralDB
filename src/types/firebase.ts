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
  images: FirebaseImage[];
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
}

export interface FirebaseImage {
  id: string;
  name: string;
  url: string;
  storageRef: string;
  size: number;
  type: string;
  tags: string[];
  uploadedAt: Timestamp;
}

export interface FirebaseDocument {
  id: string;
  name: string;
  url: string;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseTag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Timestamp;
}