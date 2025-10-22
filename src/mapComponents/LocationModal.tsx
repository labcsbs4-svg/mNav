import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { Location } from '../mapTypes/map';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationData: Omit<Location, 'id' | 'createdAt'>) => void;
  position: [number, number] | null;
}

export const LocationModal: React.FC<LocationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  position 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Location['category']>('custom');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setCategory('custom');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (position && name.trim()) {
      onSave({
        name: name.trim(),
        description: description.trim(),
        lat: position[0],
        lng: position[1],
        category
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Add Location
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {position && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter location name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Location['category'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">Custom</option>
              <option value="restaurant">Restaurant</option>
              <option value="hospital">Hospital</option>
              <option value="school">School</option>
              <option value="shopping">Shopping</option>
              <option value="gas">Gas Station</option>
              <option value="hotel">Hotel</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !position}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};