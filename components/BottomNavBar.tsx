import React from 'react';
import { View } from '../types';
import LayoutGridIcon from './icons/LayoutGridIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import FolderIcon from './icons/FolderIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';

interface BottomNavBarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGridIcon },
  { id: 'upload', label: 'Upload', icon: ArrowUpTrayIcon },
  { id: 'documents', label: 'Documents', icon: FolderIcon },
  { id: 'chat', label: 'chat with Marve', icon: ChatBubbleIcon },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="bg-card border-t border-border">
      <div className="mx-auto grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`flex flex-col items-center justify-center p-2 text-center transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                 <div className="absolute bottom-0 h-0.5 w-8 bg-accent rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;