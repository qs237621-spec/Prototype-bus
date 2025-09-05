import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Route, BusStop, Bus } from '../services/mockData';
import { Search, MapPin, Clock, Users, Navigation } from 'lucide-react';

interface RouteListProps {
  routes: Route[];
  stops: BusStop[];
  buses: Bus[];
  selectedRoute?: string;
  onRouteSelect: (routeId: string) => void;
  onStopSelect?: (stopId: string) => void;
  className?: string;
}

export const RouteList: React.FC<RouteListProps> = ({
  routes,
  stops,
  buses,
  selectedRoute,
  onRouteSelect,
  onStopSelect,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllRoutes, setShowAllRoutes] = useState(true);

  // Filter routes based on search term
  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.stops.some(stopId => {
      const stop = stops.find(s => s.id === stopId);
      return stop?.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Get active buses for a route
  const getActiveBusesForRoute = (routeId: string): Bus[] => {
    return buses.filter(bus => bus.routeId === routeId && bus.isActive);
  };

  // Get stops for a route
  const getStopsForRoute = (routeId: string): BusStop[] => {
    const route = routes.find(r => r.id === routeId);
    if (!route) return [];
    
    return route.stops
      .map(stopId => stops.find(stop => stop.id === stopId))
      .filter(stop => stop !== undefined) as BusStop[];
  };

  // Get next scheduled departure
  const getNextDeparture = (route: Route): string => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    const schedule = isWeekend ? route.schedule.weekend : route.schedule.weekday;
    const nextDeparture = schedule.find(time => time > currentTime);
    
    return nextDeparture || schedule[0] || 'No schedule';
  };

  const RouteCard: React.FC<{ route: Route; isSelected: boolean }> = ({ route, isSelected }) => {
    const activeBuses = getActiveBusesForRoute(route.id);
    const routeStops = getStopsForRoute(route.id);
    const nextDeparture = getNextDeparture(route);

    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
        onClick={() => onRouteSelect(route.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: route.color }}
              />
              {route.name}
            </CardTitle>
            <Badge variant={route.isActive ? "default" : "secondary"}>
              {route.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Active buses */}
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {activeBuses.length} bus{activeBuses.length !== 1 ? 'es' : ''} active
            </span>
            {activeBuses.length > 0 && (
              <div className="flex gap-1">
                {activeBuses.map(bus => (
                  <Badge 
                    key={bus.id}
                    variant="outline"
                    className={`text-xs ${
                      bus.occupancy === 'high' ? 'border-red-300 text-red-700' :
                      bus.occupancy === 'medium' ? 'border-yellow-300 text-yellow-700' :
                      'border-green-300 text-green-700'
                    }`}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {bus.occupancy}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Next departure */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Next departure: <span className="font-medium">{nextDeparture}</span>
            </span>
          </div>

          {/* Route stops preview */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {routeStops.length} stops
            </span>
          </div>

          {/* Show stops when route is selected */}
          {isSelected && (
            <div className="mt-4 pt-3 border-t">
              <h4 className="font-medium text-sm mb-2">Stops on this route:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {routeStops.map((stop, index) => (
                  <div 
                    key={stop.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStopSelect?.(stop.id);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-6">{index + 1}</span>
                      <span>{stop.name}</span>
                    </div>
                    {stop.facilities.includes('wheelchair_access') && (
                      <Badge variant="outline" className="text-xs">♿</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search routes or stops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={showAllRoutes ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllRoutes(true)}
              >
                All Routes ({routes.length})
              </Button>
              <Button
                variant={!showAllRoutes ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllRoutes(false)}
              >
                Active Only ({routes.filter(r => r.isActive).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routes list */}
      <div className="space-y-3">
        {filteredRoutes
          .filter(route => showAllRoutes || route.isActive)
          .map(route => (
            <RouteCard
              key={route.id}
              route={route}
              isSelected={selectedRoute === route.id}
            />
          ))}
      </div>

      {filteredRoutes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};