import { CampusEvent } from '../types/events';

// API base URL - using Vite proxy
const API_BASE_URL = '/api';

// Fetch all events from the database
export const fetchEvents = async (): Promise<CampusEvent[]> => {
  try {
    console.log('fetchEvents called, API URL:', `${API_BASE_URL}/events`);
    const response = await fetch(`${API_BASE_URL}/events`);
    console.log('fetchEvents response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('fetchEvents response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

// Add a new event to the database (admin only)
export const addEvent = async (event: Omit<CampusEvent, 'id'>): Promise<CampusEvent | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add event');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding event:', error);
    return null;
  }
};

// Update an existing event in the database (admin only)
export const updateEvent = async (updatedEvent: CampusEvent): Promise<CampusEvent | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${updatedEvent.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEvent),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update event');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating event:', error);
    return null;
  }
};

// Delete an event from the database (admin only)
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};

// Helper function to get events for display (combines database events with fallback)
export const getEvents = async (): Promise<CampusEvent[]> => {
  try {
    console.log('getEvents called, fetching from database...');
    const events = await fetchEvents();
    console.log('getEvents result:', events);
    return events;
  } catch (error) {
    console.error('Error getting events, using fallback:', error);
    // Return empty array if database is unavailable
    return [];
  }
};