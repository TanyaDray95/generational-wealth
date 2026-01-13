import React, { useState, useRef, useEffect } from 'react';
import { exportAsPNG, exportAsPDF, exportAsDOCX } from '../services/exportService';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';

interface ExportButtonProps {
  dashboardRef: React.RefObject<HTMLDivElement>;
  filename: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ dashboardRef, filename }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (exportType: 'png' | 'pdf' | 'docx') => {
    if (!dashboardRef.current) return;
    
    setIsLoading(true);
    setIsOpen(false);
    try {
      switch (exportType) {
        case 'png':
          await exportAsPNG(dashboardRef.current, filename);
          break;
        case 'pdf':
          await exportAsPDF(dashboardRef.current, filename);
          break;
        case 'docx':
          await exportAsDOCX(dashboardRef.current, filename);
          break;
      }
    } catch (error) {
      console.error(`Failed to export as ${exportType}`, error);
      alert(`An error occurred while exporting the file. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
            if (!isLoading) {
                setIsOpen(!isOpen)
            }
        }}
        disabled={isLoading}
        className="flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Export
          </>
        )}
      </button>
      {isOpen && !isLoading && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-50 animate-fade-in">
          <button onClick={() => handleExport('pdf')} className="w-full text-left block px-4 py-2 text-sm text-primary-text hover:bg-border cursor-pointer">Export as PDF</button>
          <button onClick={() => handleExport('png')} className="w-full text-left block px-4 py-2 text-sm text-primary-text hover:bg-border cursor-pointer">Export as Image (PNG)</button>
          <button onClick={() => handleExport('docx')} className="w-full text-left block px-4 py-2 text-sm text-primary-text hover:bg-border cursor-pointer">Export as Word</button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
