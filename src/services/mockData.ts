// Mock data and localStorage services for the Real-Time Bus Tracking Platform

export interface User {
  id: string;
  username: string;
  role: 'commuter' | 'admin';
  favorites: string[];
}

export interface Route {
  id: string;
  name: string;
  color: string;
  stops: string[];
  schedule: {
    weekday: string[];
    weekend: string[];
  };
  isActive: boolean;
}

export interface BusStop {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  routes: string[];
  facilities: string[];
}

export interface Bus {
  id: string;
  routeId: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
  speed: number;
  heading: number;
  nextStopId: string;
  occupancy: 'low' | 'medium' | 'high';
  isActive: boolean;
  lastUpdated: Date;
}

export interface Arrival {
  stopId: string;
  busId: string;
  routeId: string;
  estimatedTime: Date;
  delay: number;
  confidence: number;
}

// Mock data
const mockRoutes: Route[] = [
  {
    id: 'route-1',
    name: 'City Center - Airport',
    color: '#3B82F6',
    stops: ['stop-1', 'stop-2', 'stop-3', 'stop-4', 'stop-5'],
    schedule: {
      weekday: ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00'],
      weekend: ['07:00', '08:00', '09:00', '10:00', '11:00']
    },
    isActive: true
  },
  {
    id: 'route-2',
    name: 'University - Mall',
    color: '#10B981',
    stops: ['stop-2', 'stop-6', 'stop-7', 'stop-8', 'stop-9'],
    schedule: {
      weekday: ['06:15', '06:45', '07:15', '07:45', '08:15', '08:45', '09:15'],
      weekend: ['08:00', '09:00', '10:00', '11:00', '12:00']
    },
    isActive: true
  },
  {
    id: 'route-3',
    name: 'Hospital - Station',
    color: '#F59E0B',
    stops: ['stop-3', 'stop-10', 'stop-11', 'stop-12', 'stop-1'],
    schedule: {
      weekday: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
      weekend: ['08:00', '10:00', '12:00', '14:00', '16:00']
    },
    isActive: true
  }
];

const mockStops: BusStop[] = [
  {
    id: 'stop-1',
    name: 'Central Station',
    location: { lat: 40.7128, lng: -74.0060 },
    routes: ['route-1', 'route-3'],
    facilities: ['shelter', 'bench', 'lighting']
  },
  {
    id: 'stop-2',
    name: 'City Hall',
    location: { lat: 40.7589, lng: -73.9851 },
    routes: ['route-1', 'route-2'],
    facilities: ['shelter', 'digital_display']
  },
  {
    id: 'stop-3',
    name: 'Main Hospital',
    location: { lat: 40.7505, lng: -73.9934 },
    routes: ['route-1', 'route-3'],
    facilities: ['shelter', 'bench', 'wheelchair_access']
  },
  {
    id: 'stop-4',
    name: 'Shopping District',
    location: { lat: 40.7614, lng: -73.9776 },
    routes: ['route-1'],
    facilities: ['shelter', 'bench']
  },
  {
    id: 'stop-5',
    name: 'Airport Terminal',
    location: { lat: 40.7769, lng: -73.8740 },
    routes: ['route-1'],
    facilities: ['shelter', 'digital_display', 'wifi']
  },
  {
    id: 'stop-6',
    name: 'University Campus',
    location: { lat: 40.7282, lng: -73.9942 },
    routes: ['route-2'],
    facilities: ['shelter', 'bench', 'bike_rack']
  },
  {
    id: 'stop-7',
    name: 'Library Square',
    location: { lat: 40.7549, lng: -73.9840 },
    routes: ['route-2'],
    facilities: ['shelter', 'lighting']
  },
  {
    id: 'stop-8',
    name: 'Sports Complex',
    location: { lat: 40.7682, lng: -73.9776 },
    routes: ['route-2'],
    facilities: ['shelter', 'bench', 'wheelchair_access']
  },
  {
    id: 'stop-9',
    name: 'Grand Mall',
    location: { lat: 40.7831, lng: -73.9712 },
    routes: ['route-2'],
    facilities: ['shelter', 'digital_display', 'wifi']
  },
  {
    id: 'stop-10',
    name: 'Medical Center',
    location: { lat: 40.7449, lng: -73.9964 },
    routes: ['route-3'],
    facilities: ['shelter', 'bench', 'wheelchair_access']
  },
  {
    id: 'stop-11',
    name: 'Park Avenue',
    location: { lat: 40.7505, lng: -73.9851 },
    routes: ['route-3'],
    facilities: ['shelter', 'bench']
  },
  {
    id: 'stop-12',
    name: 'Business District',
    location: { lat: 40.7282, lng: -73.9776 },
    routes: ['route-3'],
    facilities: ['shelter', 'digital_display']
  }
];

const mockBuses: Bus[] = [
  {
    id: 'bus-1',
    routeId: 'route-1',
    currentLocation: { lat: 40.7128, lng: -74.0060 },
    speed: 25,
    heading: 45,
    nextStopId: 'stop-2',
    occupancy: 'medium',
    isActive: true,
    lastUpdated: new Date()
  },
  {
    id: 'bus-2',
    routeId: 'route-1',
    currentLocation: { lat: 40.7614, lng: -73.9776 },
    speed: 30,
    heading: 90,
    nextStopId: 'stop-5',
    occupancy: 'low',
    isActive: true,
    lastUpdated: new Date()
  },
  {
    id: 'bus-3',
    routeId: 'route-2',
    currentLocation: { lat: 40.7282, lng: -73.9942 },
    speed: 20,
    heading: 180,
    nextStopId: 'stop-7',
    occupancy: 'high',
    isActive: true,
    lastUpdated: new Date()
  },
  {
    id: 'bus-4',
    routeId: 'route-3',
    currentLocation: { lat: 40.7505, lng: -73.9934 },
    speed: 15,
    heading: 270,
    nextStopId: 'stop-11',
    occupancy: 'medium',
    isActive: true,
    lastUpdated: new Date()
  }
];

// Service class for managing data
export class MockDataService {
  private static instance: MockDataService;

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  // Initialize data in localStorage
  initializeData(): void {
    if (!localStorage.getItem('bus_tracker_routes')) {
      localStorage.setItem('bus_tracker_routes', JSON.stringify(mockRoutes));
    }
    if (!localStorage.getItem('bus_tracker_stops')) {
      localStorage.setItem('bus_tracker_stops', JSON.stringify(mockStops));
    }
    if (!localStorage.getItem('bus_tracker_buses')) {
      localStorage.setItem('bus_tracker_buses', JSON.stringify(mockBuses));
    }
  }

  // User management
  authenticateUser(username: string, password: string): User | null {
    // Mock authentication - in real app, this would validate against backend
    if (username === 'admin' && password === 'admin123') {
      const user: User = {
        id: 'admin-1',
        username: 'admin',
        role: 'admin',
        favorites: []
      };
      localStorage.setItem('bus_tracker_current_user', JSON.stringify(user));
      return user;
    } else if (username === 'user' && password === 'user123') {
      const user: User = {
        id: 'user-1',
        username: 'user',
        role: 'commuter',
        favorites: ['route-1', 'stop-1']
      };
      localStorage.setItem('bus_tracker_current_user', JSON.stringify(user));
      return user;
    }
    return null;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('bus_tracker_current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout(): void {
    localStorage.removeItem('bus_tracker_current_user');
  }

  // Data retrieval methods
  getRoutes(): Route[] {
    const routesStr = localStorage.getItem('bus_tracker_routes');
    return routesStr ? JSON.parse(routesStr) : [];
  }

  getStops(): BusStop[] {
    const stopsStr = localStorage.getItem('bus_tracker_stops');
    return stopsStr ? JSON.parse(stopsStr) : [];
  }

  getBuses(): Bus[] {
    const busesStr = localStorage.getItem('bus_tracker_buses');
    return busesStr ? JSON.parse(busesStr) : [];
  }

  getRoute(routeId: string): Route | null {
    const routes = this.getRoutes();
    return routes.find(route => route.id === routeId) || null;
  }

  getStop(stopId: string): BusStop | null {
    const stops = this.getStops();
    return stops.find(stop => stop.id === stopId) || null;
  }

  getBus(busId: string): Bus | null {
    const buses = this.getBuses();
    return buses.find(bus => bus.id === busId) || null;
  }

  // Real-time simulation methods
  updateBusLocation(busId: string): Bus | null {
    const buses = this.getBuses();
    const busIndex = buses.findIndex(bus => bus.id === busId);
    
    if (busIndex === -1) return null;

    const bus = buses[busIndex];
    const route = this.getRoute(bus.routeId);
    
    if (!route) return null;

    // Simulate movement along route
    const moveDistance = 0.001; // Small movement for simulation
    const randomFactor = (Math.random() - 0.5) * 0.0005;
    
    bus.currentLocation.lat += moveDistance * Math.cos(bus.heading * Math.PI / 180) + randomFactor;
    bus.currentLocation.lng += moveDistance * Math.sin(bus.heading * Math.PI / 180) + randomFactor;
    bus.speed = Math.max(10, Math.min(40, bus.speed + (Math.random() - 0.5) * 10));
    bus.lastUpdated = new Date();

    buses[busIndex] = bus;
    localStorage.setItem('bus_tracker_buses', JSON.stringify(buses));
    
    return bus;
  }

  // Calculate estimated arrival times
  calculateArrivals(stopId: string): Arrival[] {
    const stop = this.getStop(stopId);
    if (!stop) return [];

    const buses = this.getBuses();
    const arrivals: Arrival[] = [];

    stop.routes.forEach(routeId => {
      const routeBuses = buses.filter(bus => bus.routeId === routeId && bus.isActive);
      
      routeBuses.forEach(bus => {
        // Simple distance-based calculation
        const distance = this.calculateDistance(
          bus.currentLocation.lat,
          bus.currentLocation.lng,
          stop.location.lat,
          stop.location.lng
        );
        
        const estimatedMinutes = Math.max(1, Math.round(distance / (bus.speed / 60)));
        const estimatedTime = new Date();
        estimatedTime.setMinutes(estimatedTime.getMinutes() + estimatedMinutes);
        
        arrivals.push({
          stopId,
          busId: bus.id,
          routeId: bus.routeId,
          estimatedTime,
          delay: Math.floor(Math.random() * 5) - 2, // Random delay between -2 and +3 minutes
          confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
        });
      });
    });

    return arrivals.sort((a, b) => a.estimatedTime.getTime() - b.estimatedTime.getTime());
  }

  // Utility method to calculate distance between two points
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Admin methods
  updateRoute(route: Route): void {
    const routes = this.getRoutes();
    const index = routes.findIndex(r => r.id === route.id);
    if (index !== -1) {
      routes[index] = route;
      localStorage.setItem('bus_tracker_routes', JSON.stringify(routes));
    }
  }

  addRoute(route: Route): void {
    const routes = this.getRoutes();
    routes.push(route);
    localStorage.setItem('bus_tracker_routes', JSON.stringify(routes));
  }

  deleteRoute(routeId: string): void {
    const routes = this.getRoutes().filter(r => r.id !== routeId);
    localStorage.setItem('bus_tracker_routes', JSON.stringify(routes));
  }
}