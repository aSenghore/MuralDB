import React from 'react';
import { 
  FileText, 
  File, 
  Image, 
  Video, 
  Music,
  Archive,
  Code,
  Database
} from 'lucide-react';

interface FileIconProps {
  fileType: string;
  className?: string;
}

export function FileIcon({ fileType, className = "h-8 w-8 text-primary" }: FileIconProps) {
  const getIconByType = (type: string) => {
    const lowerType = type.toLowerCase();
    
    // PDF files - Red color for PDFs
    if (lowerType === 'pdf') {
      return <FileText className={className} style={{ color: '#dc2626' }} />;
    }
    
    // Microsoft Office documents - Blue color for Word docs
    if (['doc', 'docx'].includes(lowerType)) {
      return <File className={className} style={{ color: '#2563eb' }} />;
    }
    
    // Spreadsheets - Green color for Excel/CSV
    if (['xls', 'xlsx', 'csv'].includes(lowerType)) {
      return <File className={className} style={{ color: '#16a34a' }} />;
    }
    
    // Presentations - Orange color for PowerPoint
    if (['ppt', 'pptx'].includes(lowerType)) {
      return <File className={className} style={{ color: '#ea580c' }} />;
    }
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(lowerType)) {
      return <Image className={className} style={{ color: '#7c3aed' }} />;
    }
    
    // Videos
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(lowerType)) {
      return <Video className={className} style={{ color: '#e11d48' }} />;
    }
    
    // Audio
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(lowerType)) {
      return <Music className={className} style={{ color: '#059669' }} />;
    }
    
    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(lowerType)) {
      return <Archive className={className} style={{ color: '#92400e' }} />;
    }
    
    // Code files
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go'].includes(lowerType)) {
      return <Code className={className} style={{ color: '#1f2937' }} />;
    }
    
    // Database files
    if (['sql', 'db', 'sqlite', 'mdb'].includes(lowerType)) {
      return <Database className={className} style={{ color: '#374151' }} />;
    }
    
    // Text files
    if (['txt', 'rtf', 'md'].includes(lowerType)) {
      return <FileText className={className} style={{ color: '#6b7280' }} />;
    }
    
    // Default file icon
    return <File className={className} />;
  };

  return getIconByType(fileType);
}

// Helper function to get file type from filename
export function getFileTypeFromName(filename: string): string {
  const extension = filename.split('.').pop();
  return extension ? extension.toLowerCase() : '';
}

// Helper function to get file icon with proper styling
export function getFileIconWithStyle(fileType: string, size: 'sm' | 'md' | 'lg' = 'md') {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-16 w-16'
  };

  return <FileIcon fileType={fileType} className={sizeClasses[size]} />;
}