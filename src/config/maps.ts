// Google Maps configuration
export const MAP_CONFIG = {
  center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
  zoom: 15,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// Function to load Google Maps script
export const loadGoogleMapsScript = (callback: () => void) => {
  if (window.google) {
    callback();
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
};