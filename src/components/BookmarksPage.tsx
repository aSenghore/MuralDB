import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bookmark, BookOpen, Image as ImageIcon, Folder, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { bookmarkService, galleryService, documentService } from '../services/firebaseService';
import { FirebaseBookmark, FirebaseGallery, FirebaseFolder } from '../types/firebase';
import { GalleryThumbnail } from './GalleryThumbnail';
import { GalleryDetail } from './GalleryDetail';
import { FolderDetail } from './FolderDetail';

interface User {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    screenName: string;
    profilePicture?: string;
}

interface BookmarksPageProps {
    user: User | null;
}

interface BookmarkedGallery extends FirebaseGallery {
    bookmarkId: string;
}

interface BookmarkedFolder extends FirebaseFolder {
    bookmarkId: string;
}

export function BookmarksPage({ user }: BookmarksPageProps) {
    const [bookmarkedGalleries, setBookmarkedGalleries] = useState<BookmarkedGallery[]>([]);
    const [bookmarkedFolders, setBookmarkedFolders] = useState<BookmarkedFolder[]>([]);
    const [selectedGallery, setSelectedGallery] = useState<FirebaseGallery | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<FirebaseFolder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadBookmarks();
        }
    }, [user]);

    const loadBookmarks = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const bookmarks = await bookmarkService.getUserBookmarks(user.uid);

            // Separate gallery and folder bookmarks
            const galleryBookmarks = bookmarks.filter(b => b.itemType === 'gallery');
            const folderBookmarks = bookmarks.filter(b => b.itemType === 'folder');

            // Load gallery data
            const galleriesData: BookmarkedGallery[] = [];
            for (const bookmark of galleryBookmarks) {
                try {
                    const galleries = await galleryService.getUserGalleries(bookmark.ownerUserId);
                    const gallery = galleries.find(g => g.id === bookmark.itemId);
                    if (gallery && gallery.showcasePinned) {
                        galleriesData.push({
                            ...gallery,
                            bookmarkId: bookmark.id
                        });
                    } else {
                        // Gallery no longer exists or is not showcase pinned, remove bookmark
                        await bookmarkService.deleteBookmark(user.uid, bookmark.itemId);
                    }
                } catch (error) {
                    console.error('Error loading gallery:', error);
                }
            }

            // Load folder data
            const foldersData: BookmarkedFolder[] = [];
            for (const bookmark of folderBookmarks) {
                try {
                    const folders = await documentService.getUserFolders(bookmark.ownerUserId);
                    const folder = folders.find(f => f.id === bookmark.itemId);
                    if (folder && folder.showcasePinned) {
                        foldersData.push({
                            ...folder,
                            bookmarkId: bookmark.id
                        });
                    } else {
                        // Folder no longer exists or is not showcase pinned, remove bookmark
                        await bookmarkService.deleteBookmark(user.uid, bookmark.itemId);
                    }
                } catch (error) {
                    console.error('Error loading folder:', error);
                }
            }

            setBookmarkedGalleries(galleriesData);
            setBookmarkedFolders(foldersData);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            toast.error('Failed to load bookmarks');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (itemId: string) => {
        if (!user) return;

        try {
            await bookmarkService.deleteBookmark(user.uid, itemId);
            await loadBookmarks();
            toast.success('Bookmark removed');
        } catch (error) {
            console.error('Error removing bookmark:', error);
            toast.error('Failed to remove bookmark');
        }
    };

    if (!user) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="text-center space-y-4 py-12">
                    <Bookmark className="h-16 w-16 mx-auto text-muted-foreground" />
                    <h2 className="text-2xl font-medium">Sign In Required</h2>
                    <p className="text-muted-foreground">
                        Please sign in to view your bookmarks.
                    </p>
                </div>
            </div>
        );
    }

    const referenceGalleries = bookmarkedGalleries.filter(g => g.type === 'references');
    const artGalleries = bookmarkedGalleries.filter(g => g.type === 'art');

    // No-op handlers for read-only mode
    const handleNoOp = () => {
        toast.error('This is a bookmarked gallery. Visit the owner\'s page to edit it.');
    };

    // Render selected gallery or folder
    if (selectedGallery) {
        return (
            <GalleryDetail
                title={selectedGallery.name}
                images={selectedGallery.images.map(img => img.downloadURL)}
                imageNames={selectedGallery.images.map(img => img.name)}
                imageIds={selectedGallery.images.map(img => img.id)}
                galleryId={selectedGallery.id}
                onBack={() => setSelectedGallery(null)}
                onFilesUploaded={handleNoOp}
                onDeleteImage={handleNoOp}
                onTitleChange={undefined}
                selectedImageId={null}
                readOnly={true}
            />
        );
    }

    if (selectedFolder) {
        return (
            <FolderDetail
                folderId={selectedFolder.id}
                onNavigate={() => setSelectedFolder(null)}
                user={user}
                selectedDocumentId={null}
                readOnly={true}
                ownerUserId={selectedFolder.userId}
            />
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {(
                <>
                    {/* Page Header */}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-medium text-foreground flex items-center gap-2">
                            <Bookmark className="h-8 w-8 text-yellow-600" />
                            Bookmarks
                        </h1>
                        <p className="text-muted-foreground">
                            Your saved showcase galleries and folders
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading bookmarks...</p>
                        </div>
                    ) : (
                        <Tabs defaultValue="references" className="w-full">
                            <TabsList>
                                <TabsTrigger value="references" className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    References ({referenceGalleries.length})
                                </TabsTrigger>
                                <TabsTrigger value="art" className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    Art ({artGalleries.length})
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="flex items-center gap-2">
                                    <Folder className="h-4 w-4" />
                                    Documents ({bookmarkedFolders.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="references" className="mt-6">
                                {referenceGalleries.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {referenceGalleries.map((gallery) => (
                                            <div key={gallery.id} className="relative">
                                                <GalleryThumbnail
                                                    title={gallery.name}
                                                    images={gallery.images.map(img => img.downloadURL)}
                                                    imageCount={gallery.images.length}
                                                    onClick={() => setSelectedGallery(gallery)}
                                                    galleryId={gallery.id}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="absolute top-2 right-2 h-8 w-8 p-0 border-2 z-10"
                                                    style={{
                                                        backgroundColor: '#ca8a04',
                                                        borderColor: '#ca8a04',
                                                        color: 'white'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveBookmark(gallery.id);
                                                    }}
                                                    title="Remove bookmark"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                                            <p className="text-muted-foreground">No bookmarked reference galleries</p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Visit the Public page to bookmark showcase galleries
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="art" className="mt-6">
                                {artGalleries.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {artGalleries.map((gallery) => (
                                            <div key={gallery.id} className="relative">
                                                <GalleryThumbnail
                                                    title={gallery.name}
                                                    images={gallery.images.map(img => img.downloadURL)}
                                                    imageCount={gallery.images.length}
                                                    onClick={() => setSelectedGallery(gallery)}
                                                    galleryId={gallery.id}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="absolute top-2 right-2 h-8 w-8 p-0 border-2 z-10"
                                                    style={{
                                                        backgroundColor: '#ca8a04',
                                                        borderColor: '#ca8a04',
                                                        color: 'white'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveBookmark(gallery.id);
                                                    }}
                                                    title="Remove bookmark"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                                            <p className="text-muted-foreground">No bookmarked art galleries</p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Visit the Public page to bookmark showcase galleries
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="documents" className="mt-6">
                                {bookmarkedFolders.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {bookmarkedFolders.map((folder) => (
                                            <Card
                                                key={folder.id}
                                                className="relative cursor-pointer hover:shadow-lg transition-shadow"
                                                onClick={() => setSelectedFolder(folder)}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Folder className="h-5 w-5 text-primary" />
                                                        {folder.name}
                                                    </CardTitle>
                                                    {folder.description && (
                                                        <CardDescription>{folder.description}</CardDescription>
                                                    )}
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground">
                                                        {folder.documents.length} {folder.documents.length === 1 ? 'document' : 'documents'}
                                                    </p>
                                                </CardContent>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="absolute top-2 right-2 h-8 w-8 p-0 border-2 z-10"
                                                    style={{
                                                        backgroundColor: '#ca8a04',
                                                        borderColor: '#ca8a04',
                                                        color: 'white'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveBookmark(folder.id);
                                                    }}
                                                    title="Remove bookmark"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <Folder className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                                            <p className="text-muted-foreground">No bookmarked document folders</p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Visit the Public page to bookmark showcase folders
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </>
            )}
        </div>
    );
}
