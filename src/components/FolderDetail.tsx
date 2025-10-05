import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { PDFViewer } from './PDFViewer';
import { FileUpload } from './FileUpload';
import { TagManager } from './TagManager';
import { TagFilter } from './TagFilter';
import { ItemTags } from './ItemTags';
import { useTagContext } from './TagContext';
import { ArrowLeft, Download, Upload, Plus, File, Edit3, Check, X, Eye, Trash2, Tag, Loader2 } from 'lucide-react';
import { FileIcon, getFileTypeFromName } from './FileIcon';
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

interface FolderDetailProps {
  folderId: string;
  onNavigate: (page: string) => void;
  user: User | null;
}

export function FolderDetail({ folderId, onNavigate, user }: FolderDetailProps) {
  const { getItemsByTags, syncItemTags } = useTagContext();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [folder, setFolder] = useState<FirebaseFolder | null>(null);
  const [documents, setDocuments] = useState<FirebaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<FirebaseDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load folder and documents
  useEffect(() => {
    if (user) {
      loadFolderAndDocuments();
    }
  }, [folderId, user]);

  const loadFolderAndDocuments = async () => {
    if (!user) return;

    try {
      const [userFolders, userDocuments] = await Promise.all([
        documentService.getUserFolders(user.uid),
        documentService.getUserDocuments(user.uid)
      ]);

      const currentFolder = userFolders.find(f => f.id === folderId);
      if (currentFolder) {
        setFolder(currentFolder);
        setEditName(currentFolder.name);
        setEditDescription(currentFolder.description || '');

        // Sync folder tags
        if (currentFolder.tags) {
          syncItemTags(currentFolder.id, 'folder', currentFolder.tags);
        }

        // Get documents for this folder
        const folderDocs = userDocuments.filter(doc => doc.folderId === folderId);
        setDocuments(folderDocs);

        // Sync document tags
        folderDocs.forEach(doc => {
          if (doc.tags) {
            syncItemTags(doc.id, 'document', doc.tags);
          }
        });
      }
    } catch (error) {
      console.error('Error loading folder:', error);
      toast.error('Failed to load folder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (files: File[]) => {
    if (!user || !folder) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        await documentService.uploadDocument(user.uid, file, folderId, []);
      }

      await loadFolderAndDocuments();
      setIsUploadDialogOpen(false);
      toast.success('Documents uploaded successfully!');
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await documentService.deleteDocument(documentId);
      await loadFolderAndDocuments();
      toast.success('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleTitleSave = async () => {
    if (!folder || !editName.trim()) return;

    try {
      await documentService.updateFolder(folderId, { name: editName.trim() });
      await loadFolderAndDocuments();
      setIsEditingTitle(false);
      toast.success('Folder name updated!');
    } catch (error) {
      console.error('Error updating folder name:', error);
      toast.error('Failed to update folder name');
    }
  };

  const handleDescriptionSave = async () => {
    if (!folder) return;

    try {
      await documentService.updateFolder(folderId, { description: editDescription.trim() });
      await loadFolderAndDocuments();
      setIsEditingDescription(false);
      toast.success('Description updated!');
    } catch (error) {
      console.error('Error updating description:', error);
      toast.error('Failed to update description');
    }
  };

  const formatDate = (timestamp: any) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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

  const handleViewDocument = (doc: FirebaseDocument) => {
    setSelectedDocument(doc);
    setViewerOpen(true);
  };

  const handleDownload = (doc: FirebaseDocument) => {
    const link = document.createElement('a');
    link.href = doc.downloadURL;
    link.download = doc.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter documents based on selected tags
  const filteredDocuments = selectedTagIds.length > 0
      ? documents.filter(doc =>
          doc.tags && doc.tags.some(tag => selectedTagIds.includes(tag))
      )
      : documents;

  if (!user) {
    return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please sign in to view folder details.</p>
        </div>
    );
  }

  if (isLoading) {
    return (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
          <p className="text-muted-foreground">Loading folder...</p>
        </div>
    );
  }

  if (!folder) {
    return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Folder not found.</p>
          <Button onClick={() => onNavigate('documents')} className="mt-4">
            Back to Documents
          </Button>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => onNavigate('documents')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div>
              {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-9"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleTitleSave();
                          } else if (e.key === 'Escape') {
                            setEditName(folder.name);
                            setIsEditingTitle(false);
                          }
                        }}
                        autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={handleTitleSave}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditName(folder.name);
                          setIsEditingTitle(false);
                        }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
              ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-medium">{folder.name}</h1>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingTitle(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
              )}

              {isEditingDescription ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Add a description..."
                        className="h-8"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleDescriptionSave();
                          } else if (e.key === 'Escape') {
                            setEditDescription(folder.description || '');
                            setIsEditingDescription(false);
                          }
                        }}
                        autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={handleDescriptionSave}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditDescription(folder.description || '');
                          setIsEditingDescription(false);
                        }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
              ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-muted-foreground">
                      {folder.description || 'No description'}
                    </p>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingDescription(true)}
                        className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TagManager>
              <Button variant="outline" size="sm" className="gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Button>
            </TagManager>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Documents
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Documents</DialogTitle>
                  <DialogDescription>
                    Upload documents to this folder
                  </DialogDescription>
                </DialogHeader>
                <FileUpload
                    onFilesUploaded={handleUpload}
                    type="document"
                    multiple={true}
                />
                {isUploading && (
                    <div className="text-center py-4">
                      <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                )}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center h-32 bg-muted rounded-lg mb-3">
                    <FileIcon fileType={getFileTypeFromName(doc.name)} className="h-12 w-12" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium truncate" title={doc.name}>
                      {doc.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>{formatDate(doc.uploadedAt)}</span>
                    </div>

                    <ItemTags itemId={doc.id} itemType="document" />

                    <div className="flex gap-2 pt-2">
                      <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => handleViewDocument(doc)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Document</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{doc.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && selectedTagIds.length > 0 && (
            <div className="text-center py-12">
              <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No documents match your tag filter</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your tag selection to see more documents
              </p>
              <Button onClick={handleClearTagFilter} variant="outline">
                Clear Filter
              </Button>
            </div>
        )}

        {documents.length === 0 && (
            <div className="text-center py-12">
              <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload documents to this folder to get started
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Documents
              </Button>
            </div>
        )}

        {selectedDocument && (
            <PDFViewer
                document={{
                  id: selectedDocument.id,
                  name: selectedDocument.name,
                  type: getFileTypeFromName(selectedDocument.name),
                  url: selectedDocument.downloadURL,
                  size: formatFileSize(selectedDocument.size),
                  uploadDate: selectedDocument.uploadedAt.toDate().toISOString()
                }}
                isOpen={viewerOpen}
                onClose={() => {
                  setViewerOpen(false);
                  setSelectedDocument(null);
                }}
            />
        )}
      </div>
  );
}