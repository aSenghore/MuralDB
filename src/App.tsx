import * as React from 'react';
import { useState } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { ReferencesPage } from './components/ReferencesPage';
import { ArtPhotosPage } from './components/ArtPhotosPage';
import { DocumentsPage } from './components/DocumentsPage';
import { ToolsPage } from './components/ToolsPage';
import { ResourcesPage } from './components/ResourcesPage';
import { FolderDetail } from './components/FolderDetail';
import { LoginPage } from './components/LoginPage';
import { UserProfilePage } from './components/UserProfilePage';
import { UploadProvider } from './components/UploadContext';
import { TagProvider } from './components/TagContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type PageType = 'home' | 'references' | 'art' | 'documents' | 'tools' | 'resources' | 'folder-detail' | 'login' | 'profile';

function AppContent() {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleNavigate = (page: string, folderId?: string) => {
    if (page === 'folder-detail' && folderId) {
      setSelectedFolderId(folderId);
      setCurrentPage('folder-detail');
    } else {
      setCurrentPage(page as PageType);
      setSelectedFolderId(null);
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
        return <ReferencesPage user={currentUser} />;
      case 'art':
        return <ArtPhotosPage user={currentUser} />;
      case 'documents':
        return <DocumentsPage onNavigate={handleNavigate} user={currentUser} />;
      case 'tools':
        return <ToolsPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'folder-detail':
        let element = selectedFolderId ? (
            <FolderDetail
                folderId={selectedFolderId}
                onNavigate={handleNavigate}
                //@ts-ignore
                user={currentUser}
            />
        ) : (
            <DocumentsPage onNavigate={handleNavigate} user={currentUser} />
        );
        return element;
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
            onLogout={handleLogout}       >
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