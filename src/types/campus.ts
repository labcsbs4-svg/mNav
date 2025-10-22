export interface Building {
  id: string;
  name: string;
  code: string;
  category: BuildingCategory;
  description: string;
  hours: string;
  services: string[];
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  image?: string;
}

export type BuildingCategory = 
  | 'academic'
  | 'library'
  | 'dining'
  | 'residential'
  | 'recreation'
  | 'administrative'
  | 'parking'
  | 'emergency';

export interface CampusService {
  id: string;
  name: string;
  description: string;
  location: string;
  hours: string;
  contact: string;
  emergency?: boolean;
}