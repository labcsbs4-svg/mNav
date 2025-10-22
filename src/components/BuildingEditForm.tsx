import React, { useState } from 'react';
import type { Building, BuildingCategory } from '../types/campus';

interface BuildingEditFormProps {
  building: Building;
  onSave: (updatedBuilding: Building) => void;
  onCancel: () => void;
}

const BuildingEditForm: React.FC<BuildingEditFormProps> = ({ building, onSave, onCancel }) => {
  const [name, setName] = useState(building.name);
  const [code, setCode] = useState(building.code);
  const [category, setCategory] = useState<BuildingCategory>(building.category);
  const [description, setDescription] = useState(building.description);
  const [latitude, setLatitude] = useState(building.latitude);
  const [longitude, setLongitude] = useState(building.longitude);
  const [services, setServices] = useState(building.services.join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedBuilding: Building = {
      ...building,
      name,
      code,
      category,
      description,
      latitude,
      longitude,
      services: services.split(',').map(s => s.trim()).filter(s => s !== ''),
    };
    onSave(updatedBuilding);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">Code</label>
        <input
          type="text"
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as BuildingCategory)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        >
          {['academic', 'library', 'dining', 'residential', 'recreation', 'administrative', 'parking', 'emergency'].map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        ></textarea>
      </div>
      <div>
        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
        <input
          type="number"
          id="latitude"
          value={latitude}
          onChange={(e) => setLatitude(parseFloat(e.target.value))}
          step="any"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
        <input
          type="number"
          id="longitude"
          value={longitude}
          onChange={(e) => setLongitude(parseFloat(e.target.value))}
          step="any"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="services" className="block text-sm font-medium text-gray-700">Services (comma-separated)</label>
        <input
          type="text"
          id="services"
          value={services}
          onChange={(e) => setServices(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default BuildingEditForm;