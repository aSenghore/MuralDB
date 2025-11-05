import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { ReferencesPage } from './components/ReferencesPage';
import { ArtPhotosPage } from './components/ArtPhotosPage';
import { DocumentsPage } from './components/DocumentsPage';
import { ToolsPage } from './components/ToolsPage';
import { ResourcesPage } from './components/ResourcesPage';
import {CollaborationsPage} from './components/CollaborationsPage';
import { FolderDetail } from './components/FolderDetail';
import { LoginPage } from './components/LoginPage';
import { UserProfilePage } from './components/UserProfilePage';
import { UploadProvider } from './components/UploadContext';
import { TagProvider } from './components/TagContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';

type PageType = 'home' | 'references' | 'art' | 'documents' | 'tools' | 'resources' | 'public' | 'folder-detail' | 'login' | 'profile';

function AppContent() {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const handleNavigate = (page: string, id?: string, additionalParams?: { imageId?: string; documentId?: string }) => {
    if (page === 'folder-detail' && id) {
      setSelectedFolderId(id);
      setSelectedDocumentId(additionalParams?.documentId || null);
      setCurrentPage('folder-detail');
      setSelectedGalleryId(null);
      setSelectedImageId(null);
    } else if ((page === 'references' || page === 'art') && id) {
      // Navigate to a specific gallery
      setSelectedGalleryId(id);
      setSelectedImageId(additionalParams?.imageId || null);
      setCurrentPage(page as PageType);
      setSelectedFolderId(null);
      setSelectedDocumentId(null);
    } else if (page === 'documents' && id) {
      // Navigate to a specific document within a folder
      setSelectedFolderId(id);
      setSelectedDocumentId(additionalParams?.documentId || null);
      setCurrentPage('folder-detail');
      setSelectedGalleryId(null);
      setSelectedImageId(null);
    } else {
      setCurrentPage(page as PageType);
      setSelectedFolderId(null);
      setSelectedGalleryId(null);
      setSelectedImageId(null);
      setSelectedDocumentId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} user={currentUser} />;
      case 'references':
        return <ReferencesPage user={currentUser} selectedGalleryId={selectedGalleryId} selectedImageId={selectedImageId} />;
      case 'art':
        return <ArtPhotosPage user={currentUser} selectedGalleryId={selectedGalleryId} selectedImageId={selectedImageId} />;
      case 'documents':
        return <DocumentsPage onNavigate={handleNavigate} user={currentUser} />;
      case 'tools':
        return <ToolsPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'public':
        return <CollaborationsPage user={currentUser} />;
      case 'folder-detail':
        return selectedFolderId ? (
            <FolderDetail
                folderId={selectedFolderId}
                onNavigate={handleNavigate}
                user={currentUser}
                selectedDocumentId={selectedDocumentId}
            />
        ) : (
            <DocumentsPage onNavigate={handleNavigate} user={currentUser} />
        );
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'profile':
        return currentUser ? (
            <UserProfilePage user={currentUser} />
        ) : (
            <HomePage onNavigate={handleNavigate} user={currentUser} />
        );
      default:
        return <HomePage onNavigate={handleNavigate} user={currentUser} />;
    }
  };

  // If on login page, render it without the layout
  if (currentPage === 'login') {
    return (
        <TagProvider>
          <UploadProvider>
            <Toaster position="top-right" expand={true} richColors />
            {renderCurrentPage()}
          </UploadProvider>
        </TagProvider>
    );
  }

  return (
      <TagProvider>
        <UploadProvider>
          <Layout
              currentPage={currentPage}
              onNavigate={handleNavigate}
              user={currentUser}
              onLogout={handleLogout}
          >
            {renderCurrentPage()}
          </Layout>
        </UploadProvider>
      </TagProvider>
  );
}

export default function App() {
  return (
      <AuthProvider>
        <AppContent />
      </AuthProvider>
  );
}