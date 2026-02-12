import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../../stores/uiStore';
import { useFileStore } from '../../../stores/fileStore';
import { useAuthStore } from '../../../stores/authStore';
import { firestoreAdapter } from '../../../firebase/firestoreAdapter';
import { FaCloudUploadAlt, FaTimes, FaFile, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface UploadItem {
  file: File;
  status: 'pending' | 'reading' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

const readFileAsBase64 = (file: File, onProgress: (percent: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 50);
        onProgress(percent);
      }
    };
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const FileUploadModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const { isLoading, setLoading, clearError } = useFileStore();
  const { user } = useAuthStore();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const isVisible = activeModal === 'fileUpload';

  const handleFilesAdded = (files: FileList | null) => {
    if (!files) return;
    const newUploads: UploadItem[] = Array.from(files).map(file => ({
      file,
      status: 'pending',
      progress: 0
    }));
    setUploads(prev => [...prev, ...newUploads]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setUploads(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFilesAdded(event.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!user) return;
    setLoading(true);
    clearError();

    for (let i = 0; i < uploads.length; i++) {
      if (uploads[i].status === 'done') continue;

      // Update status to reading
      setUploads(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'reading', progress: 0 } : item));

      try {
        // 1. Read File (0-50%)
        const base64 = await readFileAsBase64(uploads[i].file, (p) => {
          setUploads(prev => prev.map((item, idx) => idx === i ? { ...item, progress: p } : item));
        });

        // 2. Upload to Firestore (50-100%)
        setUploads(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'uploading', progress: 50 } : item));

        await firestoreAdapter.addFile({
          name: uploads[i].file.name,
          type: uploads[i].file.type,
          size: uploads[i].file.size,
          base64: base64,
          uploadedBy: user.uid
        });

        setUploads(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'done', progress: 100 } : item));
      } catch (err: any) {
        console.error("Upload failed:", err);
        setUploads(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', error: 'Upload failed' } : item));
      }
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setUploads([]);
    closeModal();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Upload Files</h3>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1">
            {/* Dropzone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <FaCloudUploadAlt className="text-4xl text-blue-500 mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Drag and drop files here or click to select
              </p>
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => handleFilesAdded(e.target.files)} />
            </div>

            {/* File List */}
            {uploads.length > 0 && (
              <div className="mt-6 space-y-3">
                {uploads.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded text-blue-500">
                      <FaFile />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={item.file.name}>
                          {item.file.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {item.status === 'error' ? 'Error' : `${item.progress}%`}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          className={`h-full ${item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
                        />
                      </div>
                      {item.error && <p className="text-xs text-red-500 mt-1">{item.error}</p>}
                    </div>
                    
                    <button onClick={() => handleRemoveFile(idx)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                      {item.status === 'done' ? <FaCheckCircle className="text-green-500" /> : <FaTimes />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={handleUpload}
              disabled={uploads.length === 0 || isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading 
                ? 'Uploading...' 
                : `Upload ${uploads.length} ${uploads.length === 1 ? 'file' : 'files'}`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};