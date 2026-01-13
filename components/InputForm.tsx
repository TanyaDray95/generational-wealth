import React, { useState, useRef, useCallback } from 'react';
import { parseFile } from '../services/fileParser';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import DocumentIcon from './icons/DocumentIcon';
import XCircleIcon from './icons/XCircleIcon';
import ErrorMessage from './ErrorMessage';

interface InputFormProps {
  onAnalyze: (text: string, originalFile?: File) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalysis = useCallback(async (selectedFile: File) => {
    setIsParsing(true);
    setFileError(null);
    try {
      const fileContent = await parseFile(selectedFile);
      // Even if fileContent is empty, we pass the original file to allow multimodal fallback
      onAnalyze(fileContent, selectedFile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during file parsing.';
      setFileError(errorMessage);
      setFile(null); // Clear the file on error
    } finally {
      setIsParsing(false);
    }
  }, [onAnalyze]);

  const handleFileSelect = (selectedFile: File | null) => {
    if (isLoading || isParsing) return;
    setFileError(null);
    if (selectedFile) {
        const allowedExtensions = ['pdf', 'docx', 'xlsx', 'xls', 'csv', 'txt'];
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
            setFileError('Invalid file type. Please upload a supported file.');
            return;
        }
        if (selectedFile.size > maxFileSize) {
            setFileError('File is too large. Maximum size is 10MB.');
            return;
        }
        setFile(selectedFile);
        handleAnalysis(selectedFile); // Trigger analysis automatically
    } else {
        setFile(null);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const showStatusView = isLoading || isParsing || file;

  return (
    <div className="p-4 sm:p-6 md:p-8 h-full flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full text-center">
        <div 
          style={{ animationDelay: '100ms' }} 
          className="animate-fade-in"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-text">Financial Analysis, Simplified</h1>
          <p 
            style={{ animationDelay: '200ms' }}
            className="mt-2 text-md sm:text-lg text-secondary-text animate-fade-in"
          >
            Upload your document, and let our AI provide you with a comprehensive dashboard and analysis.
          </p>
        </div>

        <div 
          style={{ animationDelay: '300ms' }}
          className="mt-8 bg-card rounded-xl shadow-lg border border-border p-6 sm:p-8 transition-all duration-300 animate-fade-in"
        >
          <div
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
            onDrop={onDrop}
            className={`relative w-full min-h-[16rem] rounded-lg border-2 border-dashed transition-all duration-300 ease-in-out flex flex-col justify-center items-center overflow-hidden
              ${isDragOver ? 'border-accent bg-accent-light/30 scale-105' : 'border-border'}
              ${showStatusView ? 'h-24 min-h-0' : ''}`}
          >
            {/* Uploader View */}
            <div className={`transition-opacity duration-300 ${showStatusView ? 'opacity-0' : 'opacity-100'}`}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 text-center cursor-pointer"
              >
                <div className={`transition-transform duration-300 ${isDragOver ? 'scale-110' : ''}`}>
                  <ArrowUpTrayIcon className={`w-12 h-12 mx-auto transition-colors duration-300 ${isDragOver ? 'text-accent' : 'text-gray-500'}`}/>
                </div>
                <p className="mt-4 font-medium text-primary-text">Click to upload or drag and drop</p>
                <p className="text-xs text-secondary-text mt-1">Supports PDF, DOCX, CSV, XLSX, and XLS</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                  accept=".csv,.xlsx,.xls,.pdf,.docx,.txt"
                  disabled={isLoading || isParsing}
                />
              </div>
            </div>

            {/* Status View */}
            <div className={`absolute top-0 left-0 w-full h-full p-4 transition-opacity duration-300 flex items-center ${showStatusView ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {file && (
                <div className="flex items-center w-full">
                    <DocumentIcon className="w-8 h-8 mr-4 text-accent flex-shrink-0"/>
                    <div className="flex-grow text-left">
                        <p className="text-sm font-medium text-primary-text truncate">{isLoading ? "Analyzing..." : isParsing ? "Reading file..." : file.name}</p>
                        <p className="text-xs text-secondary-text">{isLoading || isParsing ? 'Please wait, this may take a moment' : `${(file.size / 1024).toFixed(2)} KB`}</p>
                    </div>
                     {(isLoading || isParsing) ? (
                        <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-accent ml-4 flex-shrink-0"></div>
                     ) : (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                setFileError(null);
                                if(fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="ml-4 text-secondary-text hover:text-primary-text flex-shrink-0"
                        >
                           <XCircleIcon className="w-6 h-6"/>
                        </button>
                     )}
                </div>
              )}
            </div>
          </div>
        </div>

        {fileError && <div className="mt-4 animate-fade-in"><ErrorMessage title="File Error" message={fileError} /></div>}
      </div>
    </div>
  );
};

export default InputForm;
