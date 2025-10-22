import { Building } from '../types/campus';
import { MapPin, Locate } from 'lucide-react';

interface EmbeddedMapProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onBuildingSelect: (building: Building) => void;
  showUserLocation: boolean;
  userLocation: { latitude: number; longitude: number } | null;
}

const getCategoryColor = (category: string) => {
  const colors = {
    academic: 'bg-blue-500',
    library: 'bg-purple-500',
    dining: 'bg-orange-500',
    residential: 'bg-green-500',
    recreation: 'bg-pink-500',
    administrative: 'bg-gray-500',
    parking: 'bg-yellow-500',
    emergency: 'bg-red-500'
  };
  return colors[category as keyof typeof colors] || 'bg-gray-500';
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'emergency':
      return '🚨';
    case 'parking':
      return '🅿️';
    case 'dining':
      return '🍽️';
    case 'library':
      return '📚';
    case 'residential':
      return '🏠';
    case 'recreation':
      return '🏃';
    case 'administrative':
      return '🏢';
    default:
      return '🏫';
  }
};

export default function EmbeddedMap({ 
  buildings, 
  selectedBuilding, 
  onBuildingSelect,
  showUserLocation,
  userLocation 
}: EmbeddedMapProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Interactive Campus Map</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>Campus Map</span>
        </div>
      </div>
      
      <div className="relative">
        {/* Embedded Google Map */}
        <div className="w-full h-[400px] md:h-[500px] rounded-lg border border-gray-200 overflow-hidden">
          <iframe 
            src="https://www.google.com/maps/d/embed?mid=1zwvY4POOQo_YR04XYS4myWMuzKYTxVE&ehbc=2E312F&noprof=1" 
            width="100%" 
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Campus Map"
          />
        </div>

        {/* Building Overlay Controls */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg max-w-xs">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Building Directory</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {buildings.slice(0, 6).map((building) => (
              <button
                key={building.id}
                onClick={() => onBuildingSelect(building)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  selectedBuilding?.id === building.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{getCategoryIcon(building.category)}</span>
                <span className="font-medium">{building.code}</span>
                <span className="text-gray-600 ml-1">{building.name}</span>
              </button>
            ))}
            {buildings.length > 6 && (
              <div className="text-xs text-gray-500 text-center pt-1">
                +{buildings.length - 6} more buildings
              </div>
            )}
          </div>
        </div>

        {/* User Location Indicator */}
        {showUserLocation && userLocation && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Locate className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Your Location</span>
            </div>
            <div className="text-xs opacity-90">
              <div>Lat: {userLocation.latitude.toFixed(6)}</div>
              <div>Lng: {userLocation.longitude.toFixed(6)}</div>
            </div>
          </div>
        )}

        {/* Selected Building Info */}
        {selectedBuilding && (
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 ${getCategoryColor(selectedBuilding.category)} rounded-full flex items-center justify-center text-white text-sm`}>
                {selectedBuilding.code.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{selectedBuilding.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedBuilding.code}</p>
                <p className="text-xs text-gray-700 line-clamp-2">{selectedBuilding.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    selectedBuilding.category === 'academic' ? 'bg-blue-100 text-blue-800' :
                    selectedBuilding.category === 'library' ? 'bg-purple-100 text-purple-800' :
                    selectedBuilding.category === 'dining' ? 'bg-orange-100 text-orange-800' :
                    selectedBuilding.category === 'residential' ? 'bg-green-100 text-green-800' :
                    selectedBuilding.category === 'recreation' ? 'bg-pink-100 text-pink-800' :
                    selectedBuilding.category === 'administrative' ? 'bg-gray-100 text-gray-800' :
                    selectedBuilding.category === 'parking' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedBuilding.category.charAt(0).toUpperCase() + selectedBuilding.category.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="mt-4 bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Building Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Academic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Library</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Dining</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Housing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Emergency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Parking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span>Recreation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Administrative</span>
          </div>
        </div>
        {showUserLocation && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-blue-600 font-medium">Your GPS Location</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}