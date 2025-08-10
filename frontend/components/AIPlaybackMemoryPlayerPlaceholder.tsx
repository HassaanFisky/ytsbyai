import React from 'react';

interface AIPlaybackMemoryPlayerProps {
  url: string;
  onTimeUpdate?: (time: number) => void;
  onSummaryRequest?: () => void;
}

const AIPlaybackMemoryPlayer: React.FC<AIPlaybackMemoryPlayerProps> = ({ 
  url, 
  onTimeUpdate, 
  onSummaryRequest 
}) => {
  return (
    <div className="w-full h-[360px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-2">Audio/Video Player</p>
        <p className="text-sm text-gray-500">URL: {url}</p>
        <button 
          onClick={onSummaryRequest}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Request Summary
        </button>
      </div>
    </div>
  );
};

export default AIPlaybackMemoryPlayer;