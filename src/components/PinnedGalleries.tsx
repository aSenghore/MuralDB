import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { GalleryThumbnail } from './GalleryThumbnail';
import { Pin, Folder as FolderIcon, Image, ArrowRight, Loader2 } from 'lucide-react';
import { galleryService, documentService } from '../services/firebaseService';
import { FirebaseGallery, FirebaseFolder } from '../types/firebase';
import { FileIcon, getFileTypeFromName } from './FileIcon';

interface User {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    screenName: string;
    profilePicture?: string;
}

interface PinnedGalleriesProps {
    onNavigate: (page: string, id?: string, additionalParams?: { imageId?: string; documentId?: string }) => void;
    user: User;
}

export function PinnedGalleries({ onNavigate, user }: PinnedGalleriesProps) {
    const [pinnedReferences, setPinnedReferences] = useState<FirebaseGallery[]>([]);
    const [pinnedArt, setPinnedArt] = useState<FirebaseGallery[]>([]);
    const [pinnedFolders, setPinnedFolders] = useState<FirebaseFolder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPinnedItems();
    }, [user]);

    const loadPinnedItems = async () => {
        try {
            const [references, art, folders] = await Promise.all([
                galleryService.getPinnedGalleries(user.uid, 'references'),
                galleryService.getPinnedGalleries(user.uid, 'art'),
                documentService.getPinnedFolders(user.uid)
            ]);

            setPinnedReferences(references);
            setPinnedArt(art);
            setPinnedFolders(folders);
        } catch (error) {
            console.error('Error loading pinned items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPinned = pinnedReferences.length + pinnedArt.length + pinnedFolders.length;

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto">
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
                            <p className="text-muted-foreground">Loading pinned items...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (totalPinned === 0) {
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-medium flex items-center gap-2">
                        <Pin className="h-6 w-6 text-primary" />
                        Pinned Items
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Quick access to your most important galleries and folders
                    </p>
                </div>
            </div>

            {/* Pinned References */}
            {pinnedReferences.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Image className="h-5 w-5 text-primary" />
                            Reference Galleries
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate('references')}
                            className="gap-2"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pinnedReferences.map((gallery) => (
                            <div key={gallery.id} className="relative">
                                <GalleryThumbnail
                                    title={gallery.name}
                                    images={gallery.images.map(img => img.downloadURL)}
                                    imageCount={gallery.images.length}
                                    onClick={() => onNavigate('references', gallery.id)}
                                    galleryId={gallery.id}
                                />
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md z-10 flex items-center gap-1">
                                    <Pin className="h-3 w-3 fill-current" />
                                    Pinned
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pinned Art Galleries */}
            {pinnedArt.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Image className="h-5 w-5 text-primary" />
                            Art Galleries
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate('art')}
                            className="gap-2"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pinnedArt.map((gallery) => (
                            <div key={gallery.id} className="relative">
                                <GalleryThumbnail
                                    title={gallery.name}
                                    images={gallery.images.map(img => img.downloadURL)}
                                    imageCount={gallery.images.length}
                                    onClick={() => onNavigate('art', gallery.id)}
                                    galleryId={gallery.id}
                                />
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md z-10 flex items-center gap-1">
                                    <Pin className="h-3 w-3 fill-current" />
                                    Pinned
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pinned Folders */}
            {pinnedFolders.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <FolderIcon className="h-5 w-5 text-primary" />
                            Document Folders
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate('documents')}
                            className="gap-2"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pinnedFolders.map((folder) => (
                            <div key={folder.id} className="relative">
                                <Card
                                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                                    onClick={() => onNavigate('folder-detail', folder.id)}
                                >
                                    <CardContent className="p-4">
                                        <div className="relative">
                                            <div className="w-full h-32 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                                                <FolderIcon className="h-16 w-16 text-muted-foreground" />
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                                {folder.documents.length} files
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardHeader className="pt-0">
                                        <CardTitle className="flex items-center gap-2">
                                            <FolderIcon className="h-5 w-5 text-primary" />
                                            {folder.name}
                                        </CardTitle>
                                        <CardDescription>{folder.description || 'Document folder'}</CardDescription>
                                    </CardHeader>
                                </Card>
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md z-10 flex items-center gap-1">
                                    <Pin className="h-3 w-3 fill-current" />
                                    Pinned
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
