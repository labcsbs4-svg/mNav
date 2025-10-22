export interface Location {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  category: 'restaurant' | 'hospital' | 'school' | 'shopping' | 'gas' | 'hotel' | 'custom';
  createdAt: Date;
}

export interface Road {
  id: string;
  name: string;
  coordinates: [number, number][];
  type: 'highway' | 'street' | 'path' | 'custom';
  createdAt: Date;
}

export interface Route {
  id: string;
  name: string;
  waypoints: [number, number][];
  distance: number;
  estimatedTime: number;
  createdAt: Date;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  userLocation: [number, number] | null;
  isNavigating: boolean;
  currentRoute: Route | null;
}