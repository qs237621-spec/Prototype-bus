# Real-Time Bus Tracking Web Application - Implementation Plan

## MVP Features to Implement

### Core Components (8 files max)
1. **src/App.tsx** - Main app with routing and authentication
2. **src/pages/Dashboard.tsx** - Main user dashboard with map and route selection
3. **src/pages/AdminDashboard.tsx** - Admin interface for transport authorities
4. **src/components/BusMap.tsx** - Interactive map with real-time bus tracking
5. **src/components/RouteList.tsx** - Route selection and information display
6. **src/components/StopDetails.tsx** - Bus stop information and arrival times
7. **src/services/mockData.ts** - Mock data and localStorage services
8. **src/hooks/useRealTimeTracking.ts** - Custom hook for real-time updates

### Key Features
- ✅ Mock authentication (commuter vs admin roles)
- ✅ Real-time bus tracking with simulated GPS data
- ✅ Interactive map using OpenStreetMap/Leaflet
- ✅ Route and stop information display
- ✅ Estimated arrival times calculation
- ✅ Mobile-responsive design optimized for low bandwidth
- ✅ Admin dashboard for transport authorities
- ✅ localStorage for data persistence
- ✅ Simulated real-time data updates
- ✅ Role-based access control

### Data Structure
- Users: { id, username, role, favorites }
- Routes: { id, name, stops, color, schedule }
- Buses: { id, routeId, currentLocation, speed, nextStop, occupancy }
- Stops: { id, name, location, routes }
- Arrivals: { stopId, busId, estimatedTime, delay }

### Technical Implementation
- React + TypeScript + Tailwind CSS + Shadcn-ui
- Leaflet for mapping (lightweight alternative to Google Maps)
- localStorage for data persistence
- Simulated real-time updates using setInterval
- Mobile-first responsive design
- Low bandwidth optimization with compressed data