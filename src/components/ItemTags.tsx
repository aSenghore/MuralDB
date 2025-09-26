import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, X } from 'lucide-react';
import { useTagContext } from './TagContext';

interface ItemTagsProps {
  itemId: string;
  itemType: 'image' | 'document';
  showAddButton?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const ItemTags: React.FC<ItemTagsProps> = ({
  itemId,
  itemType,
  showAddButton = false,
  size = 'sm',
  className = ''
}) => {
  const { tags, getItemTags, addTagToItem, removeTagFromItem } = useTagContext();
  const [isManageOpen, setIsManageOpen] = useState(false);
  
  const itemTags = getItemTags(itemId);
  const availableTags = tags.filter(tag => !itemTags.find(itemTag => itemTag.id === tag.id));

  const handleAddTag = (tagId: string) => {
    addTagToItem(itemId, itemType, tagId);
  };

  const handleRemoveTag = (tagId: string) => {
    removeTagFromItem(itemId, tagId);
  };

  const tagSize = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {itemTags.map((tag) => (
        <Badge
          key={tag.id}
          className={`text-white border-0 ${tagSize} ${
            showAddButton ? 'pr-1' : ''
          }`}
          style={{ backgroundColor: tag.color }}
        >
          {tag.name}
          {showAddButton && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemoveTag(tag.id);
              }}
              className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </Badge>
      ))}
      
      {showAddButton && (
        <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`${size === 'sm' ? 'h-6 px-2' : 'h-8 px-3'} border-dashed`}
            >
              <Plus className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Tags</DialogTitle>
              <DialogDescription>
                Add or remove tags for this {itemType}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Current Tags */}
              {itemTags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Current Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {itemTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        className="text-white border-0 pr-1"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                        <button
                          onClick={() => handleRemoveTag(tag.id)}
                          className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Tags */}
              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Add Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Button
                        key={tag.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTag(tag.id)}
                        className="h-auto px-3 py-1"
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {availableTags.length === 0 && itemTags.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tags available. Create tags first to organize your content.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};