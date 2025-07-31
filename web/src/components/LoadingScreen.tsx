'use client';

import React from 'react';

interface LoadingScreenProps {
  progress: number;
  isVisible: boolean;
  error?: {
    message: string;
    canRetry: boolean;
  };
  onRetry?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, isVisible, error, onRetry }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-yellow-500 mb-8 animate-pulse">
          AURELIUS ARENA
        </h1>
        
        {error ? (
          // Error state
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <div className="text-xl text-red-400 mb-2">Connection Failed</div>
              <div className="text-gray-400 px-4">{error.message}</div>
            </div>
            
            {error.canRetry && onRetry && (
              <div className="space-y-3">
                <button 
                  onClick={onRetry}
                  className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors duration-200 shadow-lg"
                >
                  Try Again
                </button>
                <div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Loading state
          <>
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
          </>
        )}
      </div>
    </div>
  );
};