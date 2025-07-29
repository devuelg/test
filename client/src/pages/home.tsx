import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Activity, Moon, Sun, User } from "lucide-react";
import DashboardTab from "@/components/dashboard/DashboardTab";
import WorkoutsTab from "@/components/dashboard/WorkoutsTab";
import NutritionTab from "@/components/dashboard/NutritionTab";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import PluginsTab from "@/components/dashboard/PluginsTab";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (user) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Connected to WebSocket');
        setWsConnection(ws);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);
          
          if (data.type === 'system_update') {
            // Handle real-time system updates
            // This could update dashboard metrics in real-time
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setWsConnection(null);
      };
      
      return () => {
        ws.close();
      };
    }
  }, [user]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your fitness dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-all duration-300">
      {/* Header */}
      <header className="neumorphic bg-card shadow-lg border-b border-border sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">FitFramework Pro</h1>
                  <p className="text-xs text-muted-foreground">Scalable Transformation Engine</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                onClick={() => handleTabChange("dashboard")}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                <Activity className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "workouts" ? "default" : "ghost"}
                onClick={() => handleTabChange("workouts")}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                🔥 Workouts
              </Button>
              <Button
                variant={activeTab === "nutrition" ? "default" : "ghost"}
                onClick={() => handleTabChange("nutrition")}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                🍎 Nutrition
              </Button>
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                onClick={() => handleTabChange("analytics")}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                📊 Analytics
              </Button>
              <Button
                variant={activeTab === "plugins" ? "default" : "ghost"}
                onClick={() => handleTabChange("plugins")}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                🧩 Plugins
              </Button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="neumorphic-inset hover:bg-muted transition-all duration-200"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              
              <div className="flex items-center space-x-3">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary shadow-lg" 
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-foreground">
                    {user?.firstName ? `${user.firstName} ${user?.lastName || ''}` : 'User'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/api/logout'}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "workouts" && <WorkoutsTab />}
        {activeTab === "nutrition" && <NutritionTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "plugins" && <PluginsTab />}
      </main>
    </div>
  );
}
