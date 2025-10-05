import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { FirebaseGallery, FirebaseImage, FirebaseDocument, FirebaseFolder, FirebaseTag } from '../types/firebase';

// Gallery Services
export const galleryService = {
  // Create new gallery
  async createGallery(userId: string, name: string, description: string = '', type: 'references' | 'art' = 'references', tags: string[] = []): Promise<string> {
    try {
      const galleryData: Omit<FirebaseGallery, 'id'> = {
        name,
        description,
        userId,
        type,
        images: [],
        tags,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isPublic: false
      };

      const docRef = await addDoc(collection(db, 'galleries'), galleryData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating gallery:', error);
      throw error;
    }
  },

  // Get user's galleries
  async getUserGalleries(userId: string, type?: 'references' | 'art'): Promise<FirebaseGallery[]> {
    try {
      let q;
      if (type) {
        q = query(
            collection(db, 'galleries'),
            where('userId', '==', userId),
            where('type', '==', type),
            orderBy('updatedAt', 'desc')
        );
      } else {
        q = query(
            collection(db, 'galleries'),
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
        );
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseGallery));
    } catch (error) {
      console.error('Error getting galleries:', error);
      return [];
    }
  },

  // Update gallery
  async updateGallery(galleryId: string, updates: Partial<FirebaseGallery>): Promise<void> {
    try {
      const galleryRef = doc(db, 'galleries', galleryId);
      await updateDoc(galleryRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating gallery:', error);
      throw error;
    }
  },

  // Delete gallery
  async deleteGallery(galleryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'galleries', galleryId));
    } catch (error) {
      console.error('Error deleting gallery:', error);
      throw error;
    }
  },

  // Upload image to gallery
  async uploadImage(galleryId: string, userId: string, file: File, tags: string[] = []): Promise<FirebaseImage> {
    try {
      // Upload file to Storage
      const storageRef = ref(storage, `galleries/${galleryId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Create image data with all required fields
      const imageData: FirebaseImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        downloadURL: downloadURL,
        storageRef: snapshot.ref.fullPath,
        size: file.size,
        type: file.type,
        galleryId: galleryId,
        userId: userId,
        tags: tags,
        uploadedAt: Timestamp.now()
      };

      // Update gallery with new image
      const galleryRef = doc(db, 'galleries', galleryId);
      const galleryDoc = await getDoc(galleryRef);

      if (galleryDoc.exists()) {
        const galleryData = galleryDoc.data() as FirebaseGallery;
        const updatedImages = [...galleryData.images, imageData];

        await updateDoc(galleryRef, {
          images: updatedImages,
          updatedAt: Timestamp.now()
        });
      }

      return imageData;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Remove image from gallery
  async removeImage(galleryId: string, imageId: string): Promise<void> {
    try {
      const galleryRef = doc(db, 'galleries', galleryId);
      const galleryDoc = await getDoc(galleryRef);

      if (galleryDoc.exists()) {
        const galleryData = galleryDoc.data() as FirebaseGallery;
        const image = galleryData.images.find(img => img.id === imageId);

        if (image) {
          // Delete from Storage
          const imageRef = ref(storage, image.storageRef);
          await deleteObject(imageRef);

          // Remove from gallery
          const updatedImages = galleryData.images.filter(img => img.id !== imageId);
          await updateDoc(galleryRef, {
            images: updatedImages,
            updatedAt: Timestamp.now()
          });
        }
      }
    } catch (error) {
      console.error('Error removing image:', error);
      throw error;
    }
  },

  // Update image tags
  async updateImageTags(galleryId: string, imageId: string, tags: string[]): Promise<void> {
    try {
      const galleryRef = doc(db, 'galleries', galleryId);
      const galleryDoc = await getDoc(galleryRef);

      if (galleryDoc.exists()) {
        const galleryData = galleryDoc.data() as FirebaseGallery;
        const updatedImages = galleryData.images.map(img =>
            img.id === imageId ? { ...img, tags } : img
        );

        await updateDoc(galleryRef, {
          images: updatedImages,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error updating image tags:', error);
      throw error;
    }
  }
};

// Document Services
export const documentService = {
  // Create new folder
  async createFolder(userId: string, name: string, description: string = '', tags: string[] = []): Promise<string> {
    try {
      const folderData: Omit<FirebaseFolder, 'id'> = {
        name,
        description,
        userId,
        documents: [],
        tags,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'folders'), folderData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  // Get user's folders
  async getUserFolders(userId: string): Promise<FirebaseFolder[]> {
    try {
      const q = query(
          collection(db, 'folders'),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseFolder));
    } catch (error) {
      console.error('Error getting folders:', error);
      return [];
    }
  },

  // Upload document
  async uploadDocument(userId: string, file: File, folderId?: string, tags: string[] = []): Promise<string> {
    try {
      // Upload file to Storage
      const storageRef = ref(storage, `documents/${userId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Create document data with all required fields
      const documentData: Omit<FirebaseDocument, 'id'> = {
        name: file.name,
        downloadURL: downloadURL,
        storageRef: snapshot.ref.fullPath,
        size: file.size,
        type: file.type,
        folderId,
        userId,
        tags: tags,
        uploadedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'documents'), documentData);

      // If folder specified, add document to folder
      if (folderId) {
        const folderRef = doc(db, 'folders', folderId);
        const folderDoc = await getDoc(folderRef);

        if (folderDoc.exists()) {
          const folderData = folderDoc.data() as FirebaseFolder;
          const updatedDocuments = [...folderData.documents, docRef.id];

          await updateDoc(folderRef, {
            documents: updatedDocuments,
            updatedAt: Timestamp.now()
          });
        }
      }

      return docRef.id;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Get user's documents
  async getUserDocuments(userId: string): Promise<FirebaseDocument[]> {
    try {
      const q = query(
          collection(db, 'documents'),
          where('userId', '==', userId),
          orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseDocument));
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  },

  // Update document tags
  async updateDocumentTags(documentId: string, tags: string[]): Promise<void> {
    try {
      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, { tags });
    } catch (error) {
      console.error('Error updating document tags:', error);
      throw error;
    }
  },

  // Delete document
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const docRef = doc(db, 'documents', documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data() as FirebaseDocument;

        // Delete from Storage
        const storageRef = ref(storage, docData.storageRef);
        await deleteObject(storageRef);

        // Remove from folder if it belongs to one
        if (docData.folderId) {
          const folderRef = doc(db, 'folders', docData.folderId);
          const folderDoc = await getDoc(folderRef);

          if (folderDoc.exists()) {
            const folderData = folderDoc.data() as FirebaseFolder;
            const updatedDocuments = folderData.documents.filter(id => id !== documentId);

            await updateDoc(folderRef, {
              documents: updatedDocuments,
              updatedAt: Timestamp.now()
            });
          }
        }

        // Delete document from Firestore
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Delete folder
  async deleteFolder(folderId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'folders', folderId));
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  },

  // Update folder
  async updateFolder(folderId: string, updates: Partial<FirebaseFolder>): Promise<void> {
    try {
      const folderRef = doc(db, 'folders', folderId);
      await updateDoc(folderRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  }
};

// Tag Services
export const tagService = {
  // Create tag
  async createTag(userId: string, name: string, color: string): Promise<string> {
    try {
      const tagData: Omit<FirebaseTag, 'id'> = {
        name,
        color,
        userId,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'tags'), tagData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  },

  // Get user's tags
  async getUserTags(userId: string): Promise<FirebaseTag[]> {
    try {
      const q = query(
          collection(db, 'tags'),
          where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const tags = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseTag));

      // Sort locally by creation date (newest first)
      return tags.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  },

  // Update tag
  async updateTag(tagId: string, updates: Partial<Pick<FirebaseTag, 'name' | 'color'>>): Promise<void> {
    try {
      const tagRef = doc(db, 'tags', tagId);
      await updateDoc(tagRef, updates);
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  },

  // Delete tag
  async deleteTag(tagId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tags', tagId));
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }
};

// Recent uploads service
export const recentUploadsService = {
  // Get recent uploads (both images and documents)
  async getRecentUploads(userId: string, limitCount: number = 9): Promise<((FirebaseImage & { galleryType?: 'references' | 'art' }) | FirebaseDocument)[]> {
    try {
      // Get recent documents
      const documentsQuery = query(
          collection(db, 'documents'),
          where('userId', '==', userId),
          orderBy('uploadedAt', 'desc'),
          limit(limitCount)
      );
      const documentsSnapshot = await getDocs(documentsQuery);
      const documents = documentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseDocument));

      // Get recent images from galleries
      const galleriesQuery = query(
          collection(db, 'galleries'),
          where('userId', '==', userId)
      );
      const galleriesSnapshot = await getDocs(galleriesQuery);

      const allImages: (FirebaseImage & { galleryType?: 'references' | 'art' })[] = [];
      galleriesSnapshot.docs.forEach(doc => {
        const galleryData = doc.data() as FirebaseGallery;
        // Add gallery type to each image
        const imagesWithType = galleryData.images.map(img => ({
          ...img,
          galleryType: galleryData.type
        }));
        allImages.push(...imagesWithType);
      });

      // Sort all uploads by date and limit
      const allUploads = [...documents, ...allImages];
      allUploads.sort((a, b) => {
        const aTime = 'uploadedAt' in a ? a.uploadedAt : a["uploadedAt"];
        const bTime = 'uploadedAt' in b ? b.uploadedAt : b["uploadedAt"];
        return bTime.toDate().getTime() - aTime.toDate().getTime();
      });

      return allUploads.slice(0, limitCount);
    } catch (error) {
      console.error('Error getting recent uploads:', error);
      return [];
    }
  }
};