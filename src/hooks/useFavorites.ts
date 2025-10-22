import { useState, useEffect, useCallback } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('campus-favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = useCallback((buildingId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(buildingId)
        ? prev.filter(id => id !== buildingId)
        : [...prev, buildingId];

      localStorage.setItem('campus-favorites', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback((buildingId: string) => favorites.includes(buildingId), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}