import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FolderManagement } from './FolderManagement';
import { TagManager } from './TagManager';
import { TagFilter } from './TagFilter';
import { ItemTags } from './ItemTags';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Folder, Plus, Upload, Settings, Tag, Loader2, Pin } from 'lucide-react';
import { FileIcon, getFileTypeFromName } from './FileIcon';
import { useTagContext } from './TagContext';
import { documentService } from '../services/firebaseService';
import { FirebaseFolder, FirebaseDocument } from '../types/firebase';
import { toast } from 'sonner';

interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  screenName: string;
  profilePicture?: string;
}

interface DocumentsPageProps {
  onNavigate: (page: string, folderId?: string) => void;
  user: User | null;
}

export function DocumentsPage({ onNavigate, user }: DocumentsPageProps) {
  const { getItemsByTags, syncItemTags } = useTagContext();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [folders, setFolders] = useState<FirebaseFolder[]>([]);
  const [documents, setDocuments] = useState<FirebaseDocument[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load folders and documents from Firebase
  useEffect(() => {
    if (user) {
      loadFoldersAndDocuments();
    }
  }, [user]);

  const loadFoldersAndDocuments = async () => {
    if (!user) return;

    try {
      const [userFolders, userDocuments] = await Promise.all([
        documentService.getUserFolders(user.uid),
        documentService.getUserDocuments(user.uid)
      ]);

      setFolders(userFolders);
      setDocuments(userDocuments);

      // Sync folder tags to TagContext
      userFolders.forEach(folder => {
        if (folder.tags) {
          syncItemTags(folder.id, 'folder', folder.tags);
        }
      });

      // Sync document tags to TagContext
      userDocuments.forEach(doc => {
        if (doc.tags) {
          syncItemTags(doc.id, 'document', doc.tags);
        }
      });
    } catch (error) {
      console.error('Error loading folders and documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim() || !user) return;

    setIsCreating(true);
    try {
      const folderId = await documentService.createFolder(
          user.uid,
          newFolderName.trim(),
          newFolderDescription.trim()
      );

      // Reload folders to get the new one
      await loadFoldersAndDocuments();

      setNewFolderName('');
      setNewFolderDescription('');
      setIsDialogOpen(false);
      toast.success('Folder created successfully!');
    } catch (error: any) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectFolderFromManagement = (folderId: string) => {
    onNavigate('folder-detail', folderId);
    setIsManagementMode(false);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
        prev.includes(tagId)
            ? prev.filter(id => id !== tagId)
            : [...prev, tagId]
    );
  };

  const handleClearTagFilter = () => {
    setSelectedTagIds([]);
  };

  // Get documents for each folder
  const getFolderDocuments = (folderId: string) => {
    return documents.filter(doc => doc.folderId === folderId);
  };

  const handlePinFolder = async (folderId: string) => {
    if (!user) return;

    try {
      await documentService.pinFolder(folderId, user.uid);
      await loadFoldersAndDocuments();
      toast.success('Folder pinned successfully!');
    } catch (error: any) {
      console.error('Error pinning folder:', error);
      // Show a more prominent error message for the pin limit
      if (error.message && error.message.includes('Maximum of 3')) {
        toast.error(error.message, {
          duration: 5000,
          description: 'You can only pin up to 3 folders at a time.'
        });
      } else {
        toast.error(error.message || 'Failed to pin folder');
      }
    }
  };

  const handleUnpinFolder = async (folderId: string) => {
    try {
      await documentService.unpinFolder(folderId);
      await loadFoldersAndDocuments();
      toast.success('Folder unpinned!');
    } catch (error: any) {
      console.error('Error unpinning folder:', error);
      toast.error('Failed to unpin folder');
    }
  };

  const handleShowcasePinFolder = async (folderId: string) => {
    if (!user) return;

    try {
      await documentService.showcasePinFolder(folderId, user.uid);
      await loadFoldersAndDocuments();
      toast.success('Folder showcase pinned!');
    } catch (error: any) {
      console.error('Error showcase pinning folder:', error);
      toast.error(error.message || 'Failed to showcase pin folder');
    }
  };

  const handleShowcaseUnpinFolder = async (folderId: string) => {
    try {
      await documentService.showcaseUnpinFolder(folderId);
      await loadFoldersAndDocuments();
      toast.success('Folder showcase unpinned!');
    } catch (error: any) {
      console.error('Error showcase unpinning folder:', error);
      toast.error('Failed to showcase unpin folder');
    }
  };

  // Filter folders based on selected tags (check both folder tags and document tags)
  const filteredFolders = selectedTagIds.length > 0
      ? folders.filter(folder => {
        // Check if folder has any of the selected tags
        const hasFolderTag = folder.tags && folder.tags.some(tag => selectedTagIds.includes(tag));
        // Check if any document has any of the selected tags
        const folderDocs = getFolderDocuments(folder.id);
        const hasDocumentTag = folderDocs.some(doc => {
          return doc.tags && doc.tags.some(tag => selectedTagIds.includes(tag));
        });
        return hasFolderTag || hasDocumentTag;
      })
      : folders;

  // Sort folders: pinned first (by pinnedOrder), then by createdAt
  const sortedFolders = [...filteredFolders].sort((a, b) => {
    // Pinned folders come first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    // Both pinned: sort by pinnedOrder
    if (a.pinned && b.pinned) {
      return (a.pinnedOrder ?? 0) - (b.pinnedOrder ?? 0);
    }

    // Both unpinned: sort by createdAt (most recent first)
    return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
  });

  const FolderThumbnail = ({ folder }: { folder: FirebaseFolder }) => {
    const folderDocs = getFolderDocuments(folder.id);
    const displayDocs = folderDocs.slice(0, 3);

    return (
        <div className="relative">
          <div className="w-full h-32 sm:h-48 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center folder-thumbnail">
            {displayDocs.length > 0 ? (
                <div className="flex gap-1 sm:gap-2">
                  {displayDocs.map((doc, index) => (
                      <div
                          key={doc.id}
                          className="w-8 h-10 sm:w-12 sm:h-16 bg-card border border-border rounded shadow-sm flex items-center justify-center"
                          style={{ transform: `translateX(${index * -2}px) rotate(${(index - 1) * 3}deg)` }}
                      >
                        <FileIcon
                            fileType={getFileTypeFromName(doc.name)}
                            className="h-4 w-4 sm:h-6 sm:w-6"
                        />
                      </div>
                  ))}
                </div>
            ) : (
                <Folder className="h-8 w-8 sm:h-16 sm:w-16 text-muted-foreground" />
            )}
          </div>
          <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-primary text-primary-foreground text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {folderDocs.length} files
          </div>
        </div>
    );
  };

  // Show loading state
  if (!user) {
    return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please sign in to view your documents.</p>
        </div>
    );
  }

  if (isLoading) {
    return (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
          <p className="text-muted-foreground">Loading your documents...</p>
        </div>
    );
  }

  if (isManagementMode) {
    return (
        <FolderManagement
            folders={folders}
            onSelectFolder={handleSelectFolderFromManagement}
            onBack={() => setIsManagementMode(false)}
            user={user}
            onFoldersChange={loadFoldersAndDocuments}
        />
    );
  }

  return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mobile-page-header">
          <div>
            <h1 className="mobile-page-title sm:text-3xl font-medium text-foreground">Documents</h1>
            <p className="text-muted-foreground mobile-page-description sm:mt-2 sm:text-base">
              Organize and access your project documents and files
            </p>
          </div>
          <div className="flex items-center mobile-button-group sm:gap-2">
            <TagManager>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 mobile-icon" />
                <span className="hidden sm:inline">Manage </span>Tags
              </Button>
            </TagManager>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManagementMode(true)}
                className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mobile-icon" />
              Manage
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mobile-icon" />
                  <span className="hidden sm:inline">New </span>Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Create a new folder to organize your documents
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folderName">Folder Name</Label>
                    <Input
                        id="folderName"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="folderDescription">Description (Optional)</Label>
                    <Input
                        id="folderDescription"
                        value={newFolderDescription}
                        onChange={(e) => setNewFolderDescription(e.target.value)}
                        placeholder="Enter folder description"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createFolder} disabled={isCreating}>
                      {isCreating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                      ) : (
                          'Create Folder'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TagFilter
            selectedTags={selectedTagIds}
            onTagToggle={handleTagToggle}
            onClearFilter={handleClearTagFilter}
            itemType="document"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 document-grid">
          {sortedFolders.map((folder) => (
              <div key={folder.id} className="relative">
                <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => onNavigate('folder-detail', folder.id)}
                >
                  <CardContent className="document-card sm:p-4">
                    <FolderThumbnail folder={folder} />
                  </CardContent>
                  <CardHeader className="document-folder-info sm:pt-0">
                    <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                      <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-primary mobile-icon" />
                      {folder.name}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{folder.description || 'Document folder'}</CardDescription>
                    <ItemTags
                        itemId={folder.id}
                        itemType="folder"
                        showAddButton={true}
                        size="sm"
                        className="mt-1"
                        onTagsChanged={loadFoldersAndDocuments}
                    />
                  </CardHeader>
                </Card>
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-2"
                      style={folder.showcasePinned ? {
                        backgroundColor: '#dc2626',
                        borderColor: '#dc2626',
                        color: 'white'
                      } : {
                        borderColor: '#fca5a5',
                        color: '#dc2626'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (folder.showcasePinned) {
                          handleShowcaseUnpinFolder(folder.id);
                        } else {
                          handleShowcasePinFolder(folder.id);
                        }
                      }}
                      title={folder.showcasePinned ? "Remove showcase pin" : "Showcase pin"}
                  >
                    <Pin className={`h-4 w-4 ${folder.showcasePinned ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                      size="sm"
                      variant={folder.pinned ? "default" : "outline"}
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (folder.pinned) {
                          handleUnpinFolder(folder.id);
                        } else {
                          handlePinFolder(folder.id);
                        }
                      }}
                      title={folder.pinned ? "Unpin folder" : "Pin folder"}
                  >
                    <Pin className={`h-4 w-4 ${folder.pinned ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                {folder.showcasePinned && (
                    <div
                        className="absolute top-2 left-2 text-xs px-2 py-1 rounded-md z-10"
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white'
                        }}
                    >
                      Showcase
                    </div>
                )}
                {folder.pinned && !folder.showcasePinned && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md z-10">
                      Pinned
                    </div>
                )}
              </div>
          ))}
        </div>

        {sortedFolders.length === 0 && selectedTagIds.length > 0 && (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No folders match your tag filter</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your tag selection to see more folders
              </p>
              <Button onClick={handleClearTagFilter} variant="outline">
                Clear Filter
              </Button>
            </div>
        )}

        {folders.length === 0 && (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No folders yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first folder to start organizing documents
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Folder
              </Button>
            </div>
        )}
      </div>
  );
}