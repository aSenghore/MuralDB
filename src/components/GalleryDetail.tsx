import React, { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FileUpload } from './FileUpload';
import { ImageViewer } from './ImageViewer';
import { ItemTags } from './ItemTags';
import { useUploads } from './UploadContext';
import { ArrowLeft, Trash2, Edit3, Check, X, Eye, Tag } from 'lucide-react';

interface ImageItem {
  url: string;
  name: string;
}

interface GalleryDetailProps {
  title: string;
  images: string[];
  imageNames?: string[];
  imageIds?: string[]; // Add imageIds to use actual Firebase IDs for tagging
  galleryId?: string; // Add galleryId for saving image tags
  onBack: () => void;
  onFilesUploaded: (files: File[]) => void;
  onDeleteImage: (index: number) => void;
  onTitleChange?: (newTitle: string) => void;
  onImageRename?: (index: number, newName: string) => void;
  onTagsChanged?: () => void; // Callback when tags are added/removed from images
  selectedImageId?: string | null; // Auto-open specific image
  readOnly?: boolean; // Read-only mode for public galleries
}

export function GalleryDetail({ title, images, imageNames: propImageNames, imageIds, galleryId = 'default', onBack, onFilesUploaded, onDeleteImage, onTitleChange, onImageRename, onTagsChanged, selectedImageId, readOnly = false }: GalleryDetailProps) {
  const { addUpload } = useUploads();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageNames, setImageNames] = useState<string[]>(
      propImageNames || images.map((_, index) => `Image ${index + 1}`)
  );
  const [showTagsFor, setShowTagsFor] = useState<number | null>(null);

  // Use actual Firebase image IDs if available, otherwise generate IDs
  const getImageId = (index: number) => imageIds?.[index] || `${galleryId}-image-${index}`;

  // Update imageNames when propImageNames changes
  React.useEffect(() => {
    if (propImageNames) {
      setImageNames(propImageNames);
    }
  }, [propImageNames]);

  // Auto-open image viewer if selectedImageId is provided
  React.useEffect(() => {
    if (selectedImageId && imageIds) {
      const index = imageIds.findIndex(id => id === selectedImageId);
      if (index !== -1) {
        setCurrentImageIndex(index);
        setViewerOpen(true);
      }
    }
  }, [selectedImageId, imageIds]);

  const handleTitleSave = () => {
    if (editTitle.trim() && onTitleChange) {
      onTitleChange(editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(title);
    setIsEditingTitle(false);
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setViewerOpen(true);
  };

  const handleImageRename = (index: number, newName: string) => {
    const updatedNames = [...imageNames];
    updatedNames[index] = newName;
    setImageNames(updatedNames);
    if (onImageRename) {
      onImageRename(index, newName);
    }
  };

  const handleImageDelete = (index: number) => {
    onDeleteImage(index);
    const updatedNames = [...imageNames];
    updatedNames.splice(index, 1);
    setImageNames(updatedNames);
    setViewerOpen(false);
  };

  // Convert images to ImageItem format for viewer
  const imageItems: ImageItem[] = images.map((url, index) => ({
    url,
    name: imageNames[index] || `Image ${index + 1}`
  }));

  return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" onClick={onBack} className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <ArrowLeft className="mobile-icon sm:h-4 sm:w-4" />
              Back
            </Button>

            {isEditingTitle ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mobile-page-title sm:text-2xl font-medium border-none px-0 h-auto"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTitleSave();
                        } else if (e.key === 'Escape') {
                          handleTitleCancel();
                        }
                      }}
                      autoFocus
                  />
                  <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleTitleSave}
                      className="mobile-hover-button sm:h-8 sm:w-8 sm:p-0"
                  >
                    <Check className="mobile-icon sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleTitleCancel}
                      className="mobile-hover-button sm:h-8 sm:w-8 sm:p-0"
                  >
                    <X className="mobile-icon sm:h-4 sm:w-4" />
                  </Button>
                </div>
            ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <h1 className="mobile-page-title sm:text-2xl font-medium">{title}</h1>
                  {onTitleChange && (
                      <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingTitle(true)}
                          className="mobile-hover-button sm:h-8 sm:w-8 sm:p-0"
                      >
                        <Edit3 className="mobile-icon sm:h-4 sm:w-4" />
                      </Button>
                  )}
                </div>
            )}
          </div>
          {!readOnly && (
              <FileUpload
                  onFilesUploaded={(files) => {
                    // Track uploads in context
                    files.forEach(file => {
                      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
                      const size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
                      const uploadedFile = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        type: 'image' as const,
                        fileType: fileExtension,
                        url: URL.createObjectURL(file),
                        size,
                        uploadDate: new Date().toISOString(),
                        thumbnailUrl: URL.createObjectURL(file),
                        location: `${window.location.pathname.includes('references') ? 'References' : 'Art'} > ${title}`
                      };
                      addUpload(uploadedFile);
                    });
                    onFilesUploaded(files);
                  }}
                  type="image"
              />
          )}
        </div>

        {images.length === 0 ? (
            <Card className="p-12">
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {readOnly ? 'This gallery is empty.' : 'No images in this gallery yet.'}
                </p>
                {!readOnly && (
                    <FileUpload
                        onFilesUploaded={(files) => {
                          // Track uploads in context
                          files.forEach(file => {
                            const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
                            const size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
                            const uploadedFile = {
                              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                              name: file.name,
                              type: 'image' as const,
                              fileType: fileExtension,
                              url: URL.createObjectURL(file),
                              size,
                              uploadDate: new Date().toISOString(),
                              thumbnailUrl: URL.createObjectURL(file),
                              location: `${window.location.pathname.includes('references') ? 'References' : 'Art'} > ${title}`
                            };
                            addUpload(uploadedFile);
                          });
                          onFilesUploaded(files);
                        }}
                        type="image"
                    />
                )}
              </CardContent>
            </Card>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 gallery-detail-grid">
              {images.map((image, index) => (
                  <Card key={index} className="overflow-hidden group gallery-image-card">
                    <CardContent className="p-0 relative card-content">
                      <div
                          className="aspect-square cursor-pointer"
                          onClick={() => handleImageClick(index)}
                      >
                        <ImageWithFallback
                            src={image}
                            alt={imageNames[index] || `${title} image ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />

                        {/* Tags overlay - shown in bottom left corner with small font */}
                        <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2">
                          <ItemTags
                              itemId={getImageId(index)}
                              itemType="image"
                              size="sm"
                              className="opacity-90 mobile-tags"
                              galleryId={galleryId}
                              onTagsChanged={onTagsChanged}
                          />
                        </div>
                      </div>

                      <div className="absolute top-1 sm:top-2 right-1 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 sm:gap-1">
                        {!readOnly && (
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowTagsFor(showTagsFor === index ? null : index);
                                }}
                                className="mobile-hover-button sm:h-8 sm:w-8 sm:p-0"
                                title="Manage tags"
                            >
                              <Tag className="mobile-icon sm:h-4 sm:w-4" />
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(index);
                            }}
                            className="mobile-hover-button sm:h-8 sm:w-8 sm:p-0"
                            title="View image"
                        >
                          <Eye className="mobile-icon sm:h-4 sm:w-4" />
                        </Button>
                        {!readOnly && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteImage(index);
                                }}
                                className="mobile-hover-button sm:h-8 sm:w-8 sm:p-0"
                                title="Delete image"
                            >
                              <Trash2 className="mobile-icon sm:h-4 sm:w-4" />
                            </Button>
                        )}
                      </div>

                      <div className="image-info sm:p-3">
                        <div className="flex items-center justify-between gap-1 sm:gap-2">
                          <p className="text-xs sm:text-sm font-medium truncate" title={imageNames[index]}>
                            {imageNames[index] || `Image ${index + 1}`}
                          </p>

                          {/* Tag management button - always visible */}
                          {showTagsFor === index && (
                              <div className="flex-shrink-0">
                                <ItemTags
                                    itemId={getImageId(index)}
                                    itemType="image"
                                    showAddButton={true}
                                    size="sm"
                                    galleryId={galleryId}
                                    onTagsChanged={onTagsChanged}
                                />
                              </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}

        {/* Image Viewer */}
        <ImageViewer
            images={imageItems}
            currentIndex={currentImageIndex}
            isOpen={viewerOpen}
            onClose={() => setViewerOpen(false)}
            onImageRename={handleImageRename}
            onImageDelete={handleImageDelete}
        />
      </div>
  );
}