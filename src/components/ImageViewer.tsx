import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Edit3,
  Check,
  Trash2
} from 'lucide-react';

interface ImageItem {
  url: string;
  name: string;
  id?: string;
}

interface ImageViewerProps {
  images: ImageItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onImageRename?: (index: number, newName: string) => void;
  onImageDelete?: (index: number) => void;
  showControls?: boolean;
}

export function ImageViewer({
                              images,
                              currentIndex,
                              isOpen,
                              onClose,
                              onImageRename,
                              onImageDelete,
                              showControls = true
                            }: ImageViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    setCurrentImageIndex(currentIndex);
    setZoom(1);
    setRotation(0);
    setIsEditingName(false);
  }, [currentIndex, isOpen]);

  useEffect(() => {
    if (images[currentImageIndex]) {
      setEditName(images[currentImageIndex].name);
    }
  }, [currentImageIndex, images]);

  const currentImage = images[currentImageIndex];

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setZoom(1);
      setRotation(0);
      setIsEditingName(false);
    }
  };

  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setZoom(1);
      setRotation(0);
      setIsEditingName(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  const handleNameSave = () => {
    if (editName.trim() && onImageRename) {
      onImageRename(currentImageIndex, editName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditName(currentImage?.name || '');
    setIsEditingName(false);
  };

  const handleDelete = () => {
    if (onImageDelete) {
      onImageDelete(currentImageIndex);
      // If this was the last image, close the viewer
      if (images.length === 1) {
        onClose();
      } else if (currentImageIndex === images.length - 1) {
        // If deleting the last image, go to previous
        setCurrentImageIndex(currentImageIndex - 1);
      }
    }
  };

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = currentImage.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditingName) {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
      }
    }
  };

  if (!currentImage) return null;

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
            className="max-w-6xl w-full h-[90vh] p-0 bg-black/95 border-none"
            onKeyDown={handleKeyDown}
        >
          <DialogTitle className="sr-only">
            {currentImage ? `Viewing ${currentImage.name}` : 'Image Viewer'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {currentImage ? `Image ${currentImageIndex + 1} of ${images.length}` : 'Image viewer with zoom and navigation controls'}
          </DialogDescription>
          <div className="relative w-full h-full flex flex-col">
            {/* Header with controls */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2 text-white">
                {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
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
                          className="text-white hover:bg-white/10"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleNameCancel}
                          className="text-white hover:bg-white/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{currentImage.name}</span>
                      {onImageRename && (
                          <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setIsEditingName(true)}
                              className="text-white hover:bg-white/10"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                      )}
                    </div>
                )}
                <span className="text-sm text-white/60">
                {currentImageIndex + 1} of {images.length}
              </span>
              </div>

              <div className="flex items-center gap-2">
                {showControls && (
                    <>
                      <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleDownload}
                          className="text-white hover:bg-white/10"
                          title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {onImageDelete && (
                          <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleDelete}
                              className="text-white hover:bg-red-500/20"
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
                    className="text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Main image area */}
            <div className="flex-1 flex items-center justify-center p-4 pt-16 pb-20 overflow-auto">
              <div
                  className="relative transition-transform duration-200 ease-in-out"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center'
                  }}
              >
                <ImageWithFallback
                    src={currentImage.url}
                    alt={currentImage.name}
                    className="max-h-[calc(90vh-12rem)] w-auto object-contain"
                    style={{ display: 'block' }}
                />
              </div>
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
                <>
                  <Button
                      size="lg"
                      variant="ghost"
                      onClick={handlePrevious}
                      disabled={currentImageIndex === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                      size="lg"
                      variant="ghost"
                      onClick={handleNext}
                      disabled={currentImageIndex === images.length - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
            )}

            {/* Bottom controls */}
            {showControls && (
                <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center items-center p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-2 bg-black/50 rounded-lg p-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleZoomOut}
                        disabled={zoom <= 0.25}
                        className="text-white hover:bg-white/10"
                        title="Zoom Out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-white text-sm min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleZoomIn}
                        disabled={zoom >= 3}
                        className="text-white hover:bg-white/10"
                        title="Zoom In"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-white/20 mx-2" />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRotate}
                        className="text-white hover:bg-white/10"
                        title="Rotate"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
}