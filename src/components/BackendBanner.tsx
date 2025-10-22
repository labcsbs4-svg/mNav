import React from 'react';

interface BackendBannerProps {
  online: boolean;
  onRetry: () => void;
}

export const BackendBanner: React.FC<BackendBannerProps> = ({ online, onRetry }) => {
  if (online) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[2500] bg-red-600 text-white p-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.454 9.695A1.75 1.75 0 0116.75 15h-11.5a1.75 1.75 0 01-1.447-2.206L8.257 3.1zM10 12a1 1 0 100 2 1 1 0 000-2zm-.25-6a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0V6z" clipRule="evenodd" />
        </svg>
        <div>
          <div className="font-semibold">Backend unreachable</div>
          <div className="text-xs">Persistence is offline. Changes will not be saved until backend is reachable.</div>
        </div>
      </div>
      <div>
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-white text-red-600 rounded font-medium hover:bg-gray-100"
        >
          Retry
        </button>
      </div>
    </div>
  );
};
