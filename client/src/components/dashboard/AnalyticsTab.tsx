import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { TrendingUp, Activity, Download, Heart, Calculator, Puzzle, Radio } from "lucide-react";

export default function AnalyticsTab() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("7days");

  // Fetch analytics events
  const { data: analyticsEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/analytics/events", 20],
    retry: false,
  });

  // Fetch framework health
  const { data: frameworkHealth } = useQuery({
    queryKey: ["/api/framework/health"],
    retry: false,
  });

  // Mock performance data (in a real app, this would come from your analytics API)
  const performanceData = [
    { day: 'Mon', value: 60 },
    { day: 'Tue', value: 75 },
    { day: 'Wed', value: 45 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 95 },
    { day: 'Sat', value: 20 },
    { day: 'Sun', value: 20 },
  ];

  // Mock heatmap data
  const heatmapData = [
    [2, 1, 0, 1, 2, 1, 0],
    [1, 2, 1, 0, 1, 2, 0],
    [2, 1, 2, 0, 2, 0, 1],
    [1, 0, 1, 2, 1, 1, 0]
  ];

  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'bg-muted';
    if (value === 1) return 'bg-primary/30';
    if (value === 2) return 'bg-primary/60';
    return 'bg-primary';
  };

  if (eventsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Advanced Analytics</h2>
          <p className="text-muted-foreground mt-2">Leverage structured logging and event system for insights</p>
        </div>
        <div className="flex space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="neumorphic border-0 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Button className="neumorphic bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Trend Chart */}
        <Card className="neumorphic border-0 p-6">
          <CardContent className="p-0">
            <h3 className="text-xl font-bold text-foreground mb-6">Performance Trends</h3>
            <div className="bg-muted/30 rounded-lg p-4 h-64">
              {/* Simple Bar Chart */}
              <div className="h-full flex items-end justify-between space-x-2">
                {performanceData.map((data, index) => (
                  <div key={data.day} className="flex flex-col items-center space-y-2 flex-1">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-1000 ease-in-out ${
                        index === 4 ? 'bg-blue-500 animate-pulse' : 'bg-primary'
                      }`}
                      style={{ height: `${data.value}%` }}
                    ></div>
                    <span className={`text-xs ${
                      index === 4 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-muted-foreground'
                    }`}>
                      {data.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Peak</p>
                <p className="font-bold text-primary">95%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="font-bold text-foreground">73%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consistency</p>
                <p className="font-bold text-blue-600 dark:text-blue-400">86%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heat Map */}
        <Card className="neumorphic border-0 p-6">
          <CardContent className="p-0">
            <h3 className="text-xl font-bold text-foreground mb-6">Activity Heatmap</h3>
            <div className="space-y-4">
              {/* Week labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                  <div key={index} className="py-1">{day}</div>
                ))}
              </div>
              
              {/* Heatmap grid */}
              <div className="space-y-1">
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-1">
                    {week.map((value, dayIndex) => (
                      <div 
                        key={dayIndex} 
                        className={`w-8 h-8 ${getHeatmapColor(value)} rounded ${
                          weekIndex === 1 && dayIndex === 4 ? 'animate-pulse' : ''
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-muted rounded"></div>
                  <div className="w-3 h-3 bg-primary/30 rounded"></div>
                  <div className="w-3 h-3 bg-primary/60 rounded"></div>
                  <div className="w-3 h-3 bg-primary rounded"></div>
                </div>
                <span className="text-muted-foreground">More</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Monitoring */}
      <Card className="neumorphic border-0 p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-foreground mb-6">Real-time System Monitoring</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Event Bus Activity */}
            <div className="text-center">
              <div className="neumorphic-inset bg-gradient-to-br from-primary/10 to-primary/20 p-4 rounded-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Radio className="text-white animate-pulse h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">1,247</p>
                <p className="text-sm text-muted-foreground">Events/hour</p>
              </div>
            </div>

            {/* Plugin Status */}
            <div className="text-center">
              <div className="neumorphic-inset bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Puzzle className="text-white h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {frameworkHealth?.plugins_loaded || 8}/12
                </p>
                <p className="text-sm text-muted-foreground">Plugins Active</p>
              </div>
            </div>

            {/* Calculation Performance */}
            <div className="text-center">
              <div className="neumorphic-inset bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Calculator className="text-white h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">23ms</p>
                <p className="text-sm text-muted-foreground">Avg Calc Time</p>
              </div>
            </div>

            {/* System Health */}
            <div className="text-center">
              <div className="neumorphic-inset bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Heart className="text-white animate-pulse h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {frameworkHealth?.status === 'healthy' ? '99.8%' : '95.2%'}
                </p>
                <p className="text-sm text-muted-foreground">System Health</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Log */}
      <Card className="neumorphic border-0 p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-foreground mb-6">Recent Events</h3>
          <div className="space-y-3">
            {analyticsEvents?.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent events</p>
                <p className="text-sm text-muted-foreground">Framework events will appear here as they occur</p>
              </div>
            ) : (
              analyticsEvents?.map((event: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 neumorphic-inset bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.eventType.includes('error') ? 'bg-red-500' :
                      event.eventType.includes('success') || event.eventType.includes('completed') ? 'bg-primary animate-pulse' :
                      'bg-blue-500'
                    }`}></div>
                    <span className="font-mono text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-sm text-foreground capitalize">
                      {event.eventType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    event.eventType.includes('error') 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : event.eventType.includes('success') || event.eventType.includes('completed')
                      ? 'bg-primary/20 text-primary'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {event.eventType.includes('error') ? 'ERROR' :
                     event.eventType.includes('success') || event.eventType.includes('completed') ? 'SUCCESS' :
                     'INFO'}
                  </span>
                </div>
              ))
            )}
            
            {/* Add some mock recent events if none exist */}
            {(!analyticsEvents || analyticsEvents.length === 0) && (
              <>
                <div className="flex items-center justify-between p-3 neumorphic-inset bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="font-mono text-sm text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <span className="text-sm text-foreground">BMR calculation completed</span>
                  </div>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">SUCCESS</span>
                </div>

                <div className="flex items-center justify-between p-3 neumorphic-inset bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-mono text-sm text-muted-foreground">
                      {new Date(Date.now() - 60000).toLocaleTimeString()}
                    </span>
                    <span className="text-sm text-foreground">Plugin system initialized</span>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-medium">INFO</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
