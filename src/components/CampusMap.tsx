import { useState } from 'react';
import { Building } from '../types/campus';
import { MapPin, Navigation, Zap } from 'lucide-react';

interface CampusMapProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onBuildingSelect: (building: Building) => void;
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
      return <Zap className="h-3 w-3" />;
    case 'parking':
      return <Navigation className="h-3 w-3" />;
    default:
      return <MapPin className="h-3 w-3" />;
  }
};

export default function CampusMap({ buildings, selectedBuilding, onBuildingSelect }: CampusMapProps) {
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Interactive Campus Map</h3>
      <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-gray-200 overflow-hidden">
        <svg
          viewBox="0 0 600 500"
          className="w-full h-[400px] md:h-[500px]"
        >
          {/* Campus paths */}
          <path
            d="M50 250 Q150 200 250 250 T450 250 Q500 275 550 250"
            stroke="#10b981"
            strokeWidth="4"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.6"
          />
          <path
            d="M250 50 Q275 150 300 250 Q325 350 350 450"
            stroke="#10b981"
            strokeWidth="4"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.6"
          />

          {/* Building markers */}
          {buildings.map((building) => (
            <g key={building.id}>
              <circle
                cx={building.coordinates.x}
                cy={building.coordinates.y}
                r={selectedBuilding?.id === building.id ? "20" : "15"}
                className={`${getCategoryColor(building.category)} cursor-pointer transition-all duration-200 hover:scale-110`}
                stroke={selectedBuilding?.id === building.id ? "#1f2937" : "white"}
                strokeWidth="2"
                onClick={() => onBuildingSelect(building)}
                onMouseEnter={() => setHoveredBuilding(building)}
                onMouseLeave={() => setHoveredBuilding(null)}
              />
              <g
                className="cursor-pointer text-white"
                onClick={() => onBuildingSelect(building)}
                onMouseEnter={() => setHoveredBuilding(building)}
                onMouseLeave={() => setHoveredBuilding(null)}
              >
                {getCategoryIcon(building.category)}
              </g>
              <text
                x={building.coordinates.x}
                y={building.coordinates.y + 35}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700 pointer-events-none"
              >
                {building.code}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover tooltip */}
        {hoveredBuilding && (
          <div className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs z-10">
            <div className="font-semibold">{hoveredBuilding.name}</div>
            <div className="text-gray-300">{hoveredBuilding.code}</div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Legend</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Academic</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Library</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Dining</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Housing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Emergency</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Parking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}