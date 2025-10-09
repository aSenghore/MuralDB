import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Clock, Image, Download, ExternalLink, Loader2 } from 'lucide-react';
import { FileIcon, getFileTypeFromName } from './FileIcon';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ItemTags } from './ItemTags';
import { useTagContext } from './TagContext';
import { recentUploadsService } from '../services/firebaseService';
import { FirebaseImage, FirebaseDocument } from '../types/firebase';

interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  screenName: string;
  profilePicture?: string;
}

interface RecentUploadsProps {
  onNavigate?: (page: string, id?: string, additionalParams?: { imageId?: string; documentId?: string }) => void;
  user: User;
}

export function RecentUploads({ onNavigate, user }: RecentUploadsProps) {
  const { syncItemTags } = useTagContext();
  const [recentUploads, setRecentUploads] = useState<((FirebaseImage & { galleryType?: 'references' | 'art' }) | FirebaseDocument)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecentUploads = async () => {
      try {
        const uploads = await recentUploadsService.getRecentUploads(user.uid, 9);
        setRecentUploads(uploads);

        // Sync tags for recent uploads
        uploads.forEach(upload => {
          if (upload.tags && upload.tags.length > 0) {
            const itemType = 'galleryId' in upload ? 'image' : 'document';
            syncItemTags(upload.id, itemType, upload.tags);
          }
        });
      } catch (error) {
        console.error('Error loading recent uploads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentUploads();
  }, [user.uid]);

  const formatDate = (timestamp: any) => {
    const now = new Date();
    const uploadDate = timestamp.toDate();
    const diffInMinutes = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;

    return uploadDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: uploadDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getFileIcon = (file: FirebaseImage | FirebaseDocument) => {
    const isImage = 'uploadedAt' in file && file.type.startsWith('image/');

    if (isImage) {
      return (
          <ImageWithFallback
              src={file.downloadURL}
              alt={file.name}
              className="w-full h-full object-cover"
          />
      );
    } else {
      return <FileIcon fileType={getFileTypeFromName(file.name)} className="h-8 w-8" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = (file: FirebaseImage | FirebaseDocument, event: React.MouseEvent) => {
    event.stopPropagation();
    const link = document.createElement('a');
    link.href = file.downloadURL;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNavigateToLocation = (file: (FirebaseImage & { galleryType?: 'references' | 'art' }) | FirebaseDocument) => {
    if (!onNavigate) return;

    const isImage = 'uploadedAt' in file && file.type.startsWith('image/');
    if (isImage) {
      // Check gallery type to navigate to correct page
      const imageFile = file as FirebaseImage & { galleryType?: 'references' | 'art' };
      const targetPage = imageFile.galleryType === 'references' ? 'references' : 'art';
      // Navigate with gallery ID and image ID to open the specific gallery and select the image
      onNavigate(targetPage, imageFile.galleryId, { imageId: imageFile.id });
    } else {
      // For documents, navigate to the folder detail with the document selected
      const docFile = file as FirebaseDocument;
      onNavigate('documents', docFile.folderId, { documentId: docFile.id });
    }
  };

  if (isLoading) {
    return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Recent Uploads</CardTitle>
            </div>
            <CardDescription>Loading your recent uploads...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4 text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
    );
  }

  if (recentUploads.length === 0) {
    return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Recent Uploads</CardTitle>
            </div>
            <CardDescription>Your most recently uploaded files will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nothing uploaded yet. Get started!</p>
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Recent Uploads</CardTitle>
          </div>
          <CardDescription>Your 9 most recently uploaded files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentUploads.map((file) => (
                <div
                    key={file.id}
                    className="group relative border rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleNavigateToLocation(file)}
                >
                  {/* File preview */}
                  <div className="w-full h-24 bg-muted rounded-md border flex items-center justify-center mb-3 overflow-hidden">
                    {getFileIcon(file)}
                  </div>

                  {/* File info */}
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatDate('uploadedAt' in file ? file.uploadedAt : file["uploadedAt"])}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {'uploadedAt' in file && file.type.startsWith('image/') ? 'Gallery Image' : 'Document'}
                    </p>

                    {/* Tags */}
                    <div className="pt-1">
                      <ItemTags
                          itemId={file.id}
                          itemType={'uploadedAt' in file && file.type.startsWith('image/') ? 'image' : 'document'}
                          showAddButton={false}
                          size="sm"
                      />
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => handleDownload(file, e)}
                        className="h-7 w-7 p-0"
                        title="Download"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 w-7 p-0"
                        title="Go to location"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Type indicator */}
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-xs">
                      {'uploadedAt' in file && file.type.startsWith('image/') ? (
                          <Image className="h-3 w-3" />
                      ) : (
                          <FileIcon fileType={getFileTypeFromName(file.name)} className="h-3 w-3" />
                      )}
                      <span className="uppercase">
                    {'uploadedAt' in file && file.type.startsWith('image/') ? 'IMG' : getFileTypeFromName(file.name)}
                  </span>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
  );
}