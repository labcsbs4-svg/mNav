import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AppContent from './AppContent';

function App() {
  const [currentMapType, setCurrentMapType] = useState<'google' | 'leaflet'>('google');

  const mapOptions = [
    {
      id: 'google',
      name: 'Google My Maps',
      description: 'Embedded Google Maps with campus overlay',
    },
    {
      id: 'leaflet',
      name: 'Leaflet Maps',
      description: 'Interactive Leaflet map with live location and navigation',
    }
  ];

  return (
    <AuthProvider>
      <AppContent 
        currentMapType={currentMapType}
        setCurrentMapType={setCurrentMapType}
        mapOptions={mapOptions}
      />
    </AuthProvider>
  );
}

export default App;