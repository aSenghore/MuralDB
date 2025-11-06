import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Cloud, Search, BookOpen, Image as ImageIcon, Folder, Bookmark, X, Loader2} from 'lucide-react';
import { toast } from 'sonner';
import { showcaseService, bookmarkService, galleryService } from '../services/firebaseService';
import { FirebaseGallery, FirebaseFolder } from '../types/firebase';
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

interface PublicGalleriesPageProps {
    user: User | null;
}

export function PublicGalleriesPage({ user }: PublicGalleriesPageProps) {
    const [referenceGalleries, setReferenceGalleries] = useState<FirebaseGallery[]>([]);
    const [artGalleries, setArtGalleries] = useState<FirebaseGallery[]>([]);
    const [folders, setFolders] = useState<FirebaseFolder[]>([]);
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGallery, setSelectedGallery] = useState<FirebaseGallery | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<FirebaseFolder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShowcaseItems();
        if (user) {
            loadBookmarks();
        }
    }, [user]);

    const loadShowcaseItems = async () => {
        try {
            setLoading(true);
            const [references, art, allFolders] = await Promise.all([
                showcaseService.getAllShowcaseGalleries('references'),
                showcaseService.getAllShowcaseGalleries('art'),
                showcaseService.getAllShowcaseFolders()
            ]);

            setReferenceGalleries(references);
            setArtGalleries(art);
            setFolders(allFolders);
        } catch (error) {
            console.error('Error loading showcase items:', error);
            toast.error('Failed to load showcase galleries');
        } finally {
            setLoading(false);
        }
    };

    const loadBookmarks = async () => {
        if (!user) return;

        try {
            const bookmarks = await bookmarkService.getUserBookmarks(user.uid);
            const ids = new Set(bookmarks.map(b => b.itemId));
            setBookmarkedIds(ids);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }
    };

    const handleToggleBookmark = async (itemId: string, itemType: 'gallery' | 'folder', ownerUserId: string) => {
        if (!user) {
            toast.error('Please sign in to bookmark items');
            return;
        }

        try {
            if (bookmarkedIds.has(itemId)) {
                await bookmarkService.deleteBookmark(user.uid, itemId);
                toast.success('Bookmark removed');
            } else {
                await bookmarkService.createBookmark(user.uid, itemId, itemType, ownerUserId);
                toast.success('Bookmark added!');
            }
            await loadBookmarks();
        } catch (error: any) {
            console.error('Error toggling bookmark:', error);
            toast.error(error.message || 'Failed to update bookmark');
        }
    };



    const filterItems = <T extends { name: string; description?: string }>(items: T[]): T[] => {
        if (!searchTerm.trim()) return items;

        const term = searchTerm.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(term) ||
            (item.description && item.description.toLowerCase().includes(term))
        );
    };

    const filteredReferenceGalleries = filterItems(referenceGalleries);
    const filteredArtGalleries = filterItems(artGalleries);
    const filteredFolders = filterItems(folders);

    // No-op handlers for read-only mode
    const handleNoOp = () => {
        toast.error('This is a public gallery. You cannot edit it.');
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
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-medium text-foreground flex items-center gap-2">
                                <Cloud className="h-8 w-8 text-primary" />
                                Public Showcase
                            </h1>
                            <p className="text-muted-foreground">
                                Discover showcase galleries and folders from the community
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search galleries and folders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading showcase items...</p>
                        </div>
                    ) : (
                        <Tabs defaultValue="references" className="w-full">
                            <TabsList>
                                <TabsTrigger value="references" className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Reference Boards ({filteredReferenceGalleries.length})
                                </TabsTrigger>
                                <TabsTrigger value="art" className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    Art Boards ({filteredArtGalleries.length})
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="flex items-center gap-2">
                                    <Folder className="h-4 w-4" />
                                    Document Boards ({filteredFolders.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="references" className="mt-6">
                                {filteredReferenceGalleries.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredReferenceGalleries.map((gallery) => (
                                            <div key={gallery.id} className="relative">
                                                <GalleryThumbnail
                                                    title={gallery.name}
                                                    images={gallery.images.map(img => img.downloadURL)}
                                                    imageCount={gallery.images.length}
                                                    onClick={() => setSelectedGallery(gallery)}
                                                    galleryId={gallery.id}
                                                />
                                                <div className="absolute top-2 left-2 z-10">
                                                    <div
                                                        className="text-xs px-2 py-1 rounded-md"
                                                        style={{
                                                            backgroundColor: '#dc2626',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        Showcase
                                                    </div>
                                                </div>
                                                {user && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="absolute top-2 right-2 h-8 w-8 p-0 border-2 z-10"
                                                        style={bookmarkedIds.has(gallery.id) ? {
                                                            backgroundColor: '#ca8a04',
                                                            borderColor: '#ca8a04',
                                                            color: 'white'
                                                        } : {
                                                            borderColor: '#fde047',
                                                            color: '#ca8a04',
                                                            backgroundColor: 'white'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleBookmark(gallery.id, 'gallery', gallery.userId);
                                                        }}
                                                        title={bookmarkedIds.has(gallery.id) ? 'Remove bookmark' : 'Bookmark'}
                                                    >
                                                        {bookmarkedIds.has(gallery.id) ? (
                                                            <X className="h-4 w-4" />
                                                        ) : (
                                                            <Bookmark className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                                            <p className="text-muted-foreground">
                                                {searchTerm ? 'No reference galleries match your search' : 'No showcase reference galleries yet'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="art" className="mt-6">
                                {filteredArtGalleries.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredArtGalleries.map((gallery) => (
                                            <div key={gallery.id} className="relative">
                                                <GalleryThumbnail
                                                    title={gallery.name}
                                                    images={gallery.images.map(img => img.downloadURL)}
                                                    imageCount={gallery.images.length}
                                                    onClick={() => setSelectedGallery(gallery)}
                                                    galleryId={gallery.id}
                                                />
                                                <div className="absolute top-2 left-2 z-10">
                                                    <div
                                                        className="text-xs px-2 py-1 rounded-md"
                                                        style={{
                                                            backgroundColor: '#dc2626',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        Showcase
                                                    </div>
                                                </div>
                                                {user && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="absolute top-2 right-2 h-8 w-8 p-0 border-2 z-10"
                                                        style={bookmarkedIds.has(gallery.id) ? {
                                                            backgroundColor: '#ca8a04',
                                                            borderColor: '#ca8a04',
                                                            color: 'white'
                                                        } : {
                                                            borderColor: '#fde047',
                                                            color: '#ca8a04',
                                                            backgroundColor: 'white'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleBookmark(gallery.id, 'gallery', gallery.userId);
                                                        }}
                                                        title={bookmarkedIds.has(gallery.id) ? 'Remove bookmark' : 'Bookmark'}
                                                    >
                                                        {bookmarkedIds.has(gallery.id) ? (
                                                            <X className="h-4 w-4" />
                                                        ) : (
                                                            <Bookmark className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                                            <p className="text-muted-foreground">
                                                {searchTerm ? 'No art galleries match your search' : 'No showcase art galleries yet'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="documents" className="mt-6">
                                {filteredFolders.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredFolders.map((folder) => (
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
                                                <div className="absolute top-2 left-2 z-10">
                                                    <div
                                                        className="text-xs px-2 py-1 rounded-md"
                                                        style={{
                                                            backgroundColor: '#dc2626',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        Showcase
                                                    </div>
                                                </div>
                                                {user && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="absolute top-2 right-2 h-8 w-8 p-0 border-2 z-10"
                                                        style={bookmarkedIds.has(folder.id) ? {
                                                            backgroundColor: '#ca8a04',
                                                            borderColor: '#ca8a04',
                                                            color: 'white'
                                                        } : {
                                                            borderColor: '#fde047',
                                                            color: '#ca8a04',
                                                            backgroundColor: 'white'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleBookmark(folder.id, 'folder', folder.userId);
                                                        }}
                                                        title={bookmarkedIds.has(folder.id) ? 'Remove bookmark' : 'Bookmark'}
                                                    >
                                                        {bookmarkedIds.has(folder.id) ? (
                                                            <X className="h-4 w-4" />
                                                        ) : (
                                                            <Bookmark className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <Folder className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                                            <p className="text-muted-foreground">
                                                {searchTerm ? 'No document folders match your search' : 'No showcase document folders yet'}
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
