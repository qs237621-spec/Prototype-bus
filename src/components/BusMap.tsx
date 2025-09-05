import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, BusStop, Route } from '../services/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Users } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const createBusIcon = (color: string, occupancy: string) => {
  const occupancyColor = occupancy === 'high' ? '#ef4444' : occupancy === 'medium' ? '#f59e0b' : '#10b981';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid ${occupancyColor};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-bus-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Custom stop icon
const createStopIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #3b82f6;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'custom-stop-icon',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

interface BusMapProps {
  buses: Bus[];
  stops: BusStop[];
  routes: Route[];
  selectedRoute?: string;
  selectedStop?: string;
  onStopClick?: (stopId: string) => void;
  onBusClick?: (busId: string) => void;
  className?: string;
}

// Component to handle map updates
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

export const BusMap: React.FC<BusMapProps> = ({
  buses,
  stops,
  routes,
  selectedRoute,
  selectedStop,
  onStopClick,
  onBusClick,
  className = ''
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(13);

  // Filter data based on selected route
  const filteredBuses = selectedRoute 
    ? buses.filter(bus => bus.routeId === selectedRoute)
    : buses;

  const filteredStops = selectedRoute
    ? stops.filter(stop => stop.routes.includes(selectedRoute))
    : stops;

  const selectedRouteData = selectedRoute 
    ? routes.find(route => route.id === selectedRoute)
    : null;

  // Create route polyline coordinates
  const getRouteCoordinates = (route: Route): [number, number][] => {
    return route.stops
      .map(stopId => stops.find(stop => stop.id === stopId))
      .filter(stop => stop !== undefined)
      .map(stop => [stop!.location.lat, stop!.location.lng]);
  };

  // Update map center when route is selected
  useEffect(() => {
    if (selectedRouteData && filteredStops.length > 0) {
      const bounds = filteredStops.map(stop => [stop.location.lat, stop.location.lng]);
      const centerLat = bounds.reduce((sum, coord) => sum + coord[0], 0) / bounds.length;
      const centerLng = bounds.reduce((sum, coord) => sum + coord[1], 0) / bounds.length;
      setMapCenter([centerLat, centerLng]);
      setMapZoom(12);
    }
  }, [selectedRouteData, filteredStops]);

  const getOccupancyText = (occupancy: string) => {
    switch (occupancy) {
      case 'low': return 'Low occupancy';
      case 'medium': return 'Medium occupancy';
      case 'high': return 'High occupancy';
      default: return 'Unknown occupancy';
    }
  };

  const getOccupancyColor = (occupancy: string) => {
    switch (occupancy) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`h-full overflow-hidden ${className}`}>
      <div className="h-full relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full"
          zoomControl={true}
        >
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="/images/MapTiles.jpg"
          />

          {/* Route polylines */}
          {selectedRouteData && (
            <Polyline
              positions={getRouteCoordinates(selectedRouteData)}
              color={selectedRouteData.color}
              weight={4}
              opacity={0.7}
            />
          )}

          {/* Bus stops */}
          {filteredStops.map(stop => (
            <Marker
              key={stop.id}
              position={[stop.location.lat, stop.location.lng]}
              icon={createStopIcon()}
              eventHandlers={{
                click: () => onStopClick?.(stop.id)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold">{stop.name}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Routes:</p>
                      <div className="flex flex-wrap gap-1">
                        {stop.routes.map(routeId => {
                          const route = routes.find(r => r.id === routeId);
                          return route ? (
                            <Badge 
                              key={routeId} 
                              variant="secondary"
                              style={{ backgroundColor: route.color + '20', color: route.color }}
                            >
                              {route.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    {stop.facilities.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Facilities:</p>
                        <p className="text-sm">{stop.facilities.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Buses */}
          {filteredBuses.map(bus => {
            const route = routes.find(r => r.id === bus.routeId);
            if (!route) return null;

            return (
              <Marker
                key={bus.id}
                position={[bus.currentLocation.lat, bus.currentLocation.lng]}
                icon={createBusIcon(route.color, bus.occupancy)}
                eventHandlers={{
                  click: () => onBusClick?.(bus.id)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold">Bus {bus.id}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Route:</p>
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: route.color + '20', color: route.color }}
                        >
                          {route.name}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <Badge className={getOccupancyColor(bus.occupancy)}>
                          {getOccupancyText(bus.occupancy)}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>Speed: {Math.round(bus.speed)} km/h</p>
                        <p>Last updated: {bus.lastUpdated.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map legend */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
          <h4 className="font-semibold text-sm mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Bus Stops</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-green-500"></div>
              <span>Bus (Low occupancy)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-yellow-500"></div>
              <span>Bus (Medium occupancy)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-red-500"></div>
              <span>Bus (High occupancy)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};