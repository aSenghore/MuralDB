import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ItemTags } from './ItemTags';
import { Edit3, Trash2, Check, X, Settings, ArrowLeft, Folder, FileText } from 'lucide-react';
import { FirebaseFolder, FirebaseDocument } from '../types/firebase';
import { documentService } from '../services/firebaseService';
import { toast } from 'sonner';
import { FileIcon, getFileTypeFromName } from './FileIcon';

interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  screenName: string;
  profilePicture?: string;
}

interface FolderManagementProps {
  folders: FirebaseFolder[];
  onSelectFolder: (folderId: string) => void;
  onBack?: () => void;
  user: User | null;
  onFoldersChange: () => Promise<void>;
}

export function FolderManagement({ folders, onSelectFolder, onBack, user, onFoldersChange }: FolderManagementProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  const handleEditStart = (folder: FirebaseFolder) => {
    setEditingId(folder.id);
    setEditingName(folder.name);
    setEditingDescription(folder.description || '');
  };

  const handleEditSave = async () => {
    if (editingId && editingName.trim()) {
      try {
        await documentService.updateFolder(editingId, {
          name: editingName.trim(),
          description: editingDescription.trim()
        });
        await onFoldersChange();
        toast.success('Folder updated successfully!');
      } catch (error) {
        console.error('Error updating folder:', error);
        toast.error('Failed to update folder');
      }
    }
    setEditingId(null);
    setEditingName('');
    setEditingDescription('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
    setEditingDescription('');
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await documentService.deleteFolder(folderId);
      await onFoldersChange();
      toast.success('Folder deleted successfully!');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const FolderThumbnail = ({ folder }: { folder: FirebaseFolder }) => {
    return (
        <div className="relative">
          <div className="w-full h-48 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            {folder.documents.length > 0 ? (
                <div className="flex gap-2">
                  {folder.documents.slice(0, 3).map((docId, index) => (
                      <div
                          key={docId}
                          className="w-12 h-16 bg-card border border-border rounded shadow-sm flex items-center justify-center"
                          style={{ transform: `translateX(${index * -4}px) rotate(${(index - 1) * 3}deg)` }}
                      >
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                  ))}
                </div>
            ) : (
                <Folder className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            {folder.documents.length} files
          </div>
        </div>
    );
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
                <Button variant="ghost" onClick={onBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
            )}
            <h1 className="text-3xl font-medium">Document Management</h1>
            <Button
                variant={isManaging ? "default" : "outline"}
                size="sm"
                onClick={() => setIsManaging(!isManaging)}
                className="gap-2"
            >
              <Settings className="h-4 w-4" />
              {isManaging ? 'Done' : 'Manage'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
              <Card
                  key={folder.id}
                  className={`overflow-hidden transition-all duration-200 ${
                      isManaging
                          ? 'ring-2 ring-primary/20'
                          : 'cursor-pointer hover:shadow-lg hover:scale-105'
                  }`}
                  onClick={!isManaging ? () => onSelectFolder(folder.id) : undefined}
              >
                <CardContent className="p-4">
                  <FolderThumbnail folder={folder} />
                </CardContent>
                <CardHeader className="pt-0">
                  {editingId === folder.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditSave();
                                } else if (e.key === 'Escape') {
                                  handleEditCancel();
                                }
                              }}
                              autoFocus
                          />
                          <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleEditSave}
                              className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleEditCancel}
                              className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            placeholder="Description..."
                            rows={2}
                            className="text-sm"
                        />
                      </div>
                  ) : (
                      <>
                        <CardTitle className="flex items-center gap-2">
                          <Folder className="h-5 w-5 text-primary" />
                          <span className="truncate">{folder.name}</span>
                          {isManaging && (
                              <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditStart(folder)}
                                  className="h-8 w-8 p-0 ml-auto"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                          )}
                        </CardTitle>
                        <div className="flex items-center justify-between gap-2">
                          <CardDescription className="truncate flex-1">
                            {folder.description || 'No description'}
                          </CardDescription>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="secondary">
                              {folder.documents.length}
                            </Badge>
                            {isManaging && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{folder.name}"? This action cannot be undone and will permanently delete all documents in this folder.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                          onClick={() => handleDeleteFolder(folder.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            )}
                          </div>
                        </div>
                        <ItemTags
                            itemId={folder.id}
                            itemType="folder"
                            showAddButton={isManaging}
                            size="sm"
                            className="mt-2"
                            onTagsChanged={onFoldersChange}
                        />
                      </>
                  )}
                </CardHeader>
              </Card>
          ))}
        </div>

        {folders.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto max-w-md">
                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                  <Folder className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No folders yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first folder to start organizing your documents.
                </p>
              </div>
            </div>
        )}
      </div>
  );
}