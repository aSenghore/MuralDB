import * as React from 'react';
import { useState, useEffect } from 'react';
import { GalleryThumbnail } from './GalleryThumbnail';
import { GalleryDetail } from './GalleryDetail';
import { GalleryManagement } from './GalleryManagement';
import { TagManager } from './TagManager';
import { TagFilter } from './TagFilter';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Settings, Tag, Image, Loader2 } from 'lucide-react';
import { useTagContext } from './TagContext';
import { galleryService } from '../services/firebaseService';
import { FirebaseGallery } from '../types/firebase';
import { toast } from 'sonner';

interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  screenName: string;
  profilePicture?: string;
}

interface ArtPhotosPageProps {
  user: User | null;
  onBack?: () => void;
}

export function ArtPhotosPage({ user, onBack }: ArtPhotosPageProps) {
  const { getItemsByTags } = useTagContext();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [galleries, setGalleries] = useState<FirebaseGallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<FirebaseGallery | null>(null);
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [newGalleryName, setNewGalleryName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load galleries from Firebase
  useEffect(() => {
    if (user) {
      loadGalleries();
    }
  }, [user]);

  const loadGalleries = async () => {
    if (!user) return;
    
    try {
      const userGalleries = await galleryService.getUserGalleries(user.uid);
      setGalleries(userGalleries);
    } catch (error) {
      console.error('Error loading galleries:', error);
      toast.error('Failed to load galleries');
    } finally {
      setIsLoading(false);
    }
  };

  const addNewGallery = async () => {
    if (!newGalleryName.trim() || !user) return;
    
    setIsCreating(true);
    try {
      const galleryId = await galleryService.createGallery(
        user.uid, 
        newGalleryName.trim(), 
        'Art & Photos gallery'
      );
      
      // Reload galleries to get the new one
      await loadGalleries();
      
      setNewGalleryName('');
      setIsCreateDialogOpen(false);
      toast.success('Gallery created successfully!');
    } catch (error: any) {
      console.error('Error creating gallery:', error);
      toast.error('Failed to create gallery');
    } finally {
      setIsCreating(false);
    }
  };

  const handleFilesUploaded = async (galleryId: string, files: File[]) => {
    if (!user) return;
    
    try {
      // Upload each file to Firebase
      for (const file of files) {
        await galleryService.uploadImage(galleryId, file, []);
      }
      
      // Reload galleries to get updated data
      await loadGalleries();
      
      // Update selected gallery if it's currently open
      if (selectedGallery && selectedGallery.id === galleryId) {
        const updatedGallery = galleries.find(g => g.id === galleryId);
        if (updatedGallery) {
          setSelectedGallery(updatedGallery);
        }
      }
      
      toast.success('Images uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    }
  };

  const handleDeleteImage = async (galleryId: string, imageIndex: number) => {
    const gallery = galleries.find(g => g.id === galleryId);
    if (!gallery || !gallery.images[imageIndex]) return;
    
    const imageToDelete = gallery.images[imageIndex];
    
    try {
      await galleryService.removeImage(galleryId, imageToDelete.id);
      
      // Reload galleries to get updated data
      await loadGalleries();
      
      // Update selected gallery if it's currently open
      if (selectedGallery && selectedGallery.id === galleryId) {
        const updatedGallery = galleries.find(g => g.id === galleryId);
        if (updatedGallery) {
          setSelectedGallery(updatedGallery);
        }
      }
      
      toast.success('Image deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleSelectGalleryFromManagement = (gallery: FirebaseGallery) => {
    setSelectedGallery(gallery);
    setIsManagementMode(false);
  };

  const handleTitleChange = async (galleryId: string, newTitle: string) => {
    try {
      await galleryService.updateGallery(galleryId, { name: newTitle });
      
      // Update local state
      setGalleries(galleries.map(gallery => 
        gallery.id === galleryId ? { ...gallery, name: newTitle } : gallery
      ));
      
      // Update selected gallery if it's currently open
      if (selectedGallery && selectedGallery.id === galleryId) {
        setSelectedGallery({ ...selectedGallery, name: newTitle });
      }
      
      toast.success('Gallery title updated!');
    } catch (error: any) {
      console.error('Error updating gallery title:', error);
      toast.error('Failed to update gallery title');
    }
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

  // Filter galleries based on selected tags
  const filteredGalleries = selectedTagIds.length > 0 
    ? galleries.filter(gallery => {
        return gallery.images.some(image => {
          return image.tags && image.tags.some(tag => selectedTagIds.includes(tag));
        });
      })
    : galleries;

  // Show loading state
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to view your art galleries.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your galleries...</p>
      </div>
    );
  }

  if (selectedGallery) {
    return (
      <GalleryDetail
        title={selectedGallery.name}
        images={selectedGallery.images.map(img => img.url)}
        imageNames={selectedGallery.images.map(img => img.name)}
        galleryId={selectedGallery.id}
        onBack={() => setSelectedGallery(null)}
        onFilesUploaded={(files) => handleFilesUploaded(selectedGallery.id, files)}
        onDeleteImage={(index) => handleDeleteImage(selectedGallery.id, index)}
        onTitleChange={(newTitle) => handleTitleChange(selectedGallery.id, newTitle)}
          //@ts-ignore
        user={user}
      />
    );
  }

  if (isManagementMode) {
    return (
      <GalleryManagement
          //@ts-ignore
        galleries={galleries}
        //@ts-ignore
        onSelectGallery={handleSelectGalleryFromManagement}
        pageTitle="Art & Photos"
        onBack={() => setIsManagementMode(false)}
        user={user}
        onGalleriesChange={loadGalleries}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between mobile-page-header">
        <h1 className="mobile-page-title sm:text-3xl font-medium">Art & Photos</h1>
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mobile-icon" />
                <span className="hidden sm:inline">New </span>Gallery
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
                      addNewGallery();
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
                  onClick={addNewGallery}
                  disabled={!newGalleryName.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Gallery'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <TagFilter
        selectedTags={selectedTagIds}
        onTagToggle={handleTagToggle}
        onClearFilter={handleClearTagFilter}
        itemType="image"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 gallery-grid">
        {filteredGalleries.map((gallery) => (
          <GalleryThumbnail
            key={gallery.id}
            title={gallery.name}
            images={gallery.images.map(img => img.url)}
            imageCount={gallery.images.length}
            onClick={() => setSelectedGallery(gallery)}
          />
        ))}
      </div>

      {filteredGalleries.length === 0 && selectedTagIds.length > 0 && (
        <div className="text-center py-12">
          <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No galleries match your tag filter</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your tag selection to see more galleries
          </p>
          <Button onClick={handleClearTagFilter} variant="outline">
            Clear Filter
          </Button>
        </div>
      )}

      {filteredGalleries.length === 0 && selectedTagIds.length === 0 && (
        <div className="text-center py-12">
          <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No art galleries yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first gallery to start organizing your artwork and photos
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Gallery
          </Button>
        </div>
      )}
    </div>
  );
}