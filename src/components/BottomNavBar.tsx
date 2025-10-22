import { MapPin, Heart, Info } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'map' | 'list' | 'services';
  setActiveTab: (tab: 'map' | 'list' | 'services') => void;
}

const tabs = [
  { id: 'map', label: 'Campus Map', icon: MapPin },
  { id: 'list', label: 'All Buildings', icon: Info },
  { id: 'services', label: 'Services', icon: Heart }
];

export default function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  return (
    <div className="fixed bottom-2 left-0 right-0 bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.1)] md:hidden z-50">
      <nav className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'map' | 'list' | 'services')}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}