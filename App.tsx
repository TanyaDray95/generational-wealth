
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FinancialPerformanceData, ChatMessage, View } from './types';
import { generatePerformanceData, generateChatResponse } from './services/geminiService';
import InputForm from './components/InputForm';
import ErrorMessage from './components/ErrorMessage';
import Logo from './components/icons/Logo';
import BottomNavBar from './components/BottomNavBar';
import PerformanceDashboard from './components/PerformanceDashboard';
import ChatView from './components/ChatView';
import DocumentsView from './components/DocumentsView';
import UserCircleIcon from './components/icons/UserCircleIcon';
import { fileToBase64 } from './services/fileParser';
import { Part } from '@google/genai';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('upload');
  const [dashboardData, setDashboardData] = useState<FinancialPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: `Hello! I'm Marve, your AI financial assistant powered by Generational Wealth Analytics. Please contact our customer service at +263710419664 for more information and custom financial insights<br/><br/>You can ask me about general financial topics, or upload a document for specific analysis`
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleAnalyze = useCallback(async (extractedText: string, originalFile?: File) => {
    setIsLoading(true);
    setError(null);
    setDashboardData(null);
    setChatHistory([]);

    try {
      let analysisInput: string | Part;

      if (extractedText.trim().length > 100) {
        analysisInput = extractedText;
      } else if (originalFile) {
        const base64 = await fileToBase64(originalFile);
        analysisInput = {
          inlineData: {
            mimeType: originalFile.type || 'application/pdf',
            data: base64
          }
        };
      } else {
        throw new Error("Could not extract enough text from the file for analysis.");
      }

      const result = await generatePerformanceData(analysisInput);
      setDashboardData(result);
      setActiveView('dashboard');
      setChatHistory([{
        role: 'model',
        content: `Analysis complete for the period **${result.subtitle}**. The performance dashboard is now available. Feel free to ask any questions about the data presented.`
      }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      setActiveView('upload');
      setChatHistory([{
        role: 'model',
        content: `I'm sorry, but I was unable to complete the analysis. Please try again with a different file. \n\n**Error:** ${errorMessage}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectReport = (report: FinancialPerformanceData) => {
    setDashboardData(report);
    setActiveView('dashboard');
    setChatHistory([{
      role: 'model',
      content: `Now viewing saved report: **${report.title}**. How can I help you analyze this data?`
    }]);
  };
  
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const newUserMessage: ChatMessage = { role: 'user', content: message };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setIsChatLoading(true);

    try {
      const response = await generateChatResponse(dashboardData, updatedHistory, message);
      const newModelMessage: ChatMessage = { role: 'model', content: response };
      setChatHistory(prev => [...prev, newModelMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        role: 'model',
        content: err instanceof Error ? `Error: ${err.message}` : 'Sorry, I encountered an error.'
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatHistory, dashboardData]);
  
  const renderView = () => {
    switch(activeView) {
      case 'dashboard':
        return dashboardData ? <PerformanceDashboard data={dashboardData} /> : <Placeholder text="Analyze a document to see your performance dashboard." />;
      case 'upload':
        return <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />;
      case 'documents':
        return <DocumentsView onSelectReport={handleSelectReport} />;
      case 'chat':
        return <ChatView 
                  chatHistory={chatHistory} 
                  isChatLoading={isChatLoading} 
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  dashboardData={dashboardData}
                />;
      default:
        return <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />;
    }
  }

  return (
    <div className="min-h-screen bg-background text-primary-text font-sans flex flex-col">
      <header className="p-3 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center">
            <Logo className="h-12 w-auto"/>
        </div>
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-8 h-8 rounded-full hover:bg-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-accent">
                <UserCircleIcon className="w-full h-full text-secondary-text"/>
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-50 animate-fade-in">
                    <a href="#" className="block px-4 py-2 text-sm text-primary-text hover:bg-border">Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm text-primary-text hover:bg-border">Settings</a>
                    <div className="border-t border-border my-1"></div>
                    <a href="#" className="block px-4 py-2 text-sm text-primary-text hover:bg-border">Login</a>
                    <a href="#" className="block px-4 py-2 text-sm text-primary-text hover:bg-border">Logout</a>
                </div>
            )}
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto">
        {error && (
            <div className="p-4">
                 <ErrorMessage message={error} />
            </div>
        )}
        {renderView()}
      </main>
      
      <BottomNavBar activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

const Placeholder: React.FC<{text: string, icon?: React.ReactNode}> = ({text, icon}) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-secondary-text">
    {icon}
    <p>{text}</p>
  </div>
);

export default App;
