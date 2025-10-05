import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, Filter } from 'lucide-react';
import { useTagContext, Tag } from './TagContext';

interface TagFilterProps {
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  onClearFilter: () => void;
  itemType?: 'image' | 'document';
}

export const TagFilter: React.FC<TagFilterProps> = ({
                                                      selectedTags,
                                                      onTagToggle,
                                                      onClearFilter,
                                                      itemType
                                                    }) => {
  const { tags } = useTagContext();

  const availableTags = tags.filter(tag => {
    // Could add logic here to only show tags that are actually used on items of the specified type
    return true;
  });

  if (availableTags.length === 0) {
    return null;
  }

  return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Tags</span>
          </div>
          {selectedTags.length > 0 && (
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilter}
                  className="h-auto px-2 py-1 text-xs"
              >
                Clear All
              </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);

            return (
                <Button
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTagToggle(tag.id)}
                    className={`h-auto px-3 py-1 text-xs transition-all ${
                        isSelected
                            ? 'text-white border-0'
                            : 'hover:border-opacity-50'
                    }`}
                    style={isSelected ? { backgroundColor: tag.color } : {}}
                >
                  {tag.name}
                  {isSelected && (
                      <X className="h-3 w-3 ml-1" />
                  )}
                </Button>
            );
          })}
        </div>

        {selectedTags.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Showing {itemType === 'image' ? 'galleries with images' : itemType === 'document' ? 'folders with documents' : 'items'} matching {selectedTags.length} selected tag{selectedTags.length !== 1 ? 's' : ''}
            </div>
        )}
      </div>
  );
};