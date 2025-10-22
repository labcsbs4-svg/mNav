import { useState, useEffect } from 'react';

interface GeolocationState {
  location: [number, number] | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = (options: PositionOptions = {}, enabled = true) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: enabled, // only loading if enabled
  });

  useEffect(() => {
    if (!enabled) {
      // If disabled, reset to not-watching
      setState({ location: null, error: null, loading: false });
      return;
    }

    if (!navigator.geolocation) {
      setState({ location: null, error: 'Geolocation is not supported', loading: false });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          location: [position.coords.latitude, position.coords.longitude],
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState({ location: null, error: error.message, loading: false });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled]);

  return state;
};