import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusMap } from '../components/BusMap';
import { MockDataService, User, Route, Bus } from '../services/mockData';
import { useRealTimeTracking } from '../hooks/useRealTimeTracking';
import { 
  Navigation, 
  Users, 
  MapPin, 
  Settings, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [showAddRoute, setShowAddRoute] = useState(false);

  const dataService = MockDataService.getInstance();
  const { buses, arrivals, lastUpdated, refreshData } = useRealTimeTracking(10000);

  const routes = dataService.getRoutes();
  const stops = dataService.getStops();

  // Calculate statistics
  const totalBuses = buses.length;
  const activeBuses = buses.filter(bus => bus.isActive).length;
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter(route => route.isActive).length;
  const totalStops = stops.length;

  // Get buses by occupancy
  const busesbyOccupancy = {
    low: buses.filter(bus => bus.occupancy === 'low').length,
    medium: buses.filter(bus => bus.occupancy === 'medium').length,
    high: buses.filter(bus => bus.occupancy === 'high').length
  };

  // Handle route editing
  const handleEditRoute = (route: Route) => {
    setEditingRoute({ ...route });
    setShowAddRoute(false);
  };

  const handleSaveRoute = () => {
    if (editingRoute) {
      dataService.updateRoute(editingRoute);
      setEditingRoute(null);
      refreshData();
    }
  };

  const handleAddNewRoute = () => {
    const newRoute: Route = {
      id: `route-${Date.now()}`,
      name: 'New Route',
      color: '#3B82F6',
      stops: [],
      schedule: {
        weekday: ['06:00', '07:00', '08:00'],
        weekend: ['08:00', '10:00', '12:00']
      },
      isActive: false
    };
    setEditingRoute(newRoute);
    setShowAddRoute(true);
  };

  const handleDeleteRoute = (routeId: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      dataService.deleteRoute(routeId);
      refreshData();
    }
  };

  const RouteEditor: React.FC<{ route: Route; onSave: () => void; onCancel: () => void }> = ({
    route,
    onSave,
    onCancel
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>
          {showAddRoute ? 'Add New Route' : 'Edit Route'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="routeName">Route Name</Label>
            <Input
              id="routeName"
              value={route.name}
              onChange={(e) => setEditingRoute({ ...route, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="routeColor">Route Color</Label>
            <Input
              id="routeColor"
              type="color"
              value={route.color}
              onChange={(e) => setEditingRoute({ ...route, color: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label>Status</Label>
          <Select
            value={route.isActive ? 'active' : 'inactive'}
            onValueChange={(value) => setEditingRoute({ ...route, isActive: value === 'active' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Weekday Schedule</Label>
          <Textarea
            value={route.schedule.weekday.join(', ')}
            onChange={(e) => setEditingRoute({
              ...route,
              schedule: {
                ...route.schedule,
                weekday: e.target.value.split(',').map(time => time.trim())
              }
            })}
            placeholder="06:00, 07:00, 08:00..."
          />
        </div>

        <div>
          <Label>Weekend Schedule</Label>
          <Textarea
            value={route.schedule.weekend.join(', ')}
            onChange={(e) => setEditingRoute({
              ...route,
              schedule: {
                ...route.schedule,
                weekend: e.target.value.split(',').map(time => time.trim())
              }
            })}
            placeholder="08:00, 10:00, 12:00..."
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          
          <Badge variant="secondary">Admin</Badge>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="routes">Route Management</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Buses</p>
                      <p className="text-2xl font-bold">{totalBuses}</p>
                      <p className="text-sm text-green-600">{activeBuses} active</p>
                    </div>
                    <Navigation className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Routes</p>
                      <p className="text-2xl font-bold">{totalRoutes}</p>
                      <p className="text-sm text-green-600">{activeRoutes} active</p>
                    </div>
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Bus Stops</p>
                      <p className="text-2xl font-bold">{totalStops}</p>
                      <p className="text-sm text-gray-600">across all routes</p>
                    </div>
                    <MapPin className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">System Status</p>
                      <p className="text-lg font-bold text-green-600">Operational</p>
                      <p className="text-sm text-gray-600">All systems running</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bus Occupancy Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Bus Occupancy Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{busesbyOccupancy.low}</div>
                    <div className="text-sm text-gray-600">Low Occupancy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{busesbyOccupancy.medium}</div>
                    <div className="text-sm text-gray-600">Medium Occupancy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{busesbyOccupancy.high}</div>
                    <div className="text-sm text-gray-600">High Occupancy</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Route Management Tab */}
          <TabsContent value="routes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Route Management</h2>
              <Button onClick={handleAddNewRoute}>
                <Plus className="h-4 w-4 mr-2" />
                Add Route
              </Button>
            </div>

            {editingRoute && (
              <RouteEditor
                route={editingRoute}
                onSave={handleSaveRoute}
                onCancel={() => {
                  setEditingRoute(null);
                  setShowAddRoute(false);
                }}
              />
            )}

            <div className="grid gap-4">
              {routes.map(route => (
                <Card key={route.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: route.color }}
                        />
                        <div>
                          <h3 className="font-semibold">{route.name}</h3>
                          <p className="text-sm text-gray-600">
                            {route.stops.length} stops • {route.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={route.isActive ? "default" : "secondary"}>
                          {route.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRoute(route)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRoute(route.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <h2 className="text-2xl font-bold">Live Bus Monitoring</h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BusMap
                  buses={buses}
                  stops={stops}
                  routes={routes}
                  selectedRoute={selectedRoute}
                  onStopClick={() => {}}
                  onBusClick={() => {}}
                  className="h-96"
                />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Buses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {buses.filter(bus => bus.isActive).map(bus => {
                      const route = routes.find(r => r.id === bus.routeId);
                      return (
                        <div key={bus.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">Bus {bus.id}</p>
                            <p className="text-sm text-gray-600">{route?.name}</p>
                          </div>
                          <Badge className={
                            bus.occupancy === 'high' ? 'bg-red-100 text-red-800' :
                            bus.occupancy === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {bus.occupancy}
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Reports</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Route Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {routes.map(route => {
                      const routeBuses = buses.filter(bus => bus.routeId === route.id && bus.isActive);
                      const avgSpeed = routeBuses.length > 0 
                        ? Math.round(routeBuses.reduce((sum, bus) => sum + bus.speed, 0) / routeBuses.length)
                        : 0;
                      
                      return (
                        <div key={route.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: route.color }}
                            />
                            <span className="font-medium">{route.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{avgSpeed} km/h avg</p>
                            <p className="text-xs text-gray-600">{routeBuses.length} buses</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {buses.filter(bus => bus.occupancy === 'high').length > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">
                          {buses.filter(bus => bus.occupancy === 'high').length} buses at high occupancy
                        </span>
                      </div>
                    )}
                    
                    {buses.filter(bus => !bus.isActive).length > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">
                          {buses.filter(bus => !bus.isActive).length} buses offline
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">All routes operational</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};