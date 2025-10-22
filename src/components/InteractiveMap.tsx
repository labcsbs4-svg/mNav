import React from 'react';
import { Building } from '../types/campus';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onBuildingSelect: (building: Building) => void;
  showUserLocation: boolean;
  userLocation: { latitude: number; longitude: number } | null;
}

// User location icon
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzM0ODVmZiIvPjwvc3ZnPg==',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

function MapEvents({ selectedBuilding, userLocation }: { 
  selectedBuilding: Building | null; 
  userLocation: { latitude: number; longitude: number } | null;
}) {
  const map = useMap();

  React.useEffect(() => {
    if (selectedBuilding) {
      map.setView([selectedBuilding.latitude, selectedBuilding.longitude], 18);
    } else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 18);
    }
  }, [selectedBuilding, userLocation, map]);

  return null;
}

export default function MapComponent({ 
  buildings, 
  selectedBuilding, 
  onBuildingSelect,
  showUserLocation,
  userLocation 
}: MapComponentProps) {
  const defaultPosition: [number, number] = [40.7485, -73.9864];

  return (
    <MapContainer
      key="campus-map"
      center={defaultPosition}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {buildings.map((building) => (
        <Marker
          key={building.id}
          position={[building.latitude, building.longitude]}
          eventHandlers={{
            click: () => onBuildingSelect(building)
          }}
        >
          <Popup>
            <div className="p-2">
              <h4 className="font-semibold">{building.name}</h4>
              <p className="text-sm text-gray-600">{building.code}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {showUserLocation && userLocation && (
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={userIcon}
        >
          <Popup>You are here</Popup>
        </Marker>
      )}

      <MapEvents selectedBuilding={selectedBuilding} userLocation={userLocation} />
    </MapContainer>
  );
}