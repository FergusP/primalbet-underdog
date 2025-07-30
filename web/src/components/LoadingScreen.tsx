'use client';

import React from 'react';

interface LoadingScreenProps {
  progress: number;
  isVisible: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-yellow-500 mb-8 animate-pulse">
          AURELIUS ARENA
        </h1>
        
        <div className="mb-4">
          <div className="text-xl text-yellow-400 mb-2">Preparing the Colosseum...</div>
        </div>

        <div className="w-80 h-12 bg-gray-800 rounded-full overflow-hidden border-2 border-yellow-600 shadow-lg">
          <div 
            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-black font-bold">{Math.floor(progress)}%</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-gray-400">
          Loading gladiators and monsters...
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
};