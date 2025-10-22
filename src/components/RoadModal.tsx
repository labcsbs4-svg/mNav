import React, { useState } from 'react';

interface RoadModalProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const RoadModal: React.FC<RoadModalProps> = ({ onSave, onCancel }) => {
  const [roadName, setRoadName] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Enter Road Name</h3>
        <input
          type="text"
          value={roadName}
          onChange={(e) => setRoadName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter road name"
          autoFocus
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(roadName)}
            disabled={!roadName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};