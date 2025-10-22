import { Building } from '../types/campus';
import { X, Clock, Phone, Mail, MapPin, Navigation, Heart } from 'lucide-react';

interface BuildingDetailProps {
  building: Building;
  isFavorite: boolean;
  onToggleFavorite: (buildingId: string) => void;
  onClose: () => void;
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

export default function BuildingDetail({ building, isFavorite, onToggleFavorite, onClose }: BuildingDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex-1">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryBadgeColor(building.category)} mb-3`}>
              {building.category.charAt(0).toUpperCase() + building.category.slice(1)}
            </span>
            <h2 className="text-2xl font-bold text-gray-800">{building.name}</h2>
            <p className="text-lg text-gray-600 font-medium">{building.code}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleFavorite(building.id)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{building.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Hours & Contact</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Hours</p>
                    <p className="text-gray-600">{building.hours}</p>
                  </div>
                </div>
                {building.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Phone</p>
                      <a href={`tel:${building.phone}`} className="text-blue-600 hover:text-blue-800">
                        {building.phone}
                      </a>
                    </div>
                  </div>
                )}
                {building.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Email</p>
                      <a href={`mailto:${building.email}`} className="text-blue-600 hover:text-blue-800">
                        {building.email}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Building Code</p>
                    <p className="text-gray-600">{building.code}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Services & Amenities</h3>
              <div className="grid gap-2">
                {building.services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
              <Navigation className="h-5 w-5" />
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}