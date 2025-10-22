import React from 'react';

interface ConfirmProps {
  isOpen: boolean;
  distanceMeters: number;
  estimatedMinutes: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmNavigationModal: React.FC<ConfirmProps> = ({ isOpen, distanceMeters, estimatedMinutes, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const fmtDistance = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`);
  const fmtTime = (mins: number) => mins < 60 ? `${Math.round(mins)} min` : `${Math.floor(mins/60)}h ${Math.round(mins%60)}m`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2100]">
      <div className="bg-white rounded-lg p-4 w-80">
        <h3 className="text-lg font-semibold mb-2">Start Navigation?</h3>
        <p className="text-sm text-gray-700">Distance: <strong>{fmtDistance(distanceMeters)}</strong></p>
        <p className="text-sm text-gray-700">Estimated time: <strong>{fmtTime(estimatedMinutes)}</strong></p>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onCancel} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1 bg-blue-600 text-white rounded">Start</button>
        </div>
      </div>
    </div>
  );
};
