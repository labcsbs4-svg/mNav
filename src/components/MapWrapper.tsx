
import { Building } from '../types/campus';
import EmbeddedMap from './EmbeddedMap';
import { CustomMap } from '../mapComponents/CustomMap';

interface MapWrapperProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onBuildingSelect: (building: Building) => void;
  showUserLocation: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  mapType: 'google' | 'leaflet';
}

export default function MapWrapper({
  buildings,
  selectedBuilding,
  onBuildingSelect,
  showUserLocation,
  userLocation,
  mapType
}: MapWrapperProps) {
  
  if (mapType === 'leaflet') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Interactive Campus Map</h3>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Live Leaflet Map</span>
          </div>
        </div>
        
        <div className="w-full h-[400px] md:h-[500px] rounded-lg border border-gray-200 overflow-hidden">
          <CustomMap />
        </div>

        {/* Map Legend */}
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Live GPS Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Custom Routes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Navigation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Add Places</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Emergency Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Draw Roads</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default to Google Maps
  return (
    <EmbeddedMap
      buildings={buildings}
      selectedBuilding={selectedBuilding}
      onBuildingSelect={onBuildingSelect}
      showUserLocation={showUserLocation}
      userLocation={userLocation}
    />
  );
}