import React from 'react';
import { Crosshair } from 'lucide-react';

interface MyLocationButtonProps {
  userLocation: [number, number] | null;
  onGoToCurrentLocation: () => void;
  isLoading: boolean;
}

export const MyLocationButton: React.FC<MyLocationButtonProps> = ({
  userLocation,
  onGoToCurrentLocation,
  isLoading,
}) => {
  return (
    <button
      onClick={onGoToCurrentLocation}
      className={`fixed top-1/2 right-6 transform -translate-y-1/2 z-[1000] w-12 h-12 rounded-full shadow-lg transition-all duration-200 ${
        'geolocation' in navigator
          ? (userLocation && !isLoading ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl' : 'bg-blue-600 text-white hover:bg-blue-700')
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
      title={isLoading ? 'Finding your location...' : (userLocation ? 'Go to my location' : ('geolocation' in navigator ? 'Tap to request location' : 'Location not available'))}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <Crosshair className="w-5 h-5 mx-auto" />
      )}
    </button>
  );
};