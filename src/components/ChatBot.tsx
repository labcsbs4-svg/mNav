import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/events';
import { X, Send, Bot, User } from 'lucide-react';

interface ChatBotProps {
  onClose: () => void;
}

const predefinedResponses: { [key: string]: string } = {
  'hello': 'Hello! I\'m your campus assistant. I can help you with information about buildings, events, services, and more. What would you like to know?',
  'hi': 'Hi there! How can I assist you with campus navigation today?',
  'help': 'I can help you with:\n• Finding buildings and their locations\n• Campus events and activities\n• Emergency services and contacts\n• Dining options and hours\n• Library services\n• Parking information\n\nWhat specific information do you need?',
  'buildings': 'Our campus has 9 main buildings including academic halls, dining facilities, residence halls, and recreational centers. You can use the campus map to explore all locations. Which building are you looking for?',
  'events': 'We have many exciting events coming up! Check out our Events Catalogue for details about academic symposiums, cultural events, sports games, and workshops. Would you like information about a specific type of event?',
  'dining': 'Campus Commons is our main dining hall, open Mon-Fri 7AM-9PM and weekends 8AM-8PM. We offer diverse cuisine options, vegetarian meals, and grab & go items. Need directions?',
  'library': 'Memorial Library is open Mon-Thu 7AM-12AM, Fri 7AM-9PM, and weekends 10AM-10PM. We offer study rooms, research assistance, printing services, and extensive digital resources. How can I help you with library services?',
  'parking': 'North Parking Garage offers student, faculty, and visitor parking with EV charging stations. It\'s available 24/7. Need directions to the parking garage?',
  'emergency': 'For emergencies, contact Campus Security at (555) 911-HELP - available 24/7. The security office is located in the Campus Security building. Is this an emergency?',
  'hours': 'Building hours vary by location. Most academic buildings are open Mon-Fri 6AM-11PM. Would you like hours for a specific building?',
  'directions': 'I can help you find any building on campus! Use our interactive map or tell me which building you\'re looking for and I\'ll provide directions.',
  'services': 'Campus services include emergency response, health center, IT help desk, and shuttle service. Which service do you need information about?',
  'default': 'I\'m not sure about that specific question, but I\'m here to help with campus navigation, building information, events, and services. Could you rephrase your question or ask about something else?'
};

export default function ChatBot({ onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your campus navigation assistant. I can help you find buildings, learn about events, get service information, and more. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();
    
    // Check for exact matches first
    if (predefinedResponses[message]) {
      return predefinedResponses[message];
    }
    
    // Check for partial matches
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (message.includes(key)) {
        return response;
      }
    }
    
    // Check for common question patterns
    if (message.includes('where') && (message.includes('building') || message.includes('location'))) {
      return 'I can help you find any building on campus! Use our interactive map or tell me the specific building name or code you\'re looking for.';
    }
    
    if (message.includes('when') && message.includes('open')) {
      return 'Building hours vary by location. Most academic buildings are open Mon-Fri 6AM-11PM, weekends 8AM-8PM. Which specific building\'s hours do you need?';
    }
    
    if (message.includes('food') || message.includes('eat') || message.includes('restaurant')) {
      return 'Campus Commons is our main dining facility with diverse food options. It\'s open Mon-Fri 7AM-9PM, weekends 8AM-8PM. We also have grab & go options and catering services.';
    }
    
    if (message.includes('study') || message.includes('quiet')) {
      return 'Memorial Library offers quiet study spaces, group study rooms, and 24/7 access areas. Many academic buildings also have study lounges. Would you like directions to the library?';
    }
    
    if (message.includes('gym') || message.includes('fitness') || message.includes('exercise')) {
      return 'The Fitness & Recreation Center has gym equipment, swimming pool, basketball courts, and group fitness classes. It\'s open Mon-Fri 5:30AM-11PM, weekends 7AM-10PM.';
    }
    
    return predefinedResponses['default'];
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Campus Assistant</h3>
                <p className="text-blue-100 text-sm">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about campus buildings, events, services..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Ask about buildings, events, services, or directions
          </p>
        </div>
      </div>
    </div>
  );
}