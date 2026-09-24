
import React, { useCallback, useState } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { readFileContent } from '../utils/fileUtils';
import { KnowledgeItem } from '../../types';

interface DropZoneProps {
  onFilesAdded: (files: KnowledgeItem[]) => void;
  compact?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded, compact = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFiles = async (files: FileList | File[]) => {
    setError(null);
    setIsProcessing(true);
    const validFiles: File[] = [];
    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (files.length > maxFiles) {
      setError(`Max ${maxFiles} files allowed at once.`);
      setIsProcessing(false);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds 5MB.`);
        setIsProcessing(false);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
        setIsProcessing(false);
        return;
    }

    try {
      const docs = await Promise.all(validFiles.map(readFileContent));
      const knowledgeItems: KnowledgeItem[] = docs.map(doc => ({
          id: doc.id,
          type: 'file',
          name: doc.name,
          content: doc.content,
          status: 'active',
          size: doc.size,
          dateAdded: Date.now()
      }));
      
      onFilesAdded(knowledgeItems);
    } catch (err) {
      setError("Failed to process files.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <div 
      className={`relative group rounded-xl border-2 border-dashed transition-all duration-200 ease-out text-center cursor-pointer overflow-hidden
        ${dragActive 
          ? 'border-brand-500 bg-brand-50' 
          : 'border-neutral-200 hover:border-brand-300 hover:bg-neutral-50 bg-white'
        }
        ${compact ? 'p-6' : 'p-10'}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
        accept=".txt,.md,.html"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className={`p-3 rounded-full transition-colors ${dragActive ? 'bg-brand-100' : 'bg-neutral-100 group-hover:bg-white shadow-sm'}`}>
          {isProcessing ? (
             <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
          ) : (
             <Upload className={`w-6 h-6 ${dragActive ? 'text-brand-600' : 'text-neutral-400 group-hover:text-brand-500'}`} />
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className={`font-semibold text-neutral-900 ${compact ? 'text-sm' : 'text-lg'}`}>
            {isProcessing ? 'Processing files...' : 'Upload Files'}
          </h3>
          <p className="text-xs text-neutral-500">
            .txt, .md, HTML (Max 5MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="absolute inset-x-0 bottom-0 p-2 bg-red-50 text-red-600 text-xs flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
};

export default DropZone;
