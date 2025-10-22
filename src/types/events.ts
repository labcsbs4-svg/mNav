export interface CampusEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: EventCategory;
  organizer: string;
  image?: string;
  registrationRequired: boolean;
  capacity?: number;
  registeredCount?: number;
  tags: string[];
}

export type EventCategory = 
  | 'academic' 
  | 'social' 
  | 'sports' 
  | 'cultural' 
  | 'workshop' 
  | 'career' 
  | 'volunteer'
  | 'orientation';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}