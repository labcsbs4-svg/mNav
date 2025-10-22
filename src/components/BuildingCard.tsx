import { Building } from '../types/campus';
import { Clock, Phone, Mail, MapPin, Heart } from 'lucide-react';

interface BuildingCardProps {
  building: Building;
  isFavorite: boolean;
  onToggleFavorite: (buildingId: string) => void;
  onSelect: (building: Building) => void;
}

const getCategoryBadgeColor = (category: string) => {
  const colors = {
    academic: 'bg-blue-100 text-blue-800',
    library: 'bg-purple-100 text-purple-800',
    dining: 'bg-orange-100 text-orange-800',
    residential: 'bg-green-100 text-green-800',
    recreation: 'bg-pink-100 text-pink-800',
    administrative: 'bg-gray-100 text-gray-800',
    parking: 'bg-yellow-100 text-yellow-800',
    emergency: 'bg-red-100 text-red-800'
  };
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export default function BuildingCard({ building, isFavorite, onToggleFavorite, onSelect }: BuildingCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer group"
         onClick={() => onSelect(building)}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(building.category)} mb-2`}>
            {building.category.charAt(0).toUpperCase() + building.category.slice(1)}
          </span>
          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
            {building.name}
          </h3>
          <p className="text-gray-600 font-medium">{building.code}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(building.id);
          }}
          className={`p-2 rounded-full transition-colors ${
            isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{building.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{building.hours}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>Building Code: {building.code}</span>
        </div>
        {building.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{building.phone}</span>
          </div>
        )}
        {building.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{building.email}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {building.services.slice(0, 3).map((service, index) => (
          <span key={index} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            {service}
          </span>
        ))}
        {building.services.length > 3 && (
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            +{building.services.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}