import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, X, Edit3, Trash2, Pipette } from 'lucide-react';
import { useTagContext, Tag } from './TagContext';

const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#6b7280', '#374151', '#1f2937'
];

interface TagManagerProps {
  children?: React.ReactNode;
}

export const TagManager: React.FC<TagManagerProps> = ({ children }) => {
  const { tags, createTag, deleteTag, updateTag } = useTagContext();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [customColorInput, setCustomColorInput] = useState(TAG_COLORS[0]);

  const handleCreateTag = async () => {
    if (newTagName.trim()) {
      try {
        if (editingTag) {
          await updateTag(editingTag.id, { name: newTagName.trim(), color: selectedColor });
          setEditingTag(null);
        } else {
          await createTag(newTagName.trim(), selectedColor);
        }
        setNewTagName('');
        setSelectedColor(TAG_COLORS[0]);
        setCustomColorInput(TAG_COLORS[0]);
      } catch (error) {
        console.error('Error creating/updating tag:', error);
      }
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setSelectedColor(tag.color);
    setCustomColorInput(tag.color);
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag(tagId);
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setNewTagName('');
    setSelectedColor(TAG_COLORS[0]);
    setCustomColorInput(TAG_COLORS[0]);
  };

  const handleColorPickerChange = (color: string) => {
    setCustomColorInput(color);
    setSelectedColor(color);
  };

  const handlePresetColorSelect = (color: string) => {
    setSelectedColor(color);
    setCustomColorInput(color);
  };

  return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children || (
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Manage Tags
              </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Create and manage tags for organizing your content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Create/Edit Tag Form */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {editingTag ? 'Edit Tag' : 'Create New Tag'}
                </h3>
                {editingTag && (
                    <Button variant="ghost" size="sm" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tagName">Tag Name</Label>
                  <Input
                      id="tagName"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Enter tag name"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Color</Label>

                  {/* Color Picker */}
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                    <div className="relative">
                      <input
                          type="color"
                          value={customColorInput}
                          onChange={(e) => handleColorPickerChange(e.target.value)}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
                          style={{
                            padding: '2px',
                          }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                            type="text"
                            value={customColorInput}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCustomColorInput(value);
                              // Only update selected color if it's a valid hex color
                              if (/^#[0-9A-F]{6}$/i.test(value)) {
                                setSelectedColor(value);
                              }
                            }}
                            placeholder="#000000"
                            className="font-mono uppercase"
                            maxLength={7}
                        />
                        <Pipette className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pick any color or enter a hex code
                      </p>
                    </div>
                  </div>

                  {/* Preset Colors */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Quick select:</p>
                    <div className="flex flex-wrap gap-2">
                      {TAG_COLORS.map((color) => (
                          <button
                              key={color}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  selectedColor === color
                                      ? 'border-foreground scale-110 ring-2 ring-ring ring-offset-2'
                                      : 'border-border hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => handlePresetColorSelect(color)}
                              title={color}
                          />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                  {editingTag ? 'Update Tag' : 'Create Tag'}
                </Button>
                {newTagName && (
                    <Badge
                        className="text-white border-0"
                        style={{ backgroundColor: selectedColor }}
                    >
                      {newTagName}
                    </Badge>
                )}
              </div>
            </div>

            {/* Existing Tags */}
            <div className="space-y-4">
              <h3 className="font-medium">Existing Tags ({tags.length})</h3>
              {tags.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No tags created yet. Create your first tag above.
                  </p>
              ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <div
                            key={tag.id}
                            className="flex items-center gap-2 p-2 border rounded-lg bg-card"
                        >
                          <Badge
                              className="text-white border-0"
                              style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTag(tag)}
                                className="h-6 w-6 p-0"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTag(tag.id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
};
