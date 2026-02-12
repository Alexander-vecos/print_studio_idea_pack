import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaTimes, FaDownload, FaCopy, FaCheck } from 'react-icons/fa';
import { useUIStore } from '../../../stores/uiStore';
import { base64ToUtf8, downloadBase64 } from '../../../utils/base64';

export const FileViewerModal: React.FC = () => {
  const { activeModal, viewingFile, closeModal } = useUIStore();
  const [copied, setCopied] = useState(false);

  const isVisible = activeModal === 'fileViewer' && !!viewingFile;

  const contentType = useMemo(() => {
    if (!viewingFile) return 'unknown';
    const type = viewingFile.type;
    
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'pdf';
    
    const codeTypes = [
      'text/', 'application/json', 'application/javascript', 
      'application/xml', 'application/x-httpd-php', 'text/css', 'text/plain'
    ];
    if (codeTypes.some(t => type.startsWith(t)) || type.includes('xml') || type.includes('json')) return 'code';
    
    return 'unknown';
  }, [viewingFile]);

  const codeContent = useMemo(() => {
    if (contentType === 'code' && viewingFile?.base64) {
      return base64ToUtf8(viewingFile.base64);
    }
    return '';
  }, [contentType, viewingFile]);

  const handleCopy = () => {
    if (codeContent) {
      navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isVisible || !viewingFile) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={closeModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full h-full sm:h-[90vh] sm:max-w-5xl bg-gray-900 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 z-10 pt-safe-top">
            <div className="flex flex-col min-w-0">
              <h3 className="text-white font-medium truncate max-w-[200px] sm:max-w-md">
                {viewingFile.name}
              </h3>
              <span className="text-xs text-gray-400">
                {(viewingFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => downloadBase64(viewingFile.base64, viewingFile.name)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Download"
              >
                <FaDownload />
              </button>
              <button 
                onClick={closeModal}
                className="p-2 text-gray-300 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-950 relative flex items-center justify-center">
            
            {contentType === 'image' && (
              <img 
                src={viewingFile.base64} 
                alt={viewingFile.name} 
                className="max-w-full max-h-full object-contain"
              />
            )}

            {contentType === 'code' && (
              <div className="w-full h-full text-sm relative">
                <button 
                  onClick={handleCopy}
                  className="absolute top-4 right-4 z-20 p-2 bg-gray-800/80 text-gray-300 rounded-md hover:bg-gray-700 backdrop-blur border border-gray-600 transition-all"
                >
                  {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                </button>
                
                <SyntaxHighlighter 
                  language="javascript"
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, height: '100%', fontSize: '14px', lineHeight: '1.5' }}
                  showLineNumbers={true}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
            )}

            {contentType === 'pdf' && (
              <iframe 
                src={viewingFile.base64} 
                className="w-full h-full border-none"
                title="PDF Viewer"
              />
            )}

            {contentType === 'unknown' && (
              <div className="text-center p-8">
                <p className="text-gray-400 mb-4">Preview not available for this file type.</p>
                <button 
                  onClick={() => downloadBase64(viewingFile.base64, viewingFile.name)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  Download File
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};