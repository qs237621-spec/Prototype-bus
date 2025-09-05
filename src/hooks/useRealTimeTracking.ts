import { useState, useEffect, useCallback } from 'react';
import { MockDataService, Bus, Arrival } from '../services/mockData';

export interface TrackingData {
  buses: Bus[];
  arrivals: Map<string, Arrival[]>;
  lastUpdated: Date;
}

interface NavigatorConnection {
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NavigatorConnection;
}

export const useRealTimeTracking = (updateInterval: number = 10000) => {
  const [trackingData, setTrackingData] = useState<TrackingData>({
    buses: [],
    arrivals: new Map(),
    lastUpdated: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataService = MockDataService.getInstance();

  const updateTrackingData = useCallback(() => {
    try {
      // Get all buses and update their positions
      const buses = dataService.getBuses();
      const updatedBuses = buses.map(bus => {
        if (bus.isActive) {
          return dataService.updateBusLocation(bus.id) || bus;
        }
        return bus;
      });

      // Calculate arrivals for all stops
      const stops = dataService.getStops();
      const arrivalsMap = new Map<string, Arrival[]>();
      
      stops.forEach(stop => {
        const arrivals = dataService.calculateArrivals(stop.id);
        arrivalsMap.set(stop.id, arrivals);
      });

      setTrackingData({
        buses: updatedBuses,
        arrivals: arrivalsMap,
        lastUpdated: new Date()
      });

      setError(null);
    } catch (err) {
      setError('Failed to update tracking data');
      console.error('Tracking update error:', err);
    }
  }, [dataService]);

  // Initialize and start real-time updates
  useEffect(() => {
    setIsLoading(true);
    
    // Initial data load
    updateTrackingData();
    setIsLoading(false);

    // Set up interval for real-time updates
    const interval = setInterval(updateTrackingData, updateInterval);

    return () => {
      clearInterval(interval);
    };
  }, [updateTrackingData, updateInterval]);

  // Get arrivals for a specific stop
  const getStopArrivals = useCallback((stopId: string): Arrival[] => {
    return trackingData.arrivals.get(stopId) || [];
  }, [trackingData.arrivals]);

  // Get buses for a specific route
  const getRouteBuses = useCallback((routeId: string): Bus[] => {
    return trackingData.buses.filter(bus => bus.routeId === routeId && bus.isActive);
  }, [trackingData.buses]);

  // Force refresh data
  const refreshData = useCallback(() => {
    setIsLoading(true);
    updateTrackingData();
    setIsLoading(false);
  }, [updateTrackingData]);

  return {
    buses: trackingData.buses,
    arrivals: trackingData.arrivals,
    lastUpdated: trackingData.lastUpdated,
    isLoading,
    error,
    getStopArrivals,
    getRouteBuses,
    refreshData
  };
};

// Hook for connection quality detection
export const useConnectionQuality = () => {
  const [connectionQuality, setConnectionQuality] = useState<'slow' | 'medium' | 'fast'>('medium');

  useEffect(() => {
    // Simple connection quality detection based on navigator.connection
    const updateConnectionQuality = () => {
      if ('connection' in navigator) {
        const connection = (navigator as NavigatorWithConnection).connection;
        const effectiveType = connection?.effectiveType;
        
        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            setConnectionQuality('slow');
            break;
          case '3g':
            setConnectionQuality('medium');
            break;
          case '4g':
          default:
            setConnectionQuality('fast');
            break;
        }
      }
    };

    updateConnectionQuality();

    if ('connection' in navigator) {
      const connection = (navigator as NavigatorWithConnection).connection;
      connection?.addEventListener?.('change', updateConnectionQuality);
      
      return () => {
        connection?.removeEventListener?.('change', updateConnectionQuality);
      };
    }
  }, []);

  return connectionQuality;
};

// Hook for low bandwidth optimization
export const useLowBandwidthMode = () => {
  const connectionQuality = useConnectionQuality();
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState(false);

  useEffect(() => {
    setIsLowBandwidthMode(connectionQuality === 'slow');
  }, [connectionQuality]);

  const enableLowBandwidthMode = useCallback(() => {
    setIsLowBandwidthMode(true);
  }, []);

  const disableLowBandwidthMode = useCallback(() => {
    setIsLowBandwidthMode(false);
  }, []);

  return {
    isLowBandwidthMode,
    connectionQuality,
    enableLowBandwidthMode,
    disableLowBandwidthMode
  };
};