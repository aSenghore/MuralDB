import * as React from 'react';
import { useRef } from 'react';
import { Button } from './ui/button';
import { Upload, Image, FileText } from 'lucide-react';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  type?: 'image' | 'document' | 'both';
  className?: string;
}

export function FileUpload({ 
  onFilesUploaded, 
  accept = "image/*", 
  multiple = true, 
  type = 'image',
  className = ""
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptString = () => {
    switch (type) {
      case 'image':
        return 'image/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.rtf,.odt';
      case 'both':
        return 'image/*,.pdf,.doc,.docx,.txt,.rtf,.odt';
      default:
        return accept;
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'image':
        return 'Upload Images';
      case 'document':
        return 'Upload Documents';
      case 'both':
        return 'Upload Files';
      default:
        return 'Upload Images';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'both':
        return <Upload className="h-4 w-4" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFilesUploaded(files);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      onFilesUploaded(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptString()}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            {getIcon()}
          </div>
          <div>
            <p className="font-medium mb-1">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground mb-4">
              {type === 'image' && 'Supports JPG, PNG, GIF, WebP'}
              {type === 'document' && 'Supports PDF, DOC, DOCX, TXT'}
              {type === 'both' && 'Supports images and documents'}
            </p>
            <Button
              onClick={handleClick}
              variant="outline"
              className="gap-2"
            >
              {getIcon()}
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}