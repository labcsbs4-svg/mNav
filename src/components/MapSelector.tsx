import { useState } from 'react';
import { MapPin, Layers, Globe } from 'lucide-react';

interface MapSelectorProps {
  currentMapType: 'google' | 'leaflet';
  onMapTypeChange: (mapType: 'google' | 'leaflet') => void;
}

export default function MapSelector({ currentMapType, onMapTypeChange }: MapSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const mapOptions = [
    {
      id: 'google',
      name: 'Google My Maps',
      icon: Globe,
      description: 'Embedded Google Maps with campus overlay',
      color: 'text-blue-600'
    },
    {
      id: 'leaflet',
      name: 'Leaflet Maps',
      icon: MapPin,
      description: 'Interactive Leaflet map with live location and navigation',
      color: 'text-green-600'
    }
  ];



  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"
      >
        <Layers className="h-4 w-4" />
        <span className="hidden md:inline">Map Type</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Map Type</h3>
            
            <div className="space-y-2">
              {mapOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onMapTypeChange(option.id as 'google' | 'leaflet');
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      currentMapType === option.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${option.color}`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                      </div>
                      {currentMapType === option.id && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Google My Maps:</strong> Static embedded map with campus overlay
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Leaflet Maps:</strong> Interactive map with live GPS, navigation, and custom features
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}