import { campusServices } from '../data/buildings';
import { AlertTriangle, Phone, Clock, MapPin } from 'lucide-react';

export default function EmergencyServices() {
  const emergencyServices = campusServices.filter(service => service.emergency);
  const otherServices = campusServices.filter(service => !service.emergency);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <h3 className="text-xl font-semibold text-gray-800">Campus Services</h3>
      </div>

      {/* Emergency Services */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-red-600 mb-3">Emergency Services</h4>
        <div className="space-y-3">
          {emergencyServices.map((service) => (
            <div key={service.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
              <h5 className="font-semibold text-red-800 mb-2">{service.name}</h5>
              <p className="text-red-700 mb-3">{service.description}</p>
              <div className="grid sm:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2 text-red-600">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${service.contact}`} className="font-medium hover:text-red-800">
                    {service.contact}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <Clock className="h-4 w-4" />
                  <span>{service.hours}</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <MapPin className="h-4 w-4" />
                  <span>{service.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Services */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Student Services</h4>
        <div className="grid gap-4">
          {otherServices.map((service) => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-800 mb-2">{service.name}</h5>
              <p className="text-gray-700 mb-3">{service.description}</p>
              <div className="grid sm:grid-cols-3 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${service.contact}`} className="text-blue-600 hover:text-blue-800">
                    {service.contact}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{service.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{service.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}