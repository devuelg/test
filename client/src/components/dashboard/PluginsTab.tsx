import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Settings, Star, Download, Activity, Brain, Smartphone, BarChart3 } from "lucide-react";

export default function PluginsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch plugins
  const { data: plugins, isLoading: pluginsLoading } = useQuery({
    queryKey: ["/api/plugins"],
    retry: false,
  });

  // Fetch experiments
  const { data: experiments } = useQuery({
    queryKey: ["/api/experiments"],
    retry: false,
  });

  // Update plugin status mutation
  const updatePluginMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/plugins/${id}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plugins"] });
      toast({
        title: "Success",
        description: "Plugin status updated successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update plugin status",
        variant: "destructive",
      });
    },
  });

  const handlePluginToggle = (pluginId: number, currentStatus: boolean) => {
    updatePluginMutation.mutate({ id: pluginId, isActive: !currentStatus });
  };

  if (pluginsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Mock marketplace plugins (in a real app, these would come from an API)
  const marketplacePlugins = [
    {
      id: 'ai-insights-pro',
      name: 'AI Insights Pro',
      version: '3.0.2',
      description: 'Machine learning powered insights and predictions',
      icon: Brain,
      rating: 5,
      downloads: '1.2k',
      isPremium: true,
      category: 'Analytics'
    },
    {
      id: 'wearable-sync',
      name: 'Wearable Sync',
      version: '1.8.1',
      description: 'Connect with fitness trackers and smartwatches',
      icon: Smartphone,
      rating: 4,
      downloads: '5.7k',
      isPremium: false,
      category: 'Integration'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Plugin Management</h2>
          <p className="text-muted-foreground mt-2">Manage your extensible plugin architecture</p>
        </div>
        <Button className="neumorphic bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          Install Plugin
        </Button>
      </div>

      {/* Active Plugins */}
      <Card className="neumorphic border-0 p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-foreground mb-6">Active Plugins</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(plugins as any)?.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No plugins installed</p>
                <p className="text-sm text-muted-foreground">Install plugins to extend functionality</p>
              </div>
            ) : (
              (plugins as any)?.map((plugin: any) => (
                <div key={plugin.id} className="neumorphic-inset bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                        <Activity className="text-white h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{plugin.name}</h4>
                        <p className="text-xs text-muted-foreground">v{plugin.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${plugin.isActive ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`}></div>
                      <span className={`text-xs font-medium ${plugin.isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {plugin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{plugin.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-xs bg-muted hover:bg-muted/80">
                        Configure
                      </Button>
                      <Switch
                        checked={plugin.isActive}
                        onCheckedChange={() => handlePluginToggle(plugin.id, plugin.isActive)}
                        disabled={updatePluginMutation.isPending}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">Priority: {plugin.priority}</span>
                  </div>
                </div>
              ))
            )}
            
            {/* Add mock plugins if none exist */}
            {(!plugins || (plugins as any)?.length === 0) && (
              <>
                <div className="neumorphic-inset bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                        <Activity className="text-white h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">BMR Calculator Pro</h4>
                        <p className="text-xs text-muted-foreground">v1.2.0</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-xs text-primary font-medium">Active</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Enhanced BMR calculations with multiple methodologies</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-xs bg-muted hover:bg-muted/80">
                        Configure
                      </Button>
                      <Switch checked={true} disabled />
                    </div>
                    <span className="text-xs text-muted-foreground">Priority: 100</span>
                  </div>
                </div>

                <div className="neumorphic-inset bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                        <BarChart3 className="text-white h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Advanced Analytics</h4>
                        <p className="text-xs text-muted-foreground">v2.1.5</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-xs text-primary font-medium">Active</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Deep data analysis and predictive modeling</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-xs bg-muted hover:bg-muted/80">
                        Configure
                      </Button>
                      <Switch checked={true} disabled />
                    </div>
                    <span className="text-xs text-muted-foreground">Priority: 90</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* A/B Testing Dashboard */}
      <Card className="neumorphic border-0 p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-foreground mb-6">A/B Testing Dashboard</h3>
          <div className="space-y-4">
            {/* Mock experiment */}
            <div className="neumorphic-inset bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-foreground">New BMR Algorithm</h4>
                  <p className="text-sm text-muted-foreground">Testing adaptive ensemble vs traditional methods</p>
                </div>
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                  Active
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Control Group</p>
                  <p className="text-lg font-bold text-foreground">50%</p>
                  <p className="text-xs text-muted-foreground">2,547 users</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Variant A</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">30%</p>
                  <p className="text-xs text-muted-foreground">1,528 users</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Variant B</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">20%</p>
                  <p className="text-xs text-muted-foreground">1,019 users</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="neumorphic-inset border-0">
                    View Results
                  </Button>
                  <Button variant="ghost" size="sm">
                    Configure
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">Started 7 days ago</span>
              </div>
            </div>

            {/* Feature Flags */}
            <div className="neumorphic-inset bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-4">Feature Flags</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Enhanced Nutrition Tracking</p>
                      <p className="text-xs text-muted-foreground">Rollout: 85% • Target: Pro Users</p>
                    </div>
                  </div>
                  <Switch checked={true} disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-muted-foreground rounded-full"></div>
                    <div>
                      <p className="font-medium text-foreground">AI Workout Recommendations</p>
                      <p className="text-xs text-muted-foreground">Rollout: 15% • Target: Beta Users</p>
                    </div>
                  </div>
                  <Switch checked={false} disabled />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plugin Marketplace */}
      <Card className="neumorphic border-0 p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-foreground mb-6">Plugin Marketplace</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketplacePlugins.map((plugin) => (
              <div key={plugin.id} className="neumorphic-inset bg-muted/30 p-4 rounded-lg hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                      <plugin.icon className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{plugin.name}</h4>
                      <p className="text-xs text-muted-foreground">v{plugin.version}</p>
                    </div>
                  </div>
                  <Badge variant={plugin.isPremium ? "default" : "secondary"}>
                    {plugin.isPremium ? "Premium" : "Free"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{plugin.description}</p>
                <div className="flex items-center justify-between">
                  <Button 
                    className={`text-sm transition-colors duration-200 ${
                      plugin.isPremium 
                        ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    Install
                  </Button>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${
                            i < plugin.rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{plugin.downloads} downloads</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
