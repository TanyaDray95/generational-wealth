import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "AI is analyzing..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-fade-in">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-accent"></div>
      <p className="text-lg text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;