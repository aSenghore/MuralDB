import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tagService, galleryService, documentService } from '../services/firebaseService';
import { toast } from 'sonner';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TaggedItem {
  id: string;
  type: 'image' | 'document' | 'gallery' | 'folder';
  tagIds: string[];
}

interface TagContextType {
  tags: Tag[];
  taggedItems: TaggedItem[];
  createTag: (name: string, color: string) => Promise<Tag>;
  deleteTag: (tagId: string) => Promise<void>;
  updateTag: (tagId: string, updates: Partial<Tag>) => Promise<void>;
  addTagToItem: (itemId: string, itemType: 'image' | 'document' | 'gallery' | 'folder', tagId: string) => Promise<void>;
  removeTagFromItem: (itemId: string, tagId: string) => Promise<void>;
  getItemTags: (itemId: string) => Tag[];
  getItemsByTags: (tagIds: string[], itemType?: 'image' | 'document' | 'gallery' | 'folder') => TaggedItem[];
  syncItemTags: (itemId: string, itemType: 'image' | 'document' | 'gallery' | 'folder', tagIds: string[]) => void;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const useTagContext = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTagContext must be used within a TagProvider');
  }
  return context;
};

interface TagProviderProps {
  children: ReactNode;
}

export const TagProvider: React.FC<TagProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [taggedItems, setTaggedItems] = useState<TaggedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tags from Firebase when user logs in
  useEffect(() => {
    if (currentUser) {
      loadTags();
    } else {
      setTags([]);
      setTaggedItems([]);
      setIsLoading(false);
    }
  }, [currentUser]);

  const loadTags = async () => {
    if (!currentUser) return;

    try {
      const userTags = await tagService.getUserTags(currentUser.uid);
      setTags(userTags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
      })));
    } catch (error) {
      console.error('Error loading tags:', error);
      toast.error('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  };

  const createTag = async (name: string, color: string): Promise<Tag> => {
    if (!currentUser) {
      throw new Error('User must be logged in to create tags');
    }

    try {
      const tagId = await tagService.createTag(currentUser.uid, name, color);
      const newTag: Tag = {
        id: tagId,
        name,
        color,
      };
      setTags(prev => [...prev, newTag]);
      toast.success('Tag created successfully!');
      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
      throw error;
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      await tagService.deleteTag(tagId);
      setTags(prev => prev.filter(tag => tag.id !== tagId));
      // Remove tag from all items
      setTaggedItems(prev =>
          prev.map(item => ({
            ...item,
            tagIds: item.tagIds.filter(id => id !== tagId)
          }))
      );
      toast.success('Tag deleted successfully!');
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
      throw error;
    }
  };

  const updateTag = async (tagId: string, updates: Partial<Tag>) => {
    try {
      await tagService.updateTag(tagId, updates);
      setTags(prev =>
          prev.map(tag =>
              tag.id === tagId ? { ...tag, ...updates } : tag
          )
      );
      toast.success('Tag updated successfully!');
    } catch (error) {
      console.error('Error updating tag:', error);
      toast.error('Failed to update tag');
      throw error;
    }
  };

  const addTagToItem = async (itemId: string, itemType: 'image' | 'document' | 'gallery' | 'folder', tagId: string) => {
    // Get current tag array for this item
    const existingItem = taggedItems.find(item => item.id === itemId);
    const currentTagIds = existingItem?.tagIds || [];

    // Check if tag is already added
    if (currentTagIds.includes(tagId)) {
      return;
    }

    const newTagIds = [...currentTagIds, tagId];

    // Update local state first for immediate UI feedback
    setTaggedItems(prev => {
      const item = prev.find(i => i.id === itemId);

      if (item) {
        return prev.map(i =>
            i.id === itemId
                ? { ...i, tagIds: newTagIds }
                : i
        );
      } else {
        return [...prev, { id: itemId, type: itemType, tagIds: newTagIds }];
      }
    });

    // Save to Firebase based on item type
    try {
      if (itemType === 'image') {
        // For images, we need to find the gallery and update
        // This will be handled by the GalleryDetail component calling galleryService.updateImageTags
      } else if (itemType === 'document') {
        await documentService.updateDocumentTags(itemId, newTagIds);
      } else if (itemType === 'gallery') {
        await galleryService.updateGallery(itemId, { tags: newTagIds });
      } else if (itemType === 'folder') {
        await documentService.updateFolder(itemId, { tags: newTagIds });
      }
    } catch (error) {
      console.error('Error saving tag to item:', error);
      // Revert local state on error
      setTaggedItems(prev =>
          prev.map(item =>
              item.id === itemId
                  ? { ...item, tagIds: currentTagIds }
                  : item
          )
      );
      toast.error('Failed to add tag');
    }
  };

  const removeTagFromItem = async (itemId: string, tagId: string) => {
    // Find the item to get its type
    const item = taggedItems.find(i => i.id === itemId);
    if (!item) return;

    // Update local state first for immediate UI feedback
    setTaggedItems(prev =>
        prev.map(item =>
            item.id === itemId
                ? { ...item, tagIds: item.tagIds.filter(id => id !== tagId) }
                : item
        )
    );

    // Get updated tag array
    const newTagIds = item.tagIds.filter(id => id !== tagId);

    // Save to Firebase based on item type
    try {
      if (item.type === 'image') {
        // For images, we need to find the gallery and update
        // This will be handled by the GalleryDetail component calling galleryService.updateImageTags
      } else if (item.type === 'document') {
        await documentService.updateDocumentTags(itemId, newTagIds);
      } else if (item.type === 'gallery') {
        await galleryService.updateGallery(itemId, { tags: newTagIds });
      } else if (item.type === 'folder') {
        await documentService.updateFolder(itemId, { tags: newTagIds });
      }
    } catch (error) {
      console.error('Error removing tag from item:', error);
      // Revert local state on error
      setTaggedItems(prev =>
          prev.map(item =>
              item.id === itemId
                  ? { ...item, tagIds: [...item.tagIds, tagId] }
                  : item
          )
      );
      toast.error('Failed to remove tag');
    }
  };

  const getItemTags = (itemId: string): Tag[] => {
    const taggedItem = taggedItems.find(item => item.id === itemId);
    if (!taggedItem) return [];

    return tags.filter(tag => taggedItem.tagIds.includes(tag.id));
  };

  const getItemsByTags = (tagIds: string[], itemType?: 'image' | 'document' | 'gallery' | 'folder'): TaggedItem[] => {
    if (tagIds.length === 0) {
      return itemType ? taggedItems.filter(item => item.type === itemType) : taggedItems;
    }

    return taggedItems.filter(item => {
      const matchesType = !itemType || item.type === itemType;
      const hasAllTags = tagIds.every(tagId => item.tagIds.includes(tagId));
      return matchesType && hasAllTags;
    });
  };

  // Sync item tags from Firebase data (used when loading galleries, folders, documents)
  const syncItemTags = (itemId: string, itemType: 'image' | 'document' | 'gallery' | 'folder', tagIds: string[]) => {
    setTaggedItems(prev => {
      const existingItem = prev.find(item => item.id === itemId);

      if (existingItem) {
        // Update existing item
        return prev.map(item =>
            item.id === itemId
                ? { ...item, type: itemType, tagIds }
                : item
        );
      } else {
        // Add new item
        return [...prev, { id: itemId, type: itemType, tagIds }];
      }
    });
  };

  return (
      <TagContext.Provider
          value={{
            tags,
            taggedItems,
            createTag,
            deleteTag,
            updateTag,
            addTagToItem,
            removeTagFromItem,
            getItemTags,
            getItemsByTags,
            syncItemTags,
          }}
      >
        {children}
      </TagContext.Provider>
  );
};