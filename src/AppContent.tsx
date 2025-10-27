import { useState, useMemo, useEffect } from "react";
import { Building, BuildingCategory } from "./types/campus";
import { buildings } from "./data/buildings";
import { useFavorites } from "./hooks/useFavorites";
import SearchBar from "./components/SearchBar";
import BuildingCard from "./components/BuildingCard";
import BuildingDetail from "./components/BuildingDetail";
import EmergencyServices from "./components/EmergencyServices";
import EventsCatalogue from "./components/EventsCatalogue";
import ChatBot from "./components/ChatBot";
import MapWrapper from "./components/MapWrapper";
import MapSelector from "./components/MapSelector";
import BottomNavBar from "./components/BottomNavBar";
import { useAuth } from "./contexts/AuthContext";
import AdminLogin from "./components/AdminLogin";
import BuildingManagement from "./components/BuildingManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  MapPin,
  Heart,
  Info,
  Menu,
  X,
  Calendar,
  Locate,
  UserCog,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { NavigationPanel } from "./mapComponents/NavigationPanel";
import { Route } from "./mapTypes/map";

interface AppContentProps {
  currentMapType: "google" | "leaflet";
  setCurrentMapType: (mapType: "google" | "leaflet") => void;
  mapOptions: { id: string; name: string; description: string }[];
}

function AppContent({
  currentMapType,
  setCurrentMapType,
  mapOptions,
}: AppContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    BuildingCategory | "all"
  >("all");
  const [detailBuilding, setDetailBuilding] = useState<Building | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"map" | "list" | "services">(
    "map"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMapMenuOpen, setMobileMapMenuOpen] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showBuildingManagement, setShowBuildingManagement] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Navigation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [navInstructions, setNavInstructions] = useState<string[]>([]);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { isAdmin, logout } = useAuth();

  // Handle geolocation
  useEffect(() => {
    let watchId: number | null = null;

    if (showUserLocation) {
      if (!navigator.geolocation) {
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      };

      const handleSuccess = (position: GeolocationPosition) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      };

      const handleError = () => {
        setUserLocation(null);
      };

      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );
    } else {
      setUserLocation(null);
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [showUserLocation]);

  // Listen for live-location state changes from CustomMap so right-side button shows active state
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail && typeof detail.enabled === "boolean")
        setShowUserLocation(detail.enabled);
    };
    window.addEventListener("live-location-changed", handler as EventListener);
    return () =>
      window.removeEventListener(
        "live-location-changed",
        handler as EventListener
      );
  }, []);

  // Listen for navigation events from CustomMap
  useEffect(() => {
    const handleNavigationStarted = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail && detail.route) {
        setIsNavigating(true);
        setCurrentRoute(detail.route);

        setNavInstructions(
          detail.instructions || [
            "Navigation started. Follow the route to your destination.",
          ]
        );
      }
    };

    const handleNavigationStopped = () => {
      setIsNavigating(false);
      setCurrentRoute(null);
      setNavInstructions([]);
    };

    window.addEventListener(
      "navigation-started",
      handleNavigationStarted as EventListener
    );
    window.addEventListener(
      "navigation-stopped",
      handleNavigationStopped as EventListener
    );
    return () => {
      window.removeEventListener(
        "navigation-started",
        handleNavigationStarted as EventListener
      );
      window.removeEventListener(
        "navigation-stopped",
        handleNavigationStopped as EventListener
      );
    };
  }, []);

  const filteredBuildings = useMemo(() => {
    return buildings.filter((building) => {
      const matchesSearch =
        building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        building.services.some((service) =>
          service.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" || building.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const favoriteBuildings = useMemo(() => {
    const favSet = new Set(favorites);
    return buildings.filter((building) => favSet.has(building.id));
  }, [favorites]);

  const handleGetDirections = (venue: string) => {
    // Find the building that matches the venue
    const targetBuilding = buildings.find(
      (building) =>
        building.name.toLowerCase().includes(venue.toLowerCase()) ||
        venue.toLowerCase().includes(building.name.toLowerCase()) ||
        building.code.toLowerCase() === venue.toLowerCase()
    );

    if (targetBuilding) {
      setActiveTab("map");
    } else {
      // Fallback to Google Maps if building not found
      const query = encodeURIComponent(`${venue} university campus`);
      window.open(`https://www.google.com/maps/search/${query}`, "_blank");
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setCurrentRoute(null);
    setNavInstructions([]);
  };
  const tabs = [
    { id: "map", label: "Campus Map", icon: MapPin },
    { id: "list", label: "All Buildings", icon: Info },
    { id: "services", label: "Services", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Floating Action Buttons */}
      <div className="fixed top-1/3 right-6 flex flex-col gap-3 z-40">
        {currentMapType === "leaflet" ? (
          <button
            onClick={() => {
              window.dispatchEvent(new Event("toggle-live-location"));
              window.dispatchEvent(new Event("request-one-off-location"));
            }}
            className={`w-14 h-14 ${
              showUserLocation
                ? "bg-gradient-to-r from-green-600 to-emerald-600"
                : "bg-gradient-to-r from-gray-600 to-gray-700"
            } text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 ${
              showUserLocation ? "animate-pulse" : ""
            }`}
            title={showUserLocation ? "Hide My Location" : "Show My Location"}
          >
            <Locate className="h-6 w-6" />
          </button>
        ) : (
          <button
            onClick={() => setShowUserLocation(!showUserLocation)}
            className={`w-14 h-14 ${
              showUserLocation
                ? "bg-gradient-to-r from-green-600 to-emerald-600"
                : "bg-gradient-to-r from-gray-600 to-gray-700"
            } text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 ${
              showUserLocation ? "animate-pulse" : ""
            }`}
            title={showUserLocation ? "Hide My Location" : "Show My Location"}
          >
            <Locate className="h-6 w-6" />
          </button>
        )}
        <button
          onClick={() => setShowEvents(true)}
          className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
          title="View Events"
        >
          <Calendar className="h-6 w-6" />
        </button>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Navigate_Malnad</h1>
                <p className="text-blue-200 text-sm">Your Campus Guide</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-4 items-center">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id as "map" | "list" | "services")
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "text-blue-200 hover:text-white hover:bg-blue-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
              <MapSelector
                currentMapType={currentMapType}
                onMapTypeChange={setCurrentMapType}
              />
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-blue-200 hover:text-white hover:bg-blue-700"
              >
                <UserCog className="h-4 w-4" />
                Admin
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowBuildingManagement(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-blue-200 hover:text-white hover:bg-blue-700"
                >
                  <UserCog className="h-4 w-4" />
                  Manage Buildings
                </button>
              )}
            </nav>
          </div>

          {/* Slide-out Mobile Menu */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-1200 transition-opacity duration-300 md:hidden ${
              mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div
            className={`fixed top-0 left-0 h-full w-72 bg-gray-800 text-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Menu</h2>
              <nav className="flex flex-col space-y-2">
                <div className="border-t border-blue-700 pt-3 mt-3">
                  <button
                    onClick={() => setMobileMapMenuOpen(!mobileMapMenuOpen)}
                    className="flex items-center justify-between w-full text-blue-200 text-sm font-medium mb-2"
                  >
                    <span>Map Type</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        mobileMapMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {mobileMapMenuOpen && (
                    <div className="flex flex-col space-y-1">
                      {mapOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setCurrentMapType(
                              option.id as "google" | "leaflet"
                            );
                            setMobileMapMenuOpen(false);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            currentMapType === option.id
                              ? "border-blue-300 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {option.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {option.description}
                              </div>
                            </div>
                            {currentMapType === option.id && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!isAdmin ? (
                  <button
                    onClick={() => {
                      setShowAdminLogin(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-left text-blue-200 hover:text-white hover:bg-blue-700"
                  >
                    <UserCog className="h-4 w-4" />
                    Admin Login
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowBuildingManagement(true);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-left text-blue-200 hover:text-white hover:bg-blue-700"
                    >
                      <UserCog className="h-4 w-4" />
                      Manage Buildings
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-left text-blue-200 hover:text-white hover:bg-blue-700"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activeTab !== "services" && (
          <div className="mb-4">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        )}

        {/* Favorites Section */}
        {activeTab === "list" && favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-current" />
              Your Favorites
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteBuildings.map((building) => (
                <BuildingCard
                  key={building.id}
                  building={building}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  onSelect={setDetailBuilding}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "map" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MapWrapper
                buildings={filteredBuildings}
                selectedBuilding={selectedBuilding}
                onBuildingSelect={(building: Building) => {
                  setSelectedBuilding(building);
                  setDetailBuilding(building);
                }}
                showUserLocation={showUserLocation}
                userLocation={userLocation}
                mapType={currentMapType}
              />
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {buildings.length}
                    </div>
                    <div className="text-gray-600 text-sm">Total Buildings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {favorites.length}
                    </div>
                    <div className="text-gray-600 text-sm">Your Favorites</div>
                  </div>
                </div>
              </div>

              {/* Navigation Panel - appears below Quick Stats */}
              <NavigationPanel
                currentRoute={currentRoute}
                isNavigating={isNavigating}
                userLocation={
                  userLocation
                    ? [userLocation.latitude, userLocation.longitude]
                    : null
                }
                onCloseNavigation={handleStopNavigation}
                instructions={navInstructions}
              />

              {selectedBuilding && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Selected Building
                  </h3>
                  <h4 className="text-xl font-bold text-blue-600">
                    {selectedBuilding.name}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {selectedBuilding.description}
                  </p>
                  <button
                    onClick={() => setDetailBuilding(selectedBuilding)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "list" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              All Buildings{" "}
              {filteredBuildings.length !== buildings.length &&
                `(${filteredBuildings.length} results)`}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBuildings.map((building) => (
                <BuildingCard
                  key={building.id}
                  building={building}
                  isFavorite={isFavorite(building.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={setDetailBuilding}
                />
              ))}
            </div>
            {filteredBuildings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No buildings found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "services" && <EmergencyServices />}
      </main>

      {/* Building Detail Modal */}
      {detailBuilding && (
        <BuildingDetail
          building={detailBuilding}
          isFavorite={isFavorite(detailBuilding.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setDetailBuilding(null)}
        />
      )}

      {/* Events Catalogue Modal */}
      {showEvents && (
        <EventsCatalogue
          onClose={() => setShowEvents(false)}
          onGetDirections={handleGetDirections}
        />
      )}

      {/* ChatBot Modal */}
      {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} />}

      {showAdminLogin && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} />
      )}

      {showBuildingManagement && (
        <ProtectedRoute adminOnly>
          <BuildingManagement
            onClose={() => setShowBuildingManagement(false)}
          />
        </ProtectedRoute>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Navigate_Malnad</h3>
              <p className="text-gray-300">
                Your comprehensive guide to navigating the university campus
                with ease.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a
                  href="#emergency"
                  key="emergency"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Emergency Services
                </a>
                <a
                  href="#map"
                  key="map"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Campus Map
                </a>
                <a
                  href="#directory"
                  key="directory"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Building Directory
                </a>
                <a
                  href="#contact"
                  key="contact"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
              <p className="text-gray-300 mb-2">Campus Security</p>
              <p className="text-xl font-bold text-red-400">(555) 911-HELP</p>
              <p className="text-gray-400 text-sm">Available 24/7</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Navigate_Malnad. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default AppContent;
