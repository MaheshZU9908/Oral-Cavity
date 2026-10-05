import React, { useRef, useState } from 'react';
import { UploadCloud, FileImage, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  maxSizeBytes?: number;
  acceptedExtensions?: string[];
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  selectedFile,
  maxSizeBytes = 50 * 1024 * 1024, // 50MB
  acceptedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.svs'],
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!acceptedExtensions.includes(ext) && !file.type.startsWith('image/')) {
      setErrorMsg(`Unsupported file type (${ext}). Please provide a histology biopsy image (PNG, JPEG, TIFF, WebP).`);
      return;
    }

    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      setErrorMsg(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${maxMb} MB.`);
      return;
    }

    // Create preview
    if (file.type.startsWith('image/') || ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setErrorMsg(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={acceptedExtensions.join(',')}
        className="hidden"
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
            isDragOver
              ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-teal-600/70 hover:bg-slate-50/80 bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="p-3.5 bg-teal-50 text-teal-700 rounded-full mb-3 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            Click to upload or drag & drop biopsy slide
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Accepts Whole Slide Images / Histopathology sections (JPEG, PNG, TIFF, WebP, SVS). Maximum size 50 MB.
          </p>
          <Button variant="outline" size="sm" className="mt-4 pointer-events-none">
            Select Histology Image
          </Button>
        </div>
      ) : (
        <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-4">
            {/* Image Preview Box */}
            <div className="w-28 h-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center relative group">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Biopsy slide preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileImage className="w-10 h-10 text-slate-400" />
              )}
            </div>

            {/* Metadata Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                  Ready for MIL Analysis
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 truncate mt-1">
                {selectedFile.name}
              </h4>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                <span>Size: {formatFileSize(selectedFile.size)}</span>
                <span>Type: {selectedFile.type || 'image/histology'}</span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  Replace File
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-rose-600 hover:bg-rose-50"
                  disabled={disabled}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-rose-600 font-medium mt-2 bg-rose-50 border border-rose-100 p-2.5 rounded-lg animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
