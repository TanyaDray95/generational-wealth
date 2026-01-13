
import React, { useEffect, useState } from 'react';
import { fetchReports, deleteReport, SavedReport } from '../services/databaseService';
import DocumentIcon from './icons/DocumentIcon';
import XCircleIcon from './icons/XCircleIcon';
import { FinancialPerformanceData } from '../types';

interface DocumentsViewProps {
  onSelectReport: (report: FinancialPerformanceData) => void;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ onSelectReport }) => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (err) {
      setError('Failed to load documents from database.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await deleteReport(id);
      setReports(reports.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete report.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-accent"></div>
        <p className="mt-4 text-secondary-text">Loading reports from database...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-secondary-text">
        <DocumentIcon className="w-12 h-12 mb-4 text-secondary-text/30"/>
        <p className="text-lg font-medium">No saved documents found</p>
        <p className="text-sm mt-1">Reports you analyze and save will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
      <h2 className="text-xl font-bold text-primary-text mb-6">Saved Reports</h2>
      <div className="grid gap-4">
        {reports.map((report) => (
          <div 
            key={report.id}
            onClick={() => onSelectReport(report.data)}
            className="group flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:border-accent hover:shadow-md transition-all cursor-pointer animate-fade-in"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center text-accent">
                <DocumentIcon className="w-6 h-6"/>
              </div>
              <div>
                <h3 className="font-bold text-primary-text">{report.title}</h3>
                <div className="flex items-center gap-2 text-xs text-secondary-text">
                  <span>As of: {report.as_of_date}</span>
                  <span>•</span>
                  <span>Saved: {new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={(e) => handleDelete(e, report.id)}
              className="p-2 text-secondary-text hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XCircleIcon className="w-5 h-5"/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsView;
