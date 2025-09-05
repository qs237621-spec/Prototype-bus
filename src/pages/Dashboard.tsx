import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BusMap } from '../components/BusMap';
import { RouteList } from '../components/RouteList';
import { StopDetails } from '../components/StopDetails';
import { MockDataService, User } from '../services/mockData';
import { useRealTimeTracking, useLowBandwidthMode } from '../hooks/useRealTimeTracking';
import { MapPin, Navigation, Clock, Menu, X, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedStop, setSelectedStop] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentView, setCurrentView] = useState<'map' | 'routes' | 'stop'>('map');

  const dataService = MockDataService.getInstance();
  const { buses, arrivals, lastUpdated, isLoading, error, getStopArrivals, refreshData } = useRealTimeTracking(15000);
  const { isLowBandwidthMode, connectionQuality } = useLowBandwidthMode();

  const routes = dataService.getRoutes();
  const stops = dataService.getStops();

  // Handle route selection
  const handleRouteSelect = (routeId: string) => {
    if (selectedRoute === routeId) {
      setSelectedRoute('');
    } else {
      setSelectedRoute(routeId);
      setSelectedStop('');
    }
    setCurrentView('map');
    setShowSidebar(false);
  };

  // Handle stop selection
  const handleStopSelect = (stopId: string) => {
    setSelectedStop(stopId);
    setCurrentView('stop');
    setShowSidebar(false);
  };

  // Handle bus click
  const handleBusClick = (busId: string) => {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
      setSelectedRoute(bus.routeId);
      setCurrentView('map');
    }
  };

  // Get selected stop data
  const selectedStopData = selectedStop ? stops.find(s => s.id === selectedStop) : null;
  const selectedStopArrivals = selectedStop ? getStopArrivals(selectedStop) : [];

  // Get connection status
  const getConnectionStatus = () => {
    switch (connectionQuality) {
      case 'slow':
        return { icon: WifiOff, text: 'Slow Connection', color: 'text-red-500' };
      case 'medium':
        return { icon: Wifi, text: '3G Connection', color: 'text-yellow-500' };
      case 'fast':
        return { icon: Wifi, text: 'Fast Connection', color: 'text-green-500' };
      default:
        return { icon: Wifi, text: 'Unknown', color: 'text-gray-500' };
    }
  };

  const connectionStatus = getConnectionStatus();
  const ConnectionIcon = connectionStatus.icon;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden"
          >
            {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <Navigation className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Bus Tracker</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="hidden sm:flex items-center gap-2">
            <ConnectionIcon className={`h-4 w-4 ${connectionStatus.color}`} />
            <span className="text-sm text-gray-600">{connectionStatus.text}</span>
          </div>

          {/* Low bandwidth indicator */}
          {isLowBandwidthMode && (
            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
              Low Bandwidth Mode
            </Badge>
          )}

          {/* Last updated */}
          <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>

          {/* Refresh button */}
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {/* User menu */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {user.role === 'admin' ? 'Admin' : 'Commuter'}
            </Badge>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Routes */}
        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative absolute inset-y-0 left-0 z-30
          w-80 bg-white border-r shadow-lg md:shadow-none
          transition-transform duration-300 ease-in-out
          flex flex-col
        `}>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Routes & Stops</h2>
            <p className="text-sm text-gray-600">
              {routes.filter(r => r.isActive).length} active routes
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <RouteList
              routes={routes}
              stops={stops}
              buses={buses}
              selectedRoute={selectedRoute}
              onRouteSelect={handleRouteSelect}
              onStopSelect={handleStopSelect}
            />
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* View selector for mobile */}
          <div className="md:hidden bg-white border-b px-4 py-2">
            <div className="flex gap-2">
              <Button
                variant={currentView === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('map')}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Map
              </Button>
              <Button
                variant={currentView === 'routes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('routes')}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Routes
              </Button>
              {selectedStopData && (
                <Button
                  variant={currentView === 'stop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('stop')}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Stop Details
                </Button>
              )}
            </div>
          </div>

          {/* Content based on current view */}
          <div className="flex-1 p-4">
            {/* Desktop layout */}
            <div className="hidden md:flex h-full gap-4">
              {/* Map */}
              <div className="flex-1">
                <BusMap
                  buses={buses}
                  stops={stops}
                  routes={routes}
                  selectedRoute={selectedRoute}
                  selectedStop={selectedStop}
                  onStopClick={handleStopSelect}
                  onBusClick={handleBusClick}
                  className="h-full"
                />
              </div>

              {/* Stop details sidebar */}
              {selectedStopData && (
                <div className="w-80">
                  <StopDetails
                    stop={selectedStopData}
                    routes={routes}
                    arrivals={selectedStopArrivals}
                    onClose={() => setSelectedStop('')}
                    onRefresh={refreshData}
                    className="h-full"
                  />
                </div>
              )}
            </div>

            {/* Mobile layout */}
            <div className="md:hidden h-full">
              {currentView === 'map' && (
                <BusMap
                  buses={buses}
                  stops={stops}
                  routes={routes}
                  selectedRoute={selectedRoute}
                  selectedStop={selectedStop}
                  onStopClick={handleStopSelect}
                  onBusClick={handleBusClick}
                  className="h-full"
                />
              )}

              {currentView === 'routes' && (
                <div className="h-full overflow-y-auto">
                  <RouteList
                    routes={routes}
                    stops={stops}
                    buses={buses}
                    selectedRoute={selectedRoute}
                    onRouteSelect={handleRouteSelect}
                    onStopSelect={handleStopSelect}
                  />
                </div>
              )}

              {currentView === 'stop' && selectedStopData && (
                <div className="h-full overflow-y-auto">
                  <StopDetails
                    stop={selectedStopData}
                    routes={routes}
                    arrivals={selectedStopArrivals}
                    onClose={() => {
                      setSelectedStop('');
                      setCurrentView('map');
                    }}
                    onRefresh={refreshData}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">Connection Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed top-20 right-4 bg-blue-100 border border-blue-300 text-blue-700 px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
};