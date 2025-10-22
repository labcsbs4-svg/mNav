import React, { useState } from 'react';
import { Building } from '../types/campus';
import { buildings as initialBuildings } from '../data/buildings';
import BuildingEditForm from './BuildingEditForm';

interface BuildingManagementProps {
  onClose: () => void;
}

const BuildingManagement: React.FC<BuildingManagementProps> = ({ onClose }) => {
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  const handleUpdateBuilding = (updatedBuilding: Building) => {
    setBuildings(buildings.map(b => (b.id === updatedBuilding.id ? updatedBuilding : b)));
    setEditingBuilding(null);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Building Management</h2>

        {editingBuilding ? (
          <BuildingEditForm
            building={editingBuilding}
            onSave={handleUpdateBuilding}
            onCancel={() => setEditingBuilding(null)}
          />
        ) : (
          <>
            <ul className="space-y-4 mb-6">
              {buildings.map((building) => (
                <li key={building.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-md shadow-sm">
                  <span className="text-lg font-medium text-gray-700">{building.name} ({building.code})</span>
                  <button
                    onClick={() => setEditingBuilding(building)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuildingManagement;