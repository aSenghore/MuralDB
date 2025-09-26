import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Plus, Edit3, Trash2, Check, X, Settings, ArrowLeft } from 'lucide-react';

interface Gallery {
  id: string;
  title: string;
  images: string[];
}

interface GalleryManagementProps {
  galleries: Gallery[];
  onUpdateGalleries: (galleries: Gallery[]) => void;
  onSelectGallery: (gallery: Gallery) => void;
  pageTitle?: string;
  onBack?: () => void;
}

export function GalleryManagement({ galleries, onUpdateGalleries, onSelectGallery, pageTitle = "Gallery", onBack }: GalleryManagementProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [newGalleryName, setNewGalleryName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleEditStart = (gallery: Gallery) => {
    setEditingId(gallery.id);
    setEditingTitle(gallery.title);
  };

  const handleEditSave = () => {
    if (editingId && editingTitle.trim()) {
      const updatedGalleries = galleries.map(gallery =>
        gallery.id === editingId
          ? { ...gallery, title: editingTitle.trim() }
          : gallery
      );
      onUpdateGalleries(updatedGalleries);
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDeleteGallery = (galleryId: string) => {
    const updatedGalleries = galleries.filter(gallery => gallery.id !== galleryId);
    onUpdateGalleries(updatedGalleries);
  };

  const handleCreateGallery = () => {
    if (newGalleryName.trim()) {
      const newGallery: Gallery = {
        id: Date.now().toString(),
        title: newGalleryName.trim(),
        images: []
      };
      onUpdateGalleries([...galleries, newGallery]);
      setNewGalleryName('');
      setIsCreateDialogOpen(false);
    }
  };

  const renderGalleryThumbnail = (gallery: Gallery) => {
    const thumbnailImages = gallery.images.slice(0, 4);
    while (thumbnailImages.length < 4) {
      thumbnailImages.push('');
    }

    return (
      <div className="grid grid-cols-2 gap-px bg-muted">
        {thumbnailImages.map((image, index) => (
          <div 
            key={index} 
            className="aspect-square relative overflow-hidden bg-muted"
          >
            {image ? (
              <ImageWithFallback
                src={image}
                alt={`${gallery.title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center">
                <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
              </div>
            )}
          </div>
        ))}
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
          <h1 className="text-3xl font-medium">{pageTitle} Management</h1>
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
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Gallery
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Gallery</DialogTitle>
              <DialogDescription>
                Enter a name for your new gallery.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newGalleryName}
                onChange={(e) => setNewGalleryName(e.target.value)}
                placeholder="Gallery name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateGallery();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewGalleryName('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGallery}
                disabled={!newGalleryName.trim()}
              >
                Create Gallery
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <Card 
            key={gallery.id}
            className={`overflow-hidden transition-all duration-200 ${
              isManaging 
                ? 'ring-2 ring-primary/20' 
                : 'cursor-pointer hover:shadow-lg'
            }`}
            onClick={!isManaging ? () => onSelectGallery(gallery) : undefined}
          >
            <CardContent className="p-0">
              {renderGalleryThumbnail(gallery)}
              
              <div className="p-4">
                <div className="flex items-center justify-between">
                  {editingId === gallery.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
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
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <h3 className="font-medium text-card-foreground truncate">
                          {gallery.title}
                        </h3>
                        {isManaging && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditStart(gallery)}
                            className="h-8 w-8 p-0 ml-auto"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {gallery.images.length}
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
                                <AlertDialogTitle>Delete Gallery</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{gallery.title}"? This action cannot be undone and will permanently delete all images in this gallery.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteGallery(gallery.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {galleries.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
              <Plus className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No galleries yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first gallery to start organizing your images.
            </p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create Gallery</Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}