import { Building, CampusService } from '../types/campus';

export const buildings: Building[] = [
  {
    id: '1',
    name: 'Johnson Hall',
    code: 'JH',
    category: 'academic',
    description: 'Main academic building housing the College of Liberal Arts, featuring modern classrooms and lecture halls.',
    hours: 'Mon-Fri: 6:00 AM - 11:00 PM, Sat-Sun: 8:00 AM - 8:00 PM',
    services: ['Classrooms', 'Faculty Offices', 'Study Areas', 'WiFi'],
    latitude: 40.7486,
    longitude: -73.9864,
    phone: '(555) 123-4567',
    email: 'johnson@university.edu'
  },
  {
    id: '2',
    name: 'Science & Technology Center',
    code: 'STC',
    category: 'academic',
    description: 'State-of-the-art research facility with laboratories, computer labs, and engineering workshops.',
    hours: 'Mon-Fri: 7:00 AM - 10:00 PM, Sat-Sun: 9:00 AM - 6:00 PM',
    services: ['Research Labs', 'Computer Labs', 'Equipment Checkout', 'Study Rooms'],
    latitude: 40.7489,
    longitude: -73.9855,
    phone: '(555) 234-5678',
    email: 'stc@university.edu'
  },
  {
    id: '3',
    name: 'Memorial Library',
    code: 'LIB',
    category: 'library',
    description: 'Central library with extensive collections, quiet study spaces, and research assistance.',
    hours: 'Mon-Thu: 7:00 AM - 12:00 AM, Fri: 7:00 AM - 9:00 PM, Sat-Sun: 10:00 AM - 10:00 PM',
    services: ['Book Collections', 'Digital Resources', 'Study Rooms', 'Research Help', 'Printing'],
    latitude: 40.7482,
    longitude: -73.9859,
    phone: '(555) 345-6789',
    email: 'library@university.edu'
  },
  {
    id: '4',
    name: 'Campus Commons',
    code: 'CC',
    category: 'dining',
    description: 'Main dining hall offering diverse cuisine options and comfortable seating areas.',
    hours: 'Mon-Fri: 7:00 AM - 9:00 PM, Sat-Sun: 8:00 AM - 8:00 PM',
    services: ['All-You-Care-To-Eat', 'Vegetarian Options', 'Grab & Go', 'Catering'],
    latitude: 40.7479,
    longitude: -73.9867,
    phone: '(555) 456-7890',
    email: 'dining@university.edu'
  },
  {
    id: '5',
    name: 'Roosevelt Residence Hall',
    code: 'RRH',
    category: 'residential',
    description: 'Modern residence hall with suite-style living and common areas for students.',
    hours: '24/7 Access for Residents',
    services: ['Residence Life', 'Laundry', 'Study Lounges', 'Recreation Room'],
    latitude: 40.7484,
    longitude: -73.9872,
    phone: '(555) 567-8901',
    email: 'housing@university.edu'
  },
  {
    id: '6',
    name: 'Fitness & Recreation Center',
    code: 'FRC',
    category: 'recreation',
    description: 'Complete fitness facility with gym, pool, courts, and group fitness classes.',
    hours: 'Mon-Fri: 5:30 AM - 11:00 PM, Sat-Sun: 7:00 AM - 10:00 PM',
    services: ['Gym Equipment', 'Swimming Pool', 'Basketball Courts', 'Group Classes', 'Personal Training'],
    latitude: 40.7475,
    longitude: -73.9852,
    phone: '(555) 678-9012',
    email: 'recreation@university.edu'
  },
  {
    id: '7',
    name: 'Administration Building',
    code: 'ADMIN',
    category: 'administrative',
    description: 'Central hub for student services, registrar, financial aid, and academic advising.',
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    services: ['Registrar', 'Financial Aid', 'Academic Advising', 'Student Accounts'],
    latitude: 40.7492,
    longitude: -73.9861,
    phone: '(555) 789-0123',
    email: 'admin@university.edu'
  },
  {
    id: '8',
    name: 'North Parking Garage',
    code: 'NPG',
    category: 'parking',
    description: 'Multi-level parking garage with spaces for students, faculty, and visitors.',
    hours: '24/7 Access',
    services: ['Student Parking', 'Faculty Parking', 'Visitor Parking', 'EV Charging Stations'],
    latitude: 40.7490,
    longitude: -73.9875,
    phone: '(555) 890-1234'
  },
  {
    id: '9',
    name: 'Campus Security',
    code: 'SEC',
    category: 'emergency',
    description: 'Campus security headquarters and emergency services coordination center.',
    hours: '24/7 Emergency Services',
    services: ['Emergency Response', 'Security Patrol', 'Lost & Found', 'Escort Services'],
    latitude: 40.7485,
    longitude: -73.9857,
    phone: '(555) 911-HELP',
    email: 'security@university.edu'
  }
];

export const campusServices: CampusService[] = [
  {
    id: '1',
    name: 'Emergency Services',
    description: 'Campus police and emergency medical services available 24/7',
    location: 'Campus Security Building',
    hours: '24/7',
    contact: '(555) 911-HELP',
    emergency: true
  },
  {
    id: '2',
    name: 'Student Health Center',
    description: 'Medical services, counseling, and wellness programs for students',
    location: 'Health Services Building',
    hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    contact: '(555) 123-HELP'
  },
  {
    id: '3',
    name: 'IT Help Desk',
    description: 'Technical support for students and faculty',
    location: 'Science & Technology Center',
    hours: 'Mon-Fri: 8:00 AM - 8:00 PM',
    contact: '(555) 234-TECH'
  },
  {
    id: '4',
    name: 'Shuttle Service',
    description: 'Free campus shuttle connecting major buildings and parking areas',
    location: 'Multiple Stops',
    hours: 'Mon-Fri: 7:00 AM - 10:00 PM',
    contact: '(555) 345-RIDE'
  }
];