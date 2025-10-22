import { useState, useEffect, useMemo } from 'react';
import { CampusEvent, EventCategory } from '../types/events';
import { getEvents, addEvent, updateEvent, deleteEvent } from '../data/events';
import { Calendar, Clock, MapPin, Users, Tag, X, Filter, Search, Navigation } from 'lucide-react';

// Simple Logger UI Component
const Logger = ({ logs, onClear }: { logs: string[]; onClear: () => void }) => {
  if (logs.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md max-h-64 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-sm">Debug Logs</h4>
        <button 
          onClick={onClear} 
          className="text-xs bg-red-600 px-2 py-1 rounded"
        >
          Clear
        </button>
      </div>
      <div className="text-xs space-y-1">
        {logs.map((log, index) => (
          <div key={index} className="font-mono">{log}</div>
        ))}
      </div>
    </div>
  );
};

interface EventsCatalogueProps {
  onClose: () => void;
  onGetDirections?: (venue: string) => void;
}

const categoryColors = {
  academic: 'bg-blue-100 text-blue-800 border-blue-200',
  social: 'bg-pink-100 text-pink-800 border-pink-200',
  sports: 'bg-green-100 text-green-800 border-green-200',
  cultural: 'bg-purple-100 text-purple-800 border-purple-200',
  workshop: 'bg-orange-100 text-orange-800 border-orange-200',
  career: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  volunteer: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  orientation: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const categories: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'academic', label: 'Academic' },
  { value: 'social', label: 'Social' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'career', label: 'Career' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'orientation', label: 'Orientation' }
];

export default function EventsCatalogue({ onClose, onGetDirections }: EventsCatalogueProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormData, setEventFormData] = useState<Partial<CampusEvent>>({
    category: 'academic',
    registrationRequired: false,
    tags: []
  });
  const [eventFormMode, setEventFormMode] = useState<'add' | 'edit'>('add');
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Fetch events from database on component mount
  useEffect(() => {
    addLog('EventsCatalogue component mounted');
    const loadEvents = async () => {
      try {
        addLog('Loading events from database...');
        const fetchedEvents = await getEvents();
        addLog(`Events loaded: ${fetchedEvents.length} events`);
        addLog(`Event data: ${JSON.stringify(fetchedEvents, null, 2)}`);
        setEvents(fetchedEvents);
      } catch (error) {
        addLog(`Failed to load events: ${error}`);
      }
    };
    loadEvents();
  }, []);
  
  const handleAdminLogin = () => {
    if (adminPassword === '123456') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('Invalid password');
    }
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: CampusEvent = {
      id: eventFormData.id || Date.now().toString(),
      name: eventFormData.name || '',
      description: eventFormData.description || '',
      date: eventFormData.date || '',
      time: eventFormData.time || '',
      venue: eventFormData.venue || '',
      category: eventFormData.category as EventCategory,
      organizer: eventFormData.organizer || '',
      registrationRequired: eventFormData.registrationRequired || false,
      capacity: eventFormData.capacity,
      registeredCount: eventFormData.registeredCount || 0,
      tags: eventFormData.tags || []
    };

    if (eventFormMode === 'add') {
      const { id, ...eventToAdd } = newEvent;
      const added = await addEvent(eventToAdd);
      if (added) {
        setEvents(prev => [...prev, added]);
      }
    } else {
      const updated = await updateEvent(newEvent);
      if (updated) {
        setEvents(prev => prev.map(event => 
          event.id === updated.id ? updated : event
        ));
      }
    }

    setShowEventForm(false);
    setEventFormData({
      category: 'academic',
      registrationRequired: false,
      tags: []
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const success = await deleteEvent(eventId);
      if (success) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
      }
      setSelectedEvent(null);
    }
  };

  const filteredEvents = useMemo(() => {
    const filtered = events.filter((event: CampusEvent) => {
      const matchesSearch = 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      
      const result = matchesSearch && matchesCategory;
      
      return result;
    });
    
    addLog(`Computing filteredEvents: ${events.length} total -> ${filtered.length} filtered (search: "${searchQuery}", category: "${selectedCategory}")`);
    return filtered;
  }, [events, searchQuery, selectedCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isUpcoming = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate >= today;
  };

  const getRegistrationStatus = (event: CampusEvent) => {
    if (!event.registrationRequired) return null;
    if (!event.capacity) return 'Registration Required';
    
    const spotsLeft = event.capacity - (event.registeredCount || 0);
    if (spotsLeft <= 0) return 'Full';
    if (spotsLeft <= 10) return `${spotsLeft} spots left`;
    return 'Registration Open';
  };

  const handleGetDirections = (venue: string) => {
    if (onGetDirections) {
      onGetDirections(venue);
      onClose(); // Close the events catalogue
    } else {
      // Fallback to opening Google Maps
      const query = encodeURIComponent(`${venue} university campus`);
      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    }
  };
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Navigate_Malnad</h2>
              <p className="text-blue-100">Your Campus Guide</p>
            </div>
            <div className="flex items-center gap-4">
              {!isAdmin && (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-colors"
                >
                  Admin Login
                </button>
              )}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEventFormMode('add');
                      setShowEventForm(true);
                    }}
                    className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add New Event
                  </button>
                  <button
                    onClick={() => setIsAdmin(false)}
                    className="px-4 py-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-70">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Admin Login</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter admin password"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAdminLogin(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdminLogin}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-70 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl my-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {eventFormMode === 'add' ? 'Add New Event' : 'Edit Event'}
              </h3>
              <form onSubmit={handleEventFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Name*
                    </label>
                    <input
                      type="text"
                      value={eventFormData.name || ''}
                      onChange={(e) => setEventFormData({...eventFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      value={eventFormData.category}
                      onChange={(e) => setEventFormData({...eventFormData, category: e.target.value as EventCategory})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {categories.filter(cat => cat.value !== 'all').map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description*
                    </label>
                    <textarea
                      value={eventFormData.description || ''}
                      onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-y"
                      required
                      style={{ minHeight: "80px", maxHeight: "200px" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      value={eventFormData.date || ''}
                      onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time*
                    </label>
                    <input
                      type="text"
                      value={eventFormData.time || ''}
                      onChange={(e) => setEventFormData({...eventFormData, time: e.target.value})}
                      placeholder="e.g., 2:00 PM - 4:00 PM"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue*
                    </label>
                    <input
                      type="text"
                      value={eventFormData.venue || ''}
                      onChange={(e) => setEventFormData({...eventFormData, venue: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organizer*
                    </label>
                    <input
                      type="text"
                      value={eventFormData.organizer || ''}
                      onChange={(e) => setEventFormData({...eventFormData, organizer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 mb-1">
                      <input
                        type="checkbox"
                        checked={eventFormData.registrationRequired || false}
                        onChange={(e) => setEventFormData({...eventFormData, registrationRequired: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Registration Required</span>
                    </label>
                  </div>
                  {eventFormData.registrationRequired && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Capacity
                        </label>
                        <input
                          type="number"
                          value={eventFormData.capacity || ''}
                          onChange={(e) => setEventFormData({...eventFormData, capacity: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Registered Count
                        </label>
                        <input
                          type="number"
                          value={eventFormData.registeredCount || ''}
                          onChange={(e) => setEventFormData({...eventFormData, registeredCount: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={(eventFormData.tags || []).join(', ')}
                      onChange={(e) => setEventFormData({...eventFormData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., workshop, technology, career"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {eventFormMode === 'add' ? 'Add Event' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        {!isAdmin && !showAdminLogin && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-grow min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-grow min-w-[150px] relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as EventCategory | 'all')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              <p className="text-sm text-gray-400 mt-2">Debug: Total events in state: {events.length}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event: CampusEvent) => (
                <div
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${(categoryColors as any)[event.category]}`}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </span>
                      {isUpcoming(event.date) && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Upcoming
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {event.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    
                    {event.registrationRequired && (
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className={`font-medium ${
                          getRegistrationStatus(event) === 'Full' ? 'text-red-600' :
                          getRegistrationStatus(event)?.includes('spots left') ? 'text-orange-600' :
                          'text-blue-600'
                        }`}>
                          {getRegistrationStatus(event)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {event.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                      {event.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{event.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetDirections(event.venue);
                      }}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions to {event.venue}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

              {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${categoryColors[selectedEvent.category]} mb-3`}>
                    {selectedEvent.category.charAt(0).toUpperCase() + selectedEvent.category.slice(1)}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedEvent.name}</h2>
                  <p className="text-gray-600">Organized by {selectedEvent.organizer}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEventFormMode('edit');
                          setEventFormData(selectedEvent);
                          setShowEventForm(true);
                          setSelectedEvent(null);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-800">Date</p>
                        <p className="text-gray-600">{formatDate(selectedEvent.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-800">Time</p>
                        <p className="text-gray-600">{selectedEvent.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-800">Venue</p>
                        <p className="text-gray-600">{selectedEvent.venue}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Registration</h3>
                  {selectedEvent.registrationRequired ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-800">Status</p>
                          <p className={`${
                            getRegistrationStatus(selectedEvent) === 'Full' ? 'text-red-600' :
                            getRegistrationStatus(selectedEvent)?.includes('spots left') ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {getRegistrationStatus(selectedEvent)}
                          </p>
                        </div>
                      </div>
                      {selectedEvent.capacity && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Registered</span>
                            <span>{selectedEvent.registeredCount || 0} / {selectedEvent.capacity}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((selectedEvent.registeredCount || 0) / selectedEvent.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-green-600 font-medium">No registration required</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleGetDirections(selectedEvent.venue)}
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Navigation className="h-5 w-5" />
                    Get Directions
                  </button>
                  <button 
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectedEvent.registrationRequired && getRegistrationStatus(selectedEvent) === 'Full'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={selectedEvent.registrationRequired && getRegistrationStatus(selectedEvent) === 'Full'}
                  >
                    {selectedEvent.registrationRequired 
                      ? getRegistrationStatus(selectedEvent) === 'Full' 
                        ? 'Event Full' 
                        : 'Register'
                      : 'Add to Calendar'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    
      {/* Logger UI */}
      <Logger logs={logs} onClear={() => setLogs([])} />
    </>
  );
}

