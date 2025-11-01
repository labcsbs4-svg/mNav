import React, { useState, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Compass, Pencil } from "lucide-react";
import { MapControls } from "./MapControls";
import { LocationModal } from "./LocationModal";
import type { Location, Road, Route, MapState } from "../mapTypes/map";
import { MapMode } from "../mapTypes/modes";
import { useGeolocation } from "../mapHook/useGeolocation";
import { logger } from "../utils/logger";
import { LogViewer } from "../components/LogViewer";
import { RoadModal } from "../components/RoadModal";
import { DeletionModal } from "../components/DeletionModal";
import { BackendBanner } from "../components/BackendBanner";
import { DestinationModal } from "../components/DestinationModal";
import { ConfirmNavigationModal } from "../components/ConfirmNavigationModal";

import {
  routeAlongRoads,
  findNearestRoadAndSegment,
} from "../utils/roadRouting";
import { useResetRoadColors } from "../hooks/useResetRoadColors";
import {
  Plus,
  Minus,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
} from "lucide-react";

// Fix for default markers in react-leaflet
// Fix for default markers in react-leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons for different location categories
const createCustomIcon = (category: Location["category"], name: string) => {
  const iconMap = {
    restaurant: "🍽️",
    hospital: "🏥",
    school: "🏫",
    shopping: "🛍️",
    gas: "⛽",
    hotel: "🏨",
    custom: "📍",
  };

  const categoryColors = {
    restaurant: "#EF4444",
    hospital: "#10B981",
    school: "#3B82F6",
    shopping: "#8B5CF6",
    gas: "#F59E0B",
    hotel: "#EC4899",
    custom: "#6B7280",
  };

  return L.divIcon({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="background: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border: 2px solid ${
          categoryColors[category as keyof typeof categoryColors]
        }; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-size: 9px;">
          ${iconMap[category as keyof typeof iconMap]}
        </div>
        <div style="background: rgba(255,255,255,0.95); padding: 1px 3px; border-radius: 4px; margin-top: 1px; font-size: 9px; font-weight: 600; white-space: nowrap; text-shadow: 0 0 2px rgba(0,0,0,0.3); border: 1px solid rgba(0,0,0,0.1); backdrop-filter: blur(2px);">
          ${name.length > 12 ? name.substring(0, 12) + "..." : name}
        </div>
      </div>
    `,
    iconSize: [18, 32],
    iconAnchor: [9, 32],
    className: "custom-marker",
  });
};

// User location icon
const userLocationIcon = L.divIcon({
  html: `<div style="background: #3B82F6; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: "user-location-marker",
});

interface MapEventsHandlerProps {
  mode: MapMode;
  onMapClick: (lat: number, lng: number) => void;
  onContextMenu?: (lat: number, lng: number) => void;
}

const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({
  mode,
  onMapClick,
  onContextMenu,
}) => {
  useMapEvents({
    click: (e) => {
      // Allow clicks in any mode except 'view'
      if (mode !== "view") {
        logger.info("Map clicked", {
          mode,
          position: [e.latlng.lat, e.latlng.lng],
          timestamp: new Date().toISOString(),
        });
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
    contextmenu: (e) => {
      e.originalEvent.preventDefault();
      onContextMenu?.(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

export const CustomMap: React.FC = () => {
  const [isMapControlsOpen, setIsMapControlsOpen] = useState(false);
  const [mapState, setMapState] = useState<MapState>({
    center: [40.7128, -74.006], // Default to NYC
    zoom: 13,
    userLocation: null,
    isNavigating: false,
    currentRoute: null,
  });

  const [roadsKey, setRoadsKey] = useState(0);

  // Reset road colors when navigation stops
  useResetRoadColors();

  const [mode, setMode] = useState<MapMode>("view");
  const [locations, setLocations] = useState<Location[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showLocations, setShowLocations] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(null);
  const [isRoadModalOpen, setIsRoadModalOpen] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [tempRoadPoints, setTempRoadPoints] = useState<[number, number][]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [showDestinationModal, setShowDestinationModal] = useState(false);

  const [showConfirmNavModal, setShowConfirmNavModal] = useState(false);
  // destination currently being navigated to (if any) — handled inline when selecting
  const [navRemainingDistance, setNavRemainingDistance] = useState<number>(0);
  const [navigationInstructions, setNavigationInstructions] = useState<
    string[]
  >([]);

  const [currentUserRoadSegment, setCurrentUserRoadSegment] = useState<
    [[number, number], [number, number]] | null
  >(null);

  // Navigation flow state
  const [navigationStep, setNavigationStep] = useState<"from" | "to">("from");
  const [selectedFromPoint, setSelectedFromPoint] = useState<Location | null>(
    null
  );

  const [isGeoMenuOpen, setIsGeoMenuOpen] = useState<boolean>(false);

  // Map rotation state
  const [mapRotation, setMapRotation] = useState(0);

  // Drawing state
  const [currentRoadPoints, setCurrentRoadPoints] = useState<
    [number, number][]
  >([]);
  const [routeWaypoints, setRouteWaypoints] = useState<[number, number][]>([]);

  const mapRef = useRef<L.Map>(null);
  const [liveLocationEnabled, setLiveLocationEnabled] =
    useState<boolean>(false);
  const [hasCenteredOnLiveLocation, setHasCenteredOnLiveLocation] =
    useState<boolean>(false);
  const {
    location: userLocation,
    loading: userLocationLoading,
    error: userLocationError,
  } = useGeolocation({}, liveLocationEnabled);

  // Update user location in state
  React.useEffect(() => {
    if (userLocation) {
      setMapState((prev: MapState) => ({ ...prev, userLocation }));
    }
  }, [userLocation]);

  // Listen for external toggle events so parent shells (AppContent) can open the menu
  React.useEffect(() => {
    const handler = () => setIsGeoMenuOpen((prev) => !prev);
    window.addEventListener("toggle-geo-menu", handler as EventListener);
    return () =>
      window.removeEventListener("toggle-geo-menu", handler as EventListener);
  }, []);

  // Listen for live-location toggle events (from AppContent top-right button)
  React.useEffect(() => {
    const handler = () => setLiveLocationEnabled((prev) => !prev);
    window.addEventListener("toggle-live-location", handler as EventListener);
    return () =>
      window.removeEventListener(
        "toggle-live-location",
        handler as EventListener
      );
  }, []);

  // Listen for one-off request events (so external buttons can trigger a request)
  React.useEffect(() => {
    const handler = async () => {
      if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
      }
      try {
        const pos = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
            });
          }
        );
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setMapState((prev) => ({ ...prev, userLocation: coords }));
        if (mapRef.current) mapRef.current.setView(coords, 16);
      } catch (err) {
        logger.warn("One-off geolocation failed (external request)", { err });
        alert(
          "Unable to get location. Please allow location access in your browser."
        );
      }
    };
    window.addEventListener(
      "request-one-off-location",
      handler as EventListener
    );
    return () =>
      window.removeEventListener(
        "request-one-off-location",
        handler as EventListener
      );
  }, []);

  // When live location is first enabled, center the map on user location
  React.useEffect(() => {
    if (
      liveLocationEnabled &&
      userLocation &&
      mapRef.current &&
      !hasCenteredOnLiveLocation
    ) {
      mapRef.current.setView(userLocation, 16);
      setHasCenteredOnLiveLocation(true);
    }
  }, [liveLocationEnabled, userLocation, hasCenteredOnLiveLocation]);

  // Reset the centering flag when live location is disabled
  React.useEffect(() => {
    if (!liveLocationEnabled) {
      setHasCenteredOnLiveLocation(false);
    }
  }, [liveLocationEnabled]);

  // Reset road colors and clear routes when navigation stops
  React.useEffect(() => {
    const handleNavigationStopped = () => {
      setRoadsKey((prev) => prev + 1);
      setRoutes([]); // Clear all routes when navigation stops
      setRouteWaypoints([]); // Clear route waypoints when navigation stops
    };
    window.addEventListener("navigation-stopped", handleNavigationStopped);
    return () =>
      window.removeEventListener("navigation-stopped", handleNavigationStopped);
  }, []);

  // Notify outside world when live location toggles so parent UI can reflect state
  React.useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("live-location-changed", {
        detail: { enabled: liveLocationEnabled },
      })
    );
  }, [liveLocationEnabled]);

  // When navigating, keep updating remaining distance and center map on user
  React.useEffect(() => {
    if (!mapState.isNavigating || !mapState.currentRoute) return;
    if (!userLocation) return;

    const dest =
      mapState.currentRoute.waypoints[
        mapState.currentRoute.waypoints.length - 1
      ];
    const remaining = haversineDistance(
      userLocation[0],
      userLocation[1],
      dest[0],
      dest[1]
    );
    setNavRemainingDistance(remaining);
    // auto-pan the map to user location
    if (mapRef.current) {
      mapRef.current.setView(userLocation, mapRef.current.getZoom());
    }

    // Find the nearest road segment to the user's current location
    const nearestRoadInfo = findNearestRoadAndSegment(userLocation, roads);
    if (nearestRoadInfo) {
      setCurrentUserRoadSegment(nearestRoadInfo.segment);
    }

    // Check if user is close to the next waypoint to advance instructions
    if (mapState.currentRoute && navigationInstructions.length > 1) {
      const nextWaypointIndex =
        mapState.currentRoute.waypoints.length -
        (navigationInstructions.length - 1);
      if (nextWaypointIndex < mapState.currentRoute.waypoints.length) {
        const nextWaypoint = mapState.currentRoute.waypoints[nextWaypointIndex];
        const distanceToNextWaypoint = haversineDistance(
          userLocation[0],
          userLocation[1],
          nextWaypoint[0],
          nextWaypoint[1]
        );

        // If user is within 20 meters of the next waypoint, advance to the next instruction
        if (distanceToNextWaypoint < 20) {
          setNavigationInstructions((prev) => prev.slice(1));
        }
      }
    }
  }, [
    userLocation,
    mapState.isNavigating,
    mapState.currentRoute,
    navigationInstructions,
  ]);

  // Handle north up button click
  const handleNorthUp = () => {
    setMapRotation(0);
  };

  // Handle map rotation
  const rotateMap = (degrees: number) => {
    setMapRotation((prev) => {
      const newRotation = prev + degrees;
      // Normalize to 0-360 degrees
      return ((newRotation % 360) + 360) % 360;
    });
  };

  // Load persisted data from local API (if available)
  React.useEffect(() => {
    (async () => {
      try {
        const [locRes, roadRes] = await Promise.all([
          fetch("/api/locations"),
          fetch("/api/roads"),
        ]);
        if (locRes.ok) {
          const locs = await locRes.json();
          // Ensure createdAt is a Date object
          setLocations(
            locs.map((l: any) => ({ ...l, createdAt: new Date(l.createdAt) }))
          );
        }
        if (roadRes.ok) {
          const rds = await roadRes.json();
          setRoads(
            rds.map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) }))
          );
        }
      } catch (err) {
        const errMsg =
          err && (err as any).message ? (err as any).message : String(err);
        logger.error("Could not load persisted data", { err, errMsg });
        console.error("Could not load persisted data", err);
        // mark backend as offline and show banner
        setBackendOnline(false);
      }
    })();
  }, []);

  // Poll backend health periodically so we can show a banner when unavailable
  React.useEffect(() => {
    let stopped = false;
    const check = async () => {
      try {
        const res = await fetch("/api/locations", { method: "HEAD" });
        if (!stopped) setBackendOnline(res.ok);
      } catch (e) {
        if (!stopped) setBackendOnline(false);
      }
    };
    check();
    const id = setInterval(check, 5000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, []);

  const retryBackend = async () => {
    try {
      const res = await fetch("/api/locations", { method: "HEAD" });
      setBackendOnline(res.ok);
      if (res.ok) {
        // attempt to reload persisted data
        const [locRes, roadRes] = await Promise.all([
          fetch("/api/locations"),
          fetch("/api/roads"),
        ]);
        if (locRes.ok)
          setLocations(
            (await locRes.json()).map((l: any) => ({
              ...l,
              createdAt: new Date(l.createdAt),
            }))
          );
        if (roadRes.ok)
          setRoads(
            (await roadRes.json()).map((r: any) => ({
              ...r,
              createdAt: new Date(r.createdAt),
            }))
          );
      }
    } catch (e) {
      setBackendOnline(false);
    }
  };

  const requestOneOffLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      const coords: [number, number] = [
        pos.coords.latitude,
        pos.coords.longitude,
      ];
      setMapState((prev) => ({ ...prev, userLocation: coords }));
    } catch (err) {
      logger.warn("One-off geolocation failed", { err });
      alert(
        "Unable to get location. Please allow location access in your browser."
      );
    }
  };

  const setManualLocation = () => {
    const input = window.prompt(
      'Enter coordinates as "lat,lng" (for example: 40.7128,-74.0060)'
    );
    if (!input) return;
    const parts = input.split(",").map((s) => s.trim());
    if (parts.length !== 2) {
      alert("Please enter two comma-separated numbers: lat,lng");
      return;
    }
    const lat = Number(parts[0]);
    const lng = Number(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      alert("Invalid numbers provided");
      return;
    }
    const coords: [number, number] = [lat, lng];
    setMapState((prev) => ({ ...prev, userLocation: coords }));
    if (mapRef.current) mapRef.current.setView(coords, 16);
  };

  const handleDeleteLocation = useCallback((id: string) => {
    logger.info("Deleting location", { locationId: id });
    // optimistic UI update
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    fetch(`/api/locations/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok)
          logger.error("Delete location failed", { status: res.status });
      })
      .catch((err) => logger.error("Delete location request error", { err }));
    setIsDeletionModalOpen(false);
    setMode("view");
  }, []);

  const handleDeleteRoad = useCallback((id: string) => {
    logger.info("Deleting road", { roadId: id });
    setRoads((prev) => prev.filter((road) => road.id !== id));
    fetch(`/api/roads/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) logger.error("Delete road failed", { status: res.status });
      })
      .catch((err) => logger.error("Delete road request error", { err }));
    setIsDeletionModalOpen(false);
    setMode("view");
  }, []);

  const handleSaveRoad = useCallback(
    (name: string) => {
      if (tempRoadPoints.length < 2) {
        logger.warn("Cannot save road with less than 2 points");
        return;
      }

      (async () => {
        try {
          const res = await fetch("/api/roads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              type: "custom",
              coordinates: tempRoadPoints,
            }),
          });
          if (res.ok) {
            const created = await res.json();
            const parsed = {
              ...created,
              createdAt: new Date(created.createdAt),
            };
            setRoads((prev) => [...prev, parsed]);
            setTempRoadPoints([]);
            setIsRoadModalOpen(false);
            setMode("view");
            logger.info("Road saved", { road: parsed });
          } else {
            const body = await res.text().catch(() => "<unreadable>");
            logger.error("Failed to save road", { status: res.status, body });
            console.error("Failed to save road", { status: res.status, body });
            alert(`Failed to save road: ${res.status} - ${body}`);
          }
        } catch (err) {
          const errMsg =
            err && (err as any).message ? (err as any).message : String(err);
          logger.error("Failed to save road", { err, errMsg });
          console.error("Failed to save road", err);
          alert(`Failed to save road: ${errMsg}`);
        }
      })();
    },
    [tempRoadPoints]
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      logger.info("Map click handled", { mode, position: [lat, lng] });

      switch (mode) {
        case "add-location":
          setSelectedPosition([lat, lng]);
          setIsLocationModalOpen(true);
          logger.info("Location modal opened", { position: [lat, lng] });
          break;
        case "draw-road":
          setTempRoadPoints((prev) => [...prev, [lat, lng]]);
          if (tempRoadPoints.length >= 1) {
            setIsRoadModalOpen(true);
          }
          logger.info("Road point added", {
            position: [lat, lng],
            pointCount: tempRoadPoints.length + 1,
          });
          break;
        case "plan-route":
          setRouteWaypoints((prev) => [...prev, [lat, lng]]);
          logger.info("Route waypoint added", {
            position: [lat, lng],
            waypointCount: routeWaypoints.length + 1,
          });
          break;
        case "delete-location":
          // try to preselect a nearby location, then open the deletion modal
          const nearestLocId = findNearestLocationId(lat, lng);
          setSelectedItemId(nearestLocId);
          setIsDeletionModalOpen(true);
          logger.info("Opening deletion modal for locations", {
            preselected: nearestLocId,
          });
          break;
        case "delete-road":
          // try to preselect a nearby road, then open the deletion modal
          const nearestRoadId = findNearestRoadId(lat, lng);
          setSelectedItemId(nearestRoadId);
          setIsDeletionModalOpen(true);
          logger.info("Opening deletion modal for roads", {
            preselected: nearestRoadId,
          });
          break;
      }
    },
    [mode, locations, roads]
  );

  // --- Helpers to find nearest items ---
  // Haversine distance in meters between two lat/lng points
  const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3; // meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const toDegrees = (rad: number) => (rad * 180) / Math.PI;

  const calculateBearing = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const φ1 = toRadians(lat1);
    const λ1 = toRadians(lon1);
    const φ2 = toRadians(lat2);
    const λ2 = toRadians(lon2);

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    const brng = (toDegrees(θ) + 360) % 360; // in degrees
    return brng;
  };

  const bearingToDirection = (bearing: number) => {
    const directions = [
      "North",
      "North-East",
      "East",
      "South-East",
      "South",
      "South-West",
      "West",
      "North-West",
    ];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  const findNearestLocationId = useCallback(
    (lat: number, lng: number) => {
      if (!locations || locations.length === 0) return null;
      let bestId: string | null = null;
      let bestDist = Infinity;
      for (const loc of locations) {
        const d = haversineDistance(lat, lng, loc.lat, loc.lng);
        if (d < bestDist) {
          bestDist = d;
          bestId = loc.id;
        }
      }
      // if nearest within 50 meters, return it, otherwise null
      return bestDist <= 50 ? bestId : null;
    },
    [locations]
  );

  // approximate distance from point to line segment (meters)
  const distanceToSegment = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    // Project degrees to meters for small distances using lat scale ~111320 m/deg
    const avgLat = (y1 + y2) / 2;
    const latFactor = 111320;
    const lngFactor = 111320 * Math.cos((avgLat * Math.PI) / 180);

    const Ax = (px - x1) * latFactor;
    const Ay = (py - y1) * lngFactor;
    const Bx = (x2 - x1) * latFactor;
    const By = (y2 - y1) * lngFactor;

    const dot = Ax * Bx + Ay * By;
    const lenSq = Bx * Bx + By * By;
    let param = lenSq !== 0 ? dot / lenSq : -1;

    let xx: number, yy: number;
    if (param < 0) {
      xx = x1 * latFactor;
      yy = y1 * lngFactor;
    } else if (param > 1) {
      xx = x2 * latFactor;
      yy = y2 * lngFactor;
    } else {
      xx = x1 * latFactor + param * Bx;
      yy = y1 * lngFactor + param * By;
    }

    const pxM = px * latFactor;
    const pyM = py * lngFactor;
    const dx = pxM - xx;
    const dy = pyM - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const findNearestRoadId = useCallback(
    (lat: number, lng: number) => {
      if (!roads || roads.length === 0) return null;
      let bestId: string | null = null;
      let bestDist = Infinity;
      for (const road of roads) {
        const coords = road.coordinates;
        for (let i = 0; i < coords.length - 1; i++) {
          const a = coords[i];
          const b = coords[i + 1];
          const d = distanceToSegment(lat, lng, a[0], a[1], b[0], b[1]);
          if (d < bestDist) {
            bestDist = d;
            bestId = road.id;
          }
        }
      }
      // if nearest within 30 meters, return it
      return bestDist <= 30 ? bestId : null;
    },
    [roads]
  );

  // When mode toggles to delete, open the deletion modal. This keeps map clicks
  // as-is and ensures the modal lists available items for deletion.
  React.useEffect(() => {
    if (mode === "delete-location" || mode === "delete-road") {
      setIsDeletionModalOpen(true);
    } else {
      setIsDeletionModalOpen(false);
    }
  }, [mode]);

  const handleSaveLocation = useCallback(
    (locationData: Omit<Location, "id" | "createdAt">) => {
      (async () => {
        try {
          const res = await fetch("/api/locations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(locationData),
          });
          if (res.ok) {
            const created = await res.json();
            const parsed = {
              ...created,
              createdAt: new Date(created.createdAt),
            };
            setLocations((prev) => [...prev, parsed]);
          } else {
            const body = await res.text().catch(() => "<unreadable>");
            logger.error("Failed to save location", {
              status: res.status,
              body,
            });
            console.error("Failed to save location", {
              status: res.status,
              body,
            });
            alert(`Failed to save location: ${res.status} - ${body}`);
          }
        } catch (err) {
          const errMsg =
            err && (err as any).message ? (err as any).message : String(err);
          logger.error("Failed to save location", { err, errMsg });
          console.error("Failed to save location", err);
          alert(`Failed to save location: ${errMsg}`);
        }
      })();
    },
    []
  );

  const handleFinishRoad = useCallback(() => {
    if (currentRoadPoints.length >= 2) {
      (async () => {
        try {
          const res = await fetch("/api/roads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: `Road ${roads.length + 1}`,
              type: "custom",
              coordinates: currentRoadPoints,
            }),
          });
          if (res.ok) {
            const created = await res.json();
            const parsed = {
              ...created,
              createdAt: new Date(created.createdAt),
            };
            setRoads((prev) => [...prev, parsed]);
          } else {
            const body = await res.text().catch(() => "<unreadable>");
            logger.error("Failed to save road", { status: res.status, body });
            console.error("Failed to save road", { status: res.status, body });
            alert(`Failed to save road: ${res.status} - ${body}`);
          }
        } catch (err) {
          const errMsg =
            err && (err as any).message ? (err as any).message : String(err);
          logger.error("Failed to save road", { err, errMsg });
          console.error("Failed to save road", err);
          alert(`Failed to save road: ${errMsg}`);
        }
      })();
      setCurrentRoadPoints([]);
      setMode("view");
    }
  }, [currentRoadPoints, roads.length]);

  const handleFinishRoute = useCallback(() => {
    if (routeWaypoints.length >= 2) {
      const distance = routeWaypoints.reduce((total, point, index) => {
        if (index === 0) return 0;
        const prev = routeWaypoints[index - 1];
        // Simple distance calculation (in meters, approximate)
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (prev[0] * Math.PI) / 180;
        const φ2 = (point[0] * Math.PI) / 180;
        const Δφ = ((point[0] - prev[0]) * Math.PI) / 180;
        const Δλ = ((point[1] - prev[1]) * Math.PI) / 180;
        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return total + R * c;
      }, 0);

      const newRoute: Route = {
        id: Date.now().toString(),
        name: `Route ${routes.length + 1}`,
        waypoints: routeWaypoints,
        distance,
        estimatedTime: (distance / 1000) * 2, // Rough estimate: 2 minutes per km
        createdAt: new Date(),
      };
      setRoutes((prev) => [...prev, newRoute]);
      setRouteWaypoints([]);
      setMode("view");
    }
  }, [routeWaypoints, routes.length]);

  const handleStartNavigation = useCallback(() => {
    // Open start point selection modal
    logger.debug("[NAV-START] handleStartNavigation called");
    setNavigationStep("from");
    setSelectedFromPoint(null);
    setShowDestinationModal(true);
  }, [routes]);

  const handleStopNavigation = useCallback(() => {
    // Stop navigation
    logger.debug("[NAV-STOP] handleStopNavigation called");
    setMapState((prev) => ({
      ...prev,
      isNavigating: false,
      currentRoute: null,
    }));
    window.dispatchEvent(new CustomEvent("navigation-stopped"));
  }, []);

  // handleGoToCurrentLocation removed — use requestOneOffLocation or geolocation hook instead

  // Compute a straight-line route and simple instructions from start to dest
  const computeRouteAndInstructions = useCallback(
    (start: [number, number], dest: [number, number]) => {
      // Try to compute a path along user-created roads
      const roadResult = routeAlongRoads(start, dest, roads);
      if (roadResult && roadResult.waypoints.length > 1) {
        const { waypoints, distance } = roadResult;
        const instructions: string[] = [];

        // Initial instruction
        const initialBearing = calculateBearing(
          waypoints[0][0],
          waypoints[0][1],
          waypoints[1][0],
          waypoints[1][1]
        );
        const initialDirection = bearingToDirection(initialBearing);
        const firstSegmentDistance = haversineDistance(
          waypoints[0][0],
          waypoints[0][1],
          waypoints[1][0],
          waypoints[1][1]
        );
        instructions.push(
          `Head ${initialDirection} for ${Math.round(firstSegmentDistance)} m.`
        );

        // Generate turn instructions
        for (let i = 1; i < waypoints.length - 1; i++) {
          const prevPoint = waypoints[i - 1];
          const currentPoint = waypoints[i];
          const nextPoint = waypoints[i + 1];

          const bearingIn = calculateBearing(
            prevPoint[0],
            prevPoint[1],
            currentPoint[0],
            currentPoint[1]
          );
          const bearingOut = calculateBearing(
            currentPoint[0],
            currentPoint[1],
            nextPoint[0],
            nextPoint[1]
          );

          let turnAngle = bearingOut - bearingIn;
          if (turnAngle > 180) turnAngle -= 360;
          if (turnAngle < -180) turnAngle += 360;

          let turnDirection = "";
          if (turnAngle > 135 || turnAngle < -135) {
            turnDirection = "Make a U-turn";
          } else if (turnAngle > 45) {
            turnDirection = "Turn right";
          } else if (turnAngle > 15) {
            turnDirection = "Make a slight right";
          } else if (turnAngle < -45) {
            turnDirection = "Turn left";
          } else if (turnAngle < -15) {
            turnDirection = "Make a slight left";
          }

          const segmentDistance = haversineDistance(
            currentPoint[0],
            currentPoint[1],
            nextPoint[0],
            nextPoint[1]
          );
          if (turnDirection) {
            instructions.push(
              `${turnDirection}, then continue for ${Math.round(
                segmentDistance
              )} m.`
            );
          }
        }

        instructions.push("You will arrive at your destination.");

        const estimatedMinutes = (distance / 1000) * 2;
        const newRoute: Route = {
          id: Date.now().toString(),
          name: `Nav via roads`,
          waypoints,
          distance,
          estimatedTime: estimatedMinutes,
          createdAt: new Date(),
        };
        return { route: newRoute, instructions, distance, estimatedMinutes };
      }

      // Fallback to straight-line route
      const distance = haversineDistance(start[0], start[1], dest[0], dest[1]);
      const estimatedMinutes = (distance / 1000) * 2; // 2 minutes per km
      const instructions = [
        `Head towards destination (${
          distance < 1000
            ? `${Math.round(distance)} m`
            : `${(distance / 1000).toFixed(1)} km`
        })`,
      ];
      const newRoute: Route = {
        id: Date.now().toString(),
        name: `Nav to destination`,
        waypoints: [start, dest],
        distance,
        estimatedTime: estimatedMinutes,
        createdAt: new Date(),
      };
      return { route: newRoute, instructions, distance, estimatedMinutes };
    },
    [roads]
  );

  // When the Start Navigation flow is triggered, we open destination modal. On select we compute route and ask for confirmation.
  const handleSelectDestination = useCallback(
    async (loc: Location) => {
      if (navigationStep === "from") {
        // User selected the "From" point
        setSelectedFromPoint(loc);
        setNavigationStep("to");
      } else {
        // User selected the "To" (destination) point
        let start: [number, number];
        if (selectedFromPoint?.id === "user-location") {
          // Start from user's current location
          start = userLocation || [40.7128, -74.006]; // Fallback to default
          if (!userLocation) {
            if (!navigator.geolocation) {
              alert("Geolocation not supported");
              return;
            }
            try {
              const pos = await new Promise<GeolocationPosition>(
                (resolve, reject) => {
                  navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                  });
                }
              );
              start = [pos.coords.latitude, pos.coords.longitude];
              setMapState((prev) => ({ ...prev, userLocation: start }));
            } catch (err) {
              alert(
                "Unable to get current location. Please allow location access."
              );
              return;
            }
          }
        } else {
          // Start from selected location
          start = [selectedFromPoint!.lat, selectedFromPoint!.lng];
        }

        const {
          route: computedRoute,
          instructions,
          distance,
        } = computeRouteAndInstructions(start, [loc.lat, loc.lng]);
        setNavRemainingDistance(distance);
        setNavigationInstructions(instructions);
        // save computed route temporarily and show confirm
        setRoutes((prev) => [...prev, computedRoute]);
        setShowConfirmNavModal(true);
        setShowDestinationModal(false);
      }
    },
    [
      navigationStep,
      selectedFromPoint,
      userLocation,
      computeRouteAndInstructions,
    ]
  );

  const handleConfirmStartNavigation = useCallback(() => {
    // start the last route (the computed one we appended)
    if (routes.length > 0) {
      const latestRoute = routes[routes.length - 1];
      setMapState((prev) => ({
        ...prev,
        isNavigating: true,
        currentRoute: latestRoute,
      }));
      // Dispatch navigation start event
      window.dispatchEvent(
        new CustomEvent("navigation-started", {
          detail: { route: latestRoute, instructions: navigationInstructions },
        })
      );
      setShowConfirmNavModal(false);
      setMode("view");
    }
  }, [routes, navigationInstructions]);

  // Handle keyboard shortcuts for finishing drawing
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (mode === "draw-road" && currentRoadPoints.length >= 2) {
          handleFinishRoad();
        } else if (mode === "plan-route" && routeWaypoints.length >= 2) {
          handleFinishRoute();
        }
      } else if (e.key === "Escape") {
        if (mapState.isNavigating) {
          // Stop navigation
          setMapState((prev) => ({
            ...prev,
            isNavigating: false,
            currentRoute: null,
          }));
          window.dispatchEvent(new CustomEvent("navigation-stopped"));
        } else {
          setCurrentRoadPoints([]);
          setRouteWaypoints([]);
          setMode("view");
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    mode,
    currentRoadPoints,
    routeWaypoints,
    handleFinishRoad,
    handleFinishRoute,
    mapState.isNavigating,
  ]);

  // Set cursor style based on mode
  const getCursorStyle = () => {
    switch (mode) {
      case "delete-location":
      case "delete-road":
        return "cursor-crosshair";
      default:
        return "";
    }
  };

  const [isFullScreen, setIsFullScreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!mapContainerRef.current) return;

    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  React.useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullScreenChange);
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className={`relative w-full h-full overflow-hidden ${getCursorStyle()}`}
    >
      {mapState.isNavigating && navigationInstructions.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm w-full">
          <div className="flex items-center">
            <div className="mr-4">
              <span className="text-3xl">➡️</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {navigationInstructions[0]}
              </p>
              {navigationInstructions.length > 1 && (
                <p className="text-sm text-gray-600 mt-1">
                  Next: {navigationInstructions[1]}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div
        className="w-full h-full z-0"
        style={{ transform: `rotate(${mapRotation}deg) scale(1.5)` }}
      >
        <MapContainer
          center={mapState.center}
          zoom={mapState.zoom}
          className="w-full h-full"
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapEventsHandler mode={mode} onMapClick={handleMapClick} />

          {/* User location marker */}
          {mapState.userLocation && (
            <Marker position={mapState.userLocation} icon={userLocationIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-blue-600">Your Location</p>
                  <p className="text-sm text-gray-600">
                    {mapState.userLocation[0].toFixed(6)},{" "}
                    {mapState.userLocation[1].toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Location markers */}
          {showLocations &&
            locations.map((location) => (
              <Marker
                key={location.id}
                position={[location.lat, location.lng]}
                icon={createCustomIcon(location.category, location.name)}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {location.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {location.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      <p>Category: {location.category}</p>
                      <p>
                        Coordinates: {location.lat.toFixed(6)},{" "}
                        {location.lng.toFixed(6)}
                      </p>
                      <p>Added: {location.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Roads */}
          {showRoads && (
            <React.Fragment key={roadsKey}>
              {/* Draw all roads with default color */}
              {roads.map((road) => (
                <Polyline
                  key={road.id}
                  positions={road.coordinates}
                  pathOptions={{ color: "#10B981", weight: 4, opacity: 0.8 }}
                />
              ))}

              {/* Highlight the current route if navigating */}
              {mapState.isNavigating && mapState.currentRoute && (
                <Polyline
                  positions={mapState.currentRoute.waypoints}
                  pathOptions={{ color: "violet", weight: 6, opacity: 0.9 }}
                />
              )}

              {/* Current road being drawn */}
              {currentRoadPoints.length > 1 && (
                <Polyline
                  positions={currentRoadPoints}
                  pathOptions={{
                    color: "#F59E0B",
                    weight: 4,
                    opacity: 0.8,
                    dashArray: "10, 10",
                  }}
                />
              )}
            </React.Fragment>
          )}
        </MapContainer>
      </div>

      {/* Log Viewer */}
      <LogViewer />

      {/* Backend banner */}
      <BackendBanner online={backendOnline} onRetry={retryBackend} />
      {/* Destination selection modal */}
      <DestinationModal
        isOpen={showDestinationModal}
        locations={locations}
        onSelect={handleSelectDestination}
        onCancel={() => {
          setShowDestinationModal(false);
          setNavigationStep("from");
          setSelectedFromPoint(null);
        }}
        navigationStep={navigationStep}
        selectedFromPoint={selectedFromPoint}
      />

      <ConfirmNavigationModal
        isOpen={showConfirmNavModal}
        distanceMeters={navRemainingDistance}
        estimatedMinutes={(navRemainingDistance / 1000) * 2}
        onConfirm={handleConfirmStartNavigation}
        onCancel={() => {
          setShowConfirmNavModal(false);
        }}
      />

      {/* Controls */}
      <button
        onClick={() => setIsMapControlsOpen(!isMapControlsOpen)}
        className="absolute top-4 left-4 z-[1001] bg-white rounded-full shadow-lg p-3 hover:bg-gray-100 transition-colors"
        title="Toggle Map Controls"
      >
        <Pencil className="w-5 h-5 text-gray-700" />
      </button>

      {isMapControlsOpen && (
        <MapControls
          mode={mode}
          setMode={setMode}
          showLocations={showLocations}
          setShowLocations={setShowLocations}
          showRoads={showRoads}
          setShowRoads={setShowRoads}
          isNavigating={mapState.isNavigating}
          onStartNavigation={handleStartNavigation}
          onStopNavigation={handleStopNavigation}
          onNorthUp={handleNorthUp}
          userLocation={mapState.userLocation}
        />
      )}
      {/* Geolocation Menu */}
      {isGeoMenuOpen && (
        <div className="fixed top-24 right-6 z-[1000] bg-white rounded-md shadow p-3 text-sm max-w-xs">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-medium">Location</div>
            <button
              aria-label="Close location menu"
              onClick={() => setIsGeoMenuOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="mb-2">
            {userLocationLoading ? (
              <span className="text-gray-600">Finding location…</span>
            ) : userLocation ? (
              <span className="text-green-700">Location available</span>
            ) : userLocationError ? (
              <div>
                <p className="text-red-600 font-medium">Location error</p>
                <p className="text-xs text-gray-600">{userLocationError}</p>
              </div>
            ) : (
              <span className="text-red-600">Location unavailable</span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={requestOneOffLocation}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
            >
              Request location
            </button>
            <button
              onClick={setManualLocation}
              className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
            >
              Set manually
            </button>

            <button
              onClick={() =>
                window.open(
                  "https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API#permissions_and_privacy",
                  "_blank"
                )
              }
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              Help
            </button>
          </div>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={handleSaveLocation}
        position={selectedPosition}
      />

      {/* Road Modal */}
      {isRoadModalOpen && (
        <RoadModal
          onSave={handleSaveRoad}
          onCancel={() => {
            setIsRoadModalOpen(false);
            setTempRoadPoints([]);
            setMode("view");
          }}
        />
      )}

      {/* Deletion Modal */}
      {isDeletionModalOpen && (
        <DeletionModal
          type={mode === "delete-location" ? "location" : "road"}
          items={mode === "delete-location" ? locations : roads}
          onDelete={(id) => {
            if (mode === "delete-location") {
              handleDeleteLocation(id);
            } else {
              handleDeleteRoad(id);
            }
            setSelectedItemId(null);
          }}
          onCancel={() => {
            setIsDeletionModalOpen(false);
            setSelectedItemId(null);
            setMode("view");
          }}
          selectedId={selectedItemId ?? undefined}
        />
      )}

      {/* Instructions overlay */}
      {(mode === "draw-road" || mode === "plan-route") && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-md">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 mb-2">
              {mode === "draw-road" ? "Draw Road Mode" : "Plan Route Mode"}
            </p>
            <p className="text-xs text-gray-600 mb-2">
              Click on the map to add points. Need at least 2 points.
            </p>
            <div className="flex space-x-2 justify-center">
              <button
                onClick={
                  mode === "draw-road" ? handleFinishRoad : handleFinishRoute
                }
                disabled={
                  (mode === "draw-road" ? currentRoadPoints : routeWaypoints)
                    .length < 2
                }
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finish (Enter)
              </button>
              <button
                onClick={() => {
                  setCurrentRoadPoints([]);
                  setRouteWaypoints([]);
                  setMode("view");
                }}
                className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
              >
                Cancel (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
      {/* North Up Button */}
      {mapState.isNavigating && mapState.userLocation && (
        <button
          onClick={handleNorthUp}
          className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2 hover:bg-gray-100 transition-colors"
          title="Set North Up"
        >
          <Compass className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Map Controls Panel */}
      <div className="absolute bottom-2 inset-x-4 z-[1000] bg-black/20 backdrop-blur-sm rounded-xl p-2 flex justify-between items-center">
        {/* Zoom Controls */}
        <div className="flex space-x-2">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg transition-colors hover:bg-gray-100"
            title="Zoom In"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg transition-colors hover:bg-gray-100"
            title="Zoom Out"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullScreen}
          className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-lg transition-colors hover:bg-gray-100"
          title="Toggle Fullscreen"
        >
          {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>

        {/* Rotation Controls */}
        <div className="flex space-x-2">
          <button
            onClick={() => rotateMap(-15)}
            className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg transition-colors hover:bg-gray-100"
            title="Rotate Left"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => rotateMap(15)}
            className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg transition-colors hover:bg-gray-100"
            title="Rotate Right"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
