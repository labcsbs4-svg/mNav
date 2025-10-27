import React from "react";
import { Navigation, Clock, MapPin } from "lucide-react";
import { Route } from "../mapTypes/map";

interface NavigationPanelProps {
  currentRoute: Route | null;
  isNavigating: boolean;
  userLocation: [number, number] | null;
  onCloseNavigation: () => void;
  instructions?: string[];
  // onStartNavigation: () => void;
  // onStopNavigation: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  currentRoute,
  isNavigating,
  userLocation,
  onCloseNavigation,
  // onStopNavigation,
  instructions = [],
}) => {
  if (!isNavigating || !currentRoute) return null;

  const handleStopNavigation = () => {
    // Dispatch the same event as Escape key
    window.dispatchEvent(new CustomEvent("navigation-stopped"));
    onCloseNavigation();
    // onStopNavigation();
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Navigation className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Navigation Active</h3>
        </div>
        <button
          onClick={() => {
            // Dispatch the same event as Escape key to stop navigation
            window.dispatchEvent(new CustomEvent("navigation-stopped"));
            onCloseNavigation();
            // onStopNavigation();
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          title="Stop Navigation"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-blue-50 p-3 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">
            {currentRoute.name}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800">
                {formatTime(currentRoute.estimatedTime)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800">
                {formatDistance(currentRoute.distance)}
              </span>
            </div>
          </div>
        </div>

        {userLocation && (
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Current Location:</strong>
              <br />
              Lat: {userLocation[0].toFixed(6)}
              <br />
              Lng: {userLocation[1].toFixed(6)}
            </p>
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-md">
          <h5 className="font-medium text-gray-700 mb-2">
            Turn-by-Turn Directions
          </h5>
          <div className="space-y-2 text-sm text-gray-600">
            {instructions.length === 0 ? (
              <p className="text-sm text-gray-500">
                No instructions available.
              </p>
            ) : (
              instructions.map((ins, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    {idx + 1}
                  </span>
                  <p>{ins}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t">
          <button
            onClick={handleStopNavigation}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
            <span>Stop Navigation</span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Press Esc to stop
          </p>
        </div>
      </div>
    </div>
  );
};
