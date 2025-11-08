import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ItemTags } from './ItemTags';
import { Edit3, Trash2, Check, X, Settings, ArrowLeft } from 'lucide-react';
import { FirebaseGallery } from '../types/firebase';
import { galleryService } from '../services/firebaseService';
import { toast } from 'sonner';

interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  screenName: string;
  profilePicture?: string;
}

interface GalleryManagementProps {
  galleries: FirebaseGallery[];
  onSelectGallery: (gallery: FirebaseGallery) => void;
  pageTitle?: string;
  onBack?: () => void;
  user: User | null;
  onGalleriesChange: () => Promise<FirebaseGallery[]>;
}

export function GalleryManagement({ galleries, onSelectGallery, pageTitle = "Gallery", onBack, user, onGalleriesChange }: GalleryManagementProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleEditStart = (gallery: FirebaseGallery) => {
    setEditingId(gallery.id);
    setEditingTitle(gallery.name);
  };

  const handleEditSave = async () => {
    if (editingId && editingTitle.trim()) {
      try {
        await galleryService.updateGallery(editingId, { name: editingTitle.trim() });
        await onGalleriesChange();
        toast.success('Gallery updated successfully!');
      } catch (error) {
        console.error('Error updating gallery:', error);
        toast.error('Failed to update gallery');
      }
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDeleteGallery = async (galleryId: string) => {
    try {
      await galleryService.deleteGallery(galleryId);
      await onGalleriesChange();
      toast.success('Gallery deleted successfully!');
    } catch (error) {
      console.error('Error deleting gallery:', error);
      toast.error('Failed to delete gallery');
    }
  };

  const renderGalleryThumbnail = (gallery: FirebaseGallery) => {
    const thumbnailImages = gallery.images.slice(0, 4).map(img => img.downloadURL);
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
                        alt={`${gallery.name} thumbnail ${index + 1}`}
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
                                {gallery.name}
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
                                          Are you sure you want to delete "{gallery.name}"? This action cannot be undone and will permanently delete all images in this gallery.
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
                    <ItemTags
                        itemId={gallery.id}
                        itemType="gallery"
                        showAddButton={isManaging}
                        size="sm"
                        className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>

        {galleries.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto max-w-md">
                <h3 className="text-lg font-medium text-foreground mb-2">No galleries yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first gallery to start organizing your images.
                </p>
              </div>
            </div>
        )}
      </div>
  );
}