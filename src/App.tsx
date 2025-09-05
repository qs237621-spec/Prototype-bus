import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { MockDataService, User } from './services/mockData';
import { Navigation, LogIn, Eye, EyeOff } from 'lucide-react';

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const dataService = MockDataService.getInstance();

  // Initialize data and check for existing session
  useEffect(() => {
    dataService.initializeData();
    const existingUser = dataService.getCurrentUser();
    if (existingUser) {
      setCurrentUser(existingUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const user = dataService.authenticateUser(loginForm.username, loginForm.password);
    if (user) {
      setCurrentUser(user);
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    dataService.logout();
    setCurrentUser(null);
  };

  const handleDemoLogin = (role: 'admin' | 'commuter') => {
    const credentials = role === 'admin' 
      ? { username: 'admin', password: 'admin123' }
      : { username: 'user', password: 'user123' };
    
    const user = dataService.authenticateUser(credentials.username, credentials.password);
    if (user) {
      setCurrentUser(user);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Login screen
  if (!currentUser) {
    return (
      <TooltipProvider>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Navigation className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-2xl">Bus Tracker</CardTitle>
              </div>
              <p className="text-gray-600">Real-time bus tracking for small cities</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="Enter username"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Enter password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-sm text-red-600 text-center">{loginError}</p>
                )}

                <Button type="submit" className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or try demo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleDemoLogin('commuter')}
                  className="w-full"
                >
                  Demo User
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDemoLogin('admin')}
                  className="w-full"
                >
                  Demo Admin
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>User:</strong> username: user, password: user123</p>
                  <p><strong>Admin:</strong> username: admin, password: admin123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Toaster />
      </TooltipProvider>
    );
  }

  // Main application
  return (
    <TooltipProvider>
      {currentUser.role === 'admin' ? (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      )}
      <Toaster />
    </TooltipProvider>
  );
};

export default App;