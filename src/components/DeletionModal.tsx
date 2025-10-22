import React from 'react';
import { Location, Road } from '../mapTypes/map';

interface DeletionModalProps {
  type: 'road' | 'location';
  items: (Road | Location)[];
  onDelete: (id: string) => void;
  onCancel: () => void;
  selectedId?: string;
}

export const DeletionModal: React.FC<DeletionModalProps> = ({
  type,
  items,
  onDelete,
  onCancel,
  selectedId,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] flex flex-col">
        <h3 className="text-lg font-semibold mb-4">
          Select {type === 'road' ? 'Road' : 'Location'} to Delete
        </h3>
        <div className="flex-grow overflow-auto">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No {type === 'road' ? 'roads' : 'locations'} available
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 border rounded hover:bg-gray-50 ${
                    selectedId === item.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {type === 'road' ? 
                        `Type: ${(item as Road).type}` :
                        `Category: ${(item as Location).category}`
                      }
                    </p>
                    <p className="text-xs text-gray-400">
                      Added: {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className={`px-3 py-1 text-white rounded ${selectedId === item.id ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};