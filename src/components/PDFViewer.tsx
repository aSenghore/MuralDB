import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ItemTags } from './ItemTags';
import {
    X,
    Download,
    Edit3,
    Check,
    Trash2,
    ExternalLink,
    FileEdit
} from 'lucide-react';
import { FileIcon, getFileTypeFromName } from './FileIcon';

interface DocumentItem {
    id: string;
    name: string;
    type: string;
    url: string;
    size: string;
    uploadDate: string;
}

interface PDFViewerProps {
    document: DocumentItem | null;
    isOpen: boolean;
    onClose: () => void;
    onDocumentRename?: (newName: string) => void;
    onDocumentDelete?: () => void;
    onDocumentEdit?: () => void;
    onDocumentEditPdfDocx?: () => void;
    onTagsChanged?: () => void;
    showControls?: boolean;
}

export function PDFViewer({
                              document,
                              isOpen,
                              onClose,
                              onDocumentRename,
                              onDocumentDelete,
                              onDocumentEdit,
                              onDocumentEditPdfDocx,
                              onTagsChanged,
                              showControls = true
                          }: PDFViewerProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');

    React.useEffect(() => {
        if (document) {
            setEditName(document.name);
        }
        setIsEditingName(false);
    }, [document]);

    const handleNameSave = () => {
        if (editName.trim() && onDocumentRename) {
            onDocumentRename(editName.trim());
        }
        setIsEditingName(false);
    };

    const handleNameCancel = () => {
        setEditName(document?.name || '');
        setIsEditingName(false);
    };

    const handleDelete = () => {
        if (onDocumentDelete) {
            onDocumentDelete();
            onClose();
        }
    };

    const handleDownload = () => {
        if (document) {
            const link = window.document.createElement('a');
            link.href = document.url;
            link.download = document.name;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
        }
    };

    const handleOpenExternal = () => {
        if (document) {
            window.open(document.url, '_blank');
        }
    };

    const isPDF = document?.type === 'pdf';
    const isViewableInBrowser = isPDF || document?.type === 'txt' || document?.type === 'md';
    const isEditable = ['txt', 'md', 'json', 'csv', 'xml', 'html', 'css', 'js', 'ts', 'tsx', 'jsx'].includes(document?.type?.toLowerCase() || '');
    const isPdfOrDocx = isPDF || ['doc', 'docx'].includes(document?.type?.toLowerCase() || '');

    if (!document) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
                <DialogTitle className="sr-only">
                    {document ? `Viewing ${document.name}` : 'Document Viewer'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    {document ? `Document viewer for ${document.type.toUpperCase()} files` : 'Document viewer with preview capabilities'}
                </DialogDescription>
                <div className="relative w-full h-full flex flex-col">
                    {/* Header with controls */}
                    <div className="flex justify-between items-center p-4 border-b bg-background">
                        <div className="flex items-center gap-2 flex-1">
                            {isEditingName ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleNameSave();
                                            } else if (e.key === 'Escape') {
                                                handleNameCancel();
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleNameSave}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleNameCancel}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 flex-1">
                                    <FileIcon fileType={document.type} className="h-5 w-5" />
                                    <div className="flex-1">
                                        <h3 className="font-medium">{document.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {document.size} • {new Date(document.uploadDate).toLocaleDateString()}
                                        </p>
                                        <ItemTags
                                            itemId={document.id}
                                            itemType="document"
                                            showAddButton={true}
                                            size="sm"
                                            className="mt-1"
                                            onTagsChanged={onTagsChanged}
                                        />
                                    </div>
                                    {onDocumentRename && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setIsEditingName(true)}
                                            className="ml-auto"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {showControls && (
                                <>
                                    {isEditable && onDocumentEdit && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={onDocumentEdit}
                                            title="Edit document"
                                        >
                                            <FileEdit className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {isPdfOrDocx && onDocumentEditPdfDocx && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={onDocumentEditPdfDocx}
                                            title="Extract and edit text"
                                        >
                                            <FileEdit className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleDownload}
                                        title="Download"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleOpenExternal}
                                        title="Open in new tab"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                    {onDocumentDelete && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleDelete}
                                            className="text-destructive hover:text-destructive"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </>
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onClose}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Document content area */}
                    <div className="flex-1 overflow-hidden">
                        {isViewableInBrowser ? (
                            <iframe
                                src={document.url}
                                className="w-full h-full border-0"
                                title={document.name}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-muted/20">
                                <FileIcon fileType={document.type} className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">Preview not available</h3>
                                <p className="text-muted-foreground text-center max-w-md mb-6">
                                    This file type ({document.type.toUpperCase()}) cannot be previewed in the browser.
                                    You can download the file or open it in an external application.
                                </p>
                                <div className="flex gap-2">
                                    <Button onClick={handleDownload} className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                    <Button variant="outline" onClick={handleOpenExternal} className="gap-2">
                                        <ExternalLink className="h-4 w-4" />
                                        Open External
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}