import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TaggedItem {
  id: string;
  type: 'image' | 'document';
  tagIds: string[];
}

interface TagContextType {
  tags: Tag[];
  taggedItems: TaggedItem[];
  createTag: (name: string, color: string) => Tag;
  deleteTag: (tagId: string) => void;
  updateTag: (tagId: string, updates: Partial<Tag>) => void;
  addTagToItem: (itemId: string, itemType: 'image' | 'document', tagId: string) => void;
  removeTagFromItem: (itemId: string, tagId: string) => void;
  getItemTags: (itemId: string) => Tag[];
  getItemsByTags: (tagIds: string[], itemType?: 'image' | 'document') => TaggedItem[];
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
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: 'Important', color: '#ef4444' },
    { id: '2', name: 'Work', color: '#3b82f6' },
    { id: '3', name: 'Personal', color: '#22c55e' },
  ]);
  
  const [taggedItems, setTaggedItems] = useState<TaggedItem[]>([]);

  const createTag = (name: string, color: string): Tag => {
    const newTag: Tag = {
      id: Date.now().toString(),
      name,
      color,
    };
    setTags(prev => [...prev, newTag]);
    return newTag;
  };

  const deleteTag = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    // Remove tag from all items
    setTaggedItems(prev => 
      prev.map(item => ({
        ...item,
        tagIds: item.tagIds.filter(id => id !== tagId)
      }))
    );
  };

  const updateTag = (tagId: string, updates: Partial<Tag>) => {
    setTags(prev => 
      prev.map(tag => 
        tag.id === tagId ? { ...tag, ...updates } : tag
      )
    );
  };

  const addTagToItem = (itemId: string, itemType: 'image' | 'document', tagId: string) => {
    setTaggedItems(prev => {
      const existingItem = prev.find(item => item.id === itemId);
      
      if (existingItem) {
        if (!existingItem.tagIds.includes(tagId)) {
          return prev.map(item => 
            item.id === itemId 
              ? { ...item, tagIds: [...item.tagIds, tagId] }
              : item
          );
        }
        return prev;
      } else {
        return [...prev, { id: itemId, type: itemType, tagIds: [tagId] }];
      }
    });
  };

  const removeTagFromItem = (itemId: string, tagId: string) => {
    setTaggedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, tagIds: item.tagIds.filter(id => id !== tagId) }
          : item
      )
    );
  };

  const getItemTags = (itemId: string): Tag[] => {
    const taggedItem = taggedItems.find(item => item.id === itemId);
    if (!taggedItem) return [];
    
    return tags.filter(tag => taggedItem.tagIds.includes(tag.id));
  };

  const getItemsByTags = (tagIds: string[], itemType?: 'image' | 'document'): TaggedItem[] => {
    if (tagIds.length === 0) {
      return itemType ? taggedItems.filter(item => item.type === itemType) : taggedItems;
    }
    
    return taggedItems.filter(item => {
      const matchesType = !itemType || item.type === itemType;
      const hasAllTags = tagIds.every(tagId => item.tagIds.includes(tagId));
      return matchesType && hasAllTags;
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
      }}
    >
      {children}
    </TagContext.Provider>
  );
};