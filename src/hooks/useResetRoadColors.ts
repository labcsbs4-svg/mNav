import { useEffect } from 'react';

export const useResetRoadColors = () => {
  useEffect(() => {
    const handleNavigationStopped = () => {
      // Force a re-render of the map component to reset road colors
      const event = new CustomEvent('reset-road-colors');
      window.dispatchEvent(event);
    };

    window.addEventListener('navigation-stopped', handleNavigationStopped);
    return () => {
      window.removeEventListener('navigation-stopped', handleNavigationStopped);
    };
  }, []);
};