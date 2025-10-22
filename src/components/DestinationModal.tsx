import React from 'react';
import { Location } from '../mapTypes/map';

interface DestinationModalProps {
  isOpen: boolean;
  locations: Location[];
  onSelect: (location: Location) => void;
  onCancel: () => void;
  navigationStep: 'from' | 'to';
  selectedFromPoint: Location | null;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({ isOpen, locations, onSelect, onCancel, navigationStep }) => {
  if (!isOpen) return null;

  const title = navigationStep === 'from' ? 'Select Starting Point' : 'Select Destination';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2100]">
      <div className="bg-white rounded-lg p-4 w-96 max-h-[70vh] overflow-auto">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        {navigationStep === 'from' && (
          <ul className="space-y-2">
            <li className="border rounded p-2 flex items-center justify-between">
              <div>
                <div className="font-medium">Your Location</div>
                <div className="text-xs text-gray-500">Current GPS position</div>
              </div>
              <div>
                <button onClick={() => onSelect({ id: 'user-location', name: 'Your Location', description: 'Current GPS position', category: 'custom', lat: 0, lng: 0, createdAt: new Date() })} className="px-3 py-1 bg-blue-600 text-white rounded">Select</button>
              </div>
            </li>
            {locations.map(loc => (
              <li key={loc.id} className="border rounded p-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{loc.name}</div>
                  <div className="text-xs text-gray-500">{loc.description}</div>
                </div>
                <div>
                  <button onClick={() => onSelect(loc)} className="px-3 py-1 bg-blue-600 text-white rounded">Select</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {navigationStep === 'to' && (
          <ul className="space-y-2">
            {locations.map(loc => (
              <li key={loc.id} className="border rounded p-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{loc.name}</div>
                  <div className="text-xs text-gray-500">{loc.description}</div>
                </div>
                <div>
                  <button onClick={() => onSelect(loc)} className="px-3 py-1 bg-blue-600 text-white rounded">Select</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 text-right">
          <button onClick={onCancel} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};
