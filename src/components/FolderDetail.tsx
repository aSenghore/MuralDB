import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { PDFViewer } from './PDFViewer';
import { FileUpload } from './FileUpload';
import { TagManager } from './TagManager';
import { TagFilter } from './TagFilter';
import { ItemTags } from './ItemTags';
import { useUploads } from './UploadContext';
import { useTagContext } from './TagContext';
import { ArrowLeft, Download, Upload, Plus, File, Edit3, Check, X, Eye, Trash2, Tag } from 'lucide-react';
import { FileIcon, getFileTypeFromName } from './FileIcon';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
  uploadDate: string;
}

interface FolderDetailProps {
  folderId: string;
  onNavigate: (page: string) => void;
  onFolderUpdate?: (folderId: string, name: string, description: string) => void;
}

export function FolderDetail({ folderId, onNavigate, onFolderUpdate }: FolderDetailProps) {
  const { addUpload } = useUploads();
  const { getItemsByTags } = useTagContext();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  
  // Mock folder data - in a real app this would come from props or state management
  const [folderData, setFolderData] = useState({
    id: folderId,
    name: folderId === '1' ? 'Design Specs' : folderId === '2' ? 'Project Proposals' : 'Research',
    description: folderId === '1' ? 'Technical specifications and design documents' : 
                 folderId === '2' ? 'Client proposals and project documentation' : 
                 'Market research and user studies',
    documents: folderId === '1' ? [
      { id: '1', name: 'UI Guidelines.pdf', type: 'pdf', url: '/mock-doc.pdf', size: '2.1 MB', uploadDate: '2024-01-15' },
      { id: '2', name: 'Brand Manual.pdf', type: 'pdf', url: '/mock-doc.pdf', size: '5.3 MB', uploadDate: '2024-01-10' },
      { id: '3', name: 'Color Palette.pdf', type: 'pdf', url: '/mock-doc.pdf', size: '1.2 MB', uploadDate: '2024-01-08' },
      { id: '4', name: 'Typography Guide.pdf', type: 'pdf', url: '/mock-doc.pdf', size: '3.8 MB', uploadDate: '2024-01-05' },
    ] : folderId === '2' ? [
      { id: '5', name: 'Q4 Campaign.docx', type: 'docx', url: '/mock-doc.docx', size: '4.2 MB', uploadDate: '2024-02-01' },
      { id: '6', name: 'Brand Refresh.pptx', type: 'pptx', url: '/mock-doc.pptx', size: '12.7 MB', uploadDate: '2024-01-28' },
      { id: '7', name: 'Budget Analysis.xlsx', type: 'xlsx', url: '/mock-doc.xlsx', size: '890 KB', uploadDate: '2024-01-25' },
    ] : [
      { id: '8', name: 'User Survey Results.pdf', type: 'pdf', url: '/mock-doc.pdf', size: '6.1 MB', uploadDate: '2024-02-10' },
      { id: '9', name: 'Competitor Analysis.pdf', type: 'pdf', url: '/mock-doc.pdf', size: '8.3 MB', uploadDate: '2024-02-05' },
    ]
  });

  const [documents, setDocuments] = useState<Document[]>(folderData.documents);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editName, setEditName] = useState(folderData.name);
  const [editDescription, setEditDescription] = useState(folderData.description);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const getFileIcon = (type: string) => {
    return <FileIcon fileType={type} className="h-8 w-8" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleUpload = (files: File[]) => {
    files.forEach(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      
      // Add to documents list
      const newDoc: Document = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileExtension,
        url: URL.createObjectURL(file),
        size,
        uploadDate: new Date().toISOString().split('T')[0]
      };
      setDocuments(prev => [...prev, newDoc]);

      // Track in upload context
      const uploadedFile = {
        id: newDoc.id,
        name: file.name,
        type: 'document' as const,
        fileType: fileExtension,
        url: newDoc.url,
        size,
        uploadDate: new Date().toISOString(),
        location: `Documents > ${folderData.name}`
      };
      addUpload(uploadedFile);
    });
    
    setIsUploadDialogOpen(false);
  };

  const handleNameSave = () => {
    if (editName.trim()) {
      const updatedFolder = { ...folderData, name: editName.trim() };
      setFolderData(updatedFolder);
      if (onFolderUpdate) {
        onFolderUpdate(folderId, editName.trim(), folderData.description);
      }
    }
    setIsEditingTitle(false);
  };

  const handleNameCancel = () => {
    setEditName(folderData.name);
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    const updatedFolder = { ...folderData, description: editDescription.trim() };
    setFolderData(updatedFolder);
    if (onFolderUpdate) {
      onFolderUpdate(folderId, folderData.name, editDescription.trim());
    }
    setIsEditingDescription(false);
  };

  const handleDescriptionCancel = () => {
    setEditDescription(folderData.description);
    setIsEditingDescription(false);
  };

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  };

  const handleDocumentRename = (newName: string) => {
    if (selectedDocument) {
      const updatedDocuments = documents.map(doc =>
        doc.id === selectedDocument.id
          ? { ...doc, name: newName }
          : doc
      );
      setDocuments(updatedDocuments);
      setSelectedDocument({ ...selectedDocument, name: newName });
    }
  };

  const handleDocumentDelete = () => {
    if (selectedDocument) {
      const updatedDocuments = documents.filter(doc => doc.id !== selectedDocument.id);
      setDocuments(updatedDocuments);
      setSelectedDocument(null);
      setViewerOpen(false);
    }
  };

  const handleDocumentDeleteDirect = (docId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocuments);
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

  // Filter documents based on selected tags
  const filteredDocuments = selectedTagIds.length > 0 
    ? documents.filter(doc => {
        const taggedDocuments = getItemsByTags(selectedTagIds, 'document');
        return taggedDocuments.some(taggedDoc => taggedDoc.id === doc.id);
      })
    : documents;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('documents')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-foreground">{folderData.name}</h1>
          <p className="text-muted-foreground mt-2">{folderData.description}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
            {filteredDocuments.length !== documents.length && (
              <span> • {filteredDocuments.length} shown</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TagManager>
            <Button variant="outline" size="sm">
              <Tag className="h-4 w-4 mr-2" />
              Manage Tags
            </Button>
          </TagManager>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Add a new document to the {folderData.name} folder
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FileUpload 
                  onFilesUploaded={handleUpload}
                  type="document"
                  multiple={true}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocuments.map((doc) => (
          <Card 
            key={doc.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 group relative"
            onClick={() => handleDocumentClick(doc)}
          >
            <CardContent className="p-4">
              <div className="w-full h-32 bg-muted rounded-lg border flex items-center justify-center mb-4 relative">
                {getFileIcon(doc.type)}
                
                {/* Document Tags */}
                <div className="absolute top-2 left-2">
                  <ItemTags 
                    itemId={doc.id} 
                    itemType="document" 
                    size="sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm truncate" title={doc.name}>
                  {doc.name}
                </h3>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{doc.size}</span>
                  <span>{formatDate(doc.uploadDate)}</span>
                </div>
                
                {/* Add Tags Button */}
                <div className="mt-2">
                  <ItemTags 
                    itemId={doc.id} 
                    itemType="document" 
                    showAddButton={true}
                    size="sm"
                  />
                </div>
              </div>
            </CardContent>
            
            {/* Hover controls */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDocumentClick(doc);
                }}
                className="h-8 w-8 p-0"
                title="View document"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDocumentDeleteDirect(doc.id);
                }}
                className="h-8 w-8 p-0"
                title="Delete document"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="px-4 pb-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDocumentClick(doc);
                  }}
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle download
                    const link = document.createElement('a');
                    link.href = doc.url;
                    link.download = doc.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && selectedTagIds.length > 0 && (
        <div className="text-center py-12">
          <FileIcon fileType="document" className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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
          <FileIcon fileType="document" className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first document to this folder
          </p>
          <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
        </div>
      )}

      {/* PDF Viewer */}
      <PDFViewer
        document={selectedDocument}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onDocumentRename={handleDocumentRename}
        onDocumentDelete={handleDocumentDelete}
      />
    </div>
  );
}