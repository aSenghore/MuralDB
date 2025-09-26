import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'document';
  fileType: string; // e.g., 'jpg', 'pdf', 'docx'
  url: string;
  size: string;
  uploadDate: string;
  thumbnailUrl?: string;
  location: string; // e.g., 'References > Gallery Name' or 'Documents > Folder Name'
}

interface UploadContextType {
  uploads: UploadedFile[];
  addUpload: (file: UploadedFile) => void;
  removeUpload: (id: string) => void;
  getRecentUploads: (count: number) => UploadedFile[];
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<UploadedFile[]>([
    // Mock initial data
    {
      id: '1',
      name: 'sunset-landscape.jpg',
      type: 'image',
      fileType: 'jpg',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      size: '2.3 MB',
      uploadDate: '2024-12-08T10:30:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
      location: 'References > Nature'
    },
    {
      id: '2',
      name: 'Brand Guidelines.pdf',
      type: 'document',
      fileType: 'pdf',
      url: '/mock-doc.pdf',
      size: '4.1 MB',
      uploadDate: '2024-12-08T09:15:00Z',
      location: 'Documents > Design Specs'
    },
    {
      id: '3',
      name: 'architecture-modern.jpg',
      type: 'image',
      fileType: 'jpg',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=200&fit=crop',
      size: '1.8 MB',
      uploadDate: '2024-12-08T08:45:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=150&fit=crop',
      location: 'Art > Architecture'
    },
    {
      id: '4',
      name: 'Project Proposal.docx',
      type: 'document',
      fileType: 'docx',
      url: '/mock-doc.docx',
      size: '890 KB',
      uploadDate: '2024-12-08T08:00:00Z',
      location: 'Documents > Project Proposals'
    },
    {
      id: '5',
      name: 'watercolor-art.jpg',
      type: 'image',
      fileType: 'jpg',
      url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=200&fit=crop',
      size: '3.2 MB',
      uploadDate: '2024-12-07T16:20:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=150&h=150&fit=crop',
      location: 'Art > Digital Art'
    },
    {
      id: '6',
      name: 'User Research.pdf',
      type: 'document',
      fileType: 'pdf',
      url: '/mock-doc.pdf',
      size: '6.5 MB',
      uploadDate: '2024-12-07T15:30:00Z',
      location: 'Documents > Research'
    },
    {
      id: '7',
      name: 'mountain-landscape.jpg',
      type: 'image',
      fileType: 'jpg',
      url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=300&h=200&fit=crop',
      size: '2.7 MB',
      uploadDate: '2024-12-07T14:45:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=150&h=150&fit=crop',
      location: 'References > Landscapes'
    },
    {
      id: '8',
      name: 'Style Guide.pdf',
      type: 'document',
      fileType: 'pdf',
      url: '/mock-doc.pdf',
      size: '3.4 MB',
      uploadDate: '2024-12-07T13:15:00Z',
      location: 'Documents > Design Specs'
    },
    {
      id: '9',
      name: 'abstract-art.jpg',
      type: 'image',
      fileType: 'jpg',
      url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=300&h=200&fit=crop',
      size: '1.9 MB',
      uploadDate: '2024-12-07T12:00:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=150&h=150&fit=crop',
      location: 'Art > Abstract'
    }
  ]);

  const addUpload = (file: UploadedFile) => {
    setUploads(prev => [file, ...prev]);
  };

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  };

  const getRecentUploads = (count: number) => {
    return uploads
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
      .slice(0, count);
  };

  return (
    <UploadContext.Provider value={{ uploads, addUpload, removeUpload, getRecentUploads }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUploads() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUploads must be used within an UploadProvider');
  }
  return context;
}