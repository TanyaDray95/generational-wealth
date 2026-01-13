import React, { useState, useRef, useEffect } from 'react';
// FIX: The type is FinancialPerformanceData, not DashboardData.
import { ChatMessage, FinancialPerformanceData } from '../types';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import RobotIcon from './icons/RobotIcon';

interface ChatViewProps {
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  onSendMessage: (message: string) => void;
  isLoading: boolean; // Loading state for initial analysis
  // FIX: The type is FinancialPerformanceData, not DashboardData.
  dashboardData: FinancialPerformanceData | null;
}

const ChatView: React.FC<ChatViewProps> = ({
  chatHistory,
  isChatLoading,
  onSendMessage,
  isLoading,
  dashboardData
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isChatLoading && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const isChatDisabled = isLoading || isChatLoading;

  const getPlaceholderText = () => {
    if (isLoading) return "Analyzing document...";
    if (isChatLoading) return "Marve is thinking...";
    if (dashboardData) return "Ask about the data in the dashboard...";
    return "Ask a financial question...";
  };

  const formatContent = (content: string) => {
    // Order of replacement matters: links first, then bold, then newlines.
    return content
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">$1</a>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 md:p-6">
        <div className="space-y-4">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-card flex items-center justify-center">
                  <RobotIcon className="w-5 h-5 text-secondary-text" />
                </div>
              )}
              <div
                className={`max-w-md p-3 rounded-lg text-sm prose prose-sm prose-invert ${
                  msg.role === 'user'
                    ? 'bg-accent text-white rounded-br-none'
                    : 'bg-card text-primary-text rounded-bl-none'
                }`}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
            </div>
          ))}
          {isChatLoading && (
              <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-card flex items-center justify-center">
                      <RobotIcon className="w-5 h-5 text-secondary-text" />
                  </div>
                  <div className="p-3 rounded-lg bg-card rounded-bl-none">
                      <div className="flex items-center space-x-1">
                          <span className="h-2 w-2 bg-secondary-text rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="h-2 w-2 bg-secondary-text rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="h-2 w-2 bg-secondary-text rounded-full animate-bounce"></span>
                      </div>
                  </div>
              </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholderText()}
            disabled={isChatDisabled}
            className="flex-grow p-2 text-sm text-primary-text bg-card border border-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition disabled:cursor-not-allowed disabled:opacity-70"
          />
          <button
            type="submit"
            disabled={isChatDisabled || !input.trim()}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-accent text-white rounded-md hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;