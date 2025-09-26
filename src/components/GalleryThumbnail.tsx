import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface GalleryThumbnailProps {
  title: string;
  images: string[];
  imageCount: number;
  onClick: () => void;
}

export function GalleryThumbnail({ title, images, imageCount, onClick }: GalleryThumbnailProps) {
  // Show first 4 images in a grid
  const thumbnailImages = images.slice(0, 4);
  
  // Fill empty slots with placeholder if needed
  while (thumbnailImages.length < 4) {
    thumbnailImages.push('');
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-px bg-muted min-h-[5rem] sm:min-h-[8rem]">
          {thumbnailImages.map((image, index) => (
            <div 
              key={index} 
              className="aspect-square relative overflow-hidden bg-muted"
            >
              {image ? (
                <ImageWithFallback
                  src={image}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted-foreground/20 rounded"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="p-3 sm:p-4 gallery-info">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-card-foreground truncate text-sm sm:text-base">{title}</h3>
            <Badge variant="secondary" className="ml-2 text-xs sm:text-sm px-1.5 sm:px-2">
              {imageCount}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}