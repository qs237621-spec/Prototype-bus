import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BusStop, Route, Arrival } from '../services/mockData';
import { MapPin, Clock, Navigation, Users, Wifi, Accessibility, Home, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StopDetailsProps {
  stop: BusStop;
  routes: Route[];
  arrivals: Arrival[];
  onClose?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export const StopDetails: React.FC<StopDetailsProps> = ({
  stop,
  routes,
  arrivals,
  onClose,
  onRefresh,
  className = ''
}) => {
  // Get facility icon
  const getFacilityIcon = (facility: string) => {
    switch (facility) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'wheelchair_access':
        return <Accessibility className="h-4 w-4" />;
      case 'shelter':
        return <Home className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  // Get facility display name
  const getFacilityName = (facility: string) => {
    switch (facility) {
      case 'wheelchair_access':
        return 'Wheelchair Access';
      case 'digital_display':
        return 'Digital Display';
      case 'bike_rack':
        return 'Bike Rack';
      default:
        return facility.charAt(0).toUpperCase() + facility.slice(1);
    }
  };

  // Format arrival time
  const formatArrivalTime = (arrival: Arrival) => {
    const now = new Date();
    const arrivalTime = new Date(arrival.estimatedTime);
    const diffMinutes = Math.round((arrivalTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes <= 0) {
      return 'Arriving now';
    } else if (diffMinutes === 1) {
      return '1 minute';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    } else {
      return arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Get route for arrival
  const getRouteForArrival = (arrival: Arrival) => {
    return routes.find(route => route.id === arrival.routeId);
  };

  // Sort arrivals by estimated time
  const sortedArrivals = [...arrivals].sort((a, b) => 
    new Date(a.estimatedTime).getTime() - new Date(b.estimatedTime).getTime()
  );

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            {stop.name}
          </CardTitle>
          <div className="flex gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stop Information */}
        <div>
          <h3 className="font-medium mb-3">Stop Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Location</p>
              <p className="font-medium">
                {stop.location.lat.toFixed(4)}, {stop.location.lng.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Routes</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {stop.routes.map(routeId => {
                  const route = routes.find(r => r.id === routeId);
                  return route ? (
                    <Badge 
                      key={routeId}
                      variant="secondary"
                      style={{ 
                        backgroundColor: route.color + '20', 
                        color: route.color,
                        borderColor: route.color + '40'
                      }}
                    >
                      {route.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Facilities */}
        {stop.facilities.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Facilities</h3>
            <div className="grid grid-cols-2 gap-2">
              {stop.facilities.map(facility => (
                <div key={facility} className="flex items-center gap-2 text-sm">
                  {getFacilityIcon(facility)}
                  <span>{getFacilityName(facility)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Arrivals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Live Arrivals</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              Updated {formatDistanceToNow(new Date(), { addSuffix: true })}
            </div>
          </div>

          {sortedArrivals.length > 0 ? (
            <div className="space-y-3">
              {sortedArrivals.slice(0, 8).map((arrival, index) => {
                const route = getRouteForArrival(arrival);
                if (!route) return null;

                const arrivalTime = formatArrivalTime(arrival);
                const isDelayed = arrival.delay > 0;
                const isEarly = arrival.delay < 0;

                return (
                  <div 
                    key={`${arrival.busId}-${arrival.stopId}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: route.color }}
                      />
                      <div>
                        <p className="font-medium text-sm">{route.name}</p>
                        <p className="text-xs text-gray-600">Bus {arrival.busId}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-gray-400" />
                        <span className={`font-medium ${
                          arrivalTime === 'Arriving now' ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {arrivalTime}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1">
                        {(isDelayed || isEarly) && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              isDelayed ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'
                            }`}
                          >
                            {isDelayed ? '+' : ''}{arrival.delay}min
                          </Badge>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            arrival.confidence > 0.8 ? 'bg-green-500' :
                            arrival.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-xs text-gray-500">
                            {Math.round(arrival.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No arrivals scheduled</p>
              <p className="text-sm">Check back later for bus arrival times</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};