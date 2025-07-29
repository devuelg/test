import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Activity, Target, TrendingUp, Utensils, Medal, Plus, Dumbbell, BarChart3, Settings } from "lucide-react";

export default function DashboardTab() {
  const { toast } = useToast();

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: bmrHistory } = useQuery({
    queryKey: ["/api/calculations/bmr/history"],
    retry: false,
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="neumorphic border-0 p-6 animate-pulse">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-muted rounded-xl mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const latestBMR = bmrHistory?.[0];

  return (
    <div className="space-y-8">
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* BMR Calculation Card */}
        <Card className="metric-card neumorphic border-0 p-6 transition-all duration-300 hover:scale-105">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="text-white text-xl" />
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                {latestBMR?.method === 'mifflin_st_jeor' ? 'Mifflin-St Jeor' : 'Standard'}
              </span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Basal Metabolic Rate</h3>
            <p className="text-3xl font-bold text-foreground mb-2">
              {latestBMR ? Math.round(parseFloat(latestBMR.bmrValue)) : '1,847'}
            </p>
            <div className="flex items-center text-sm">
              <span className="text-primary font-medium">+2.3%</span>
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Body Composition Card */}
        <Card className="metric-card neumorphic border-0 p-6 transition-all duration-300 hover:scale-105">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="text-white text-xl" />
              </div>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                InBody Analysis
              </span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Body Fat %</h3>
            <p className="text-3xl font-bold text-foreground mb-2">12.4%</p>
            <div className="flex items-center text-sm">
              <span className="text-primary font-medium">-0.8%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Calories Card */}
        <Card className="metric-card neumorphic border-0 p-6 transition-all duration-300 hover:scale-105">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Utensils className="text-white text-xl" />
              </div>
              <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full font-medium">
                Adaptive Goal
              </span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Daily Calories</h3>
            <p className="text-3xl font-bold text-foreground mb-2">{dashboardStats?.todayCalories || 2341}</p>
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">Goal: </span>
              <span className="text-orange-600 dark:text-orange-400 font-medium ml-1">2,400</span>
            </div>
          </CardContent>
        </Card>

        {/* Workout Streak Card */}
        <Card className="metric-card neumorphic border-0 p-6 transition-all duration-300 hover:scale-105">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Medal className="text-white text-xl" />
              </div>
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full font-medium">
                Personal Best
              </span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Workout Streak</h3>
            <p className="text-3xl font-bold text-foreground mb-2">{dashboardStats?.currentStreak || 14} days</p>
            <div className="flex items-center text-sm">
              <span className="text-purple-600 dark:text-purple-400 font-medium">🔥 On fire!</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Goals Progress */}
        <Card className="neumorphic border-0 p-6">
          <CardContent className="p-0">
            <h3 className="text-xl font-bold text-foreground mb-6">Daily Goals Progress</h3>
            <div className="grid grid-cols-3 gap-6">
              {/* Calories Progress Ring */}
              <div className="flex flex-col items-center">
                <ProgressRing 
                  progress={84} 
                  size={80}
                  strokeWidth={6}
                  color="hsl(var(--primary))"
                  className="mb-3"
                >
                  <span className="text-sm font-bold text-foreground">84%</span>
                </ProgressRing>
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground">Calories</p>
                  <p className="text-sm font-bold text-primary">2,016</p>
                </div>
              </div>

              {/* Protein Progress Ring */}
              <div className="flex flex-col items-center">
                <ProgressRing 
                  progress={70} 
                  size={80}
                  strokeWidth={6}
                  color="hsl(var(--blue-500))"
                  className="mb-3"
                >
                  <span className="text-sm font-bold text-foreground">70%</span>
                </ProgressRing>
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground">Protein</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">126g</p>
                </div>
              </div>

              {/* Exercise Progress Ring */}
              <div className="flex flex-col items-center">
                <ProgressRing 
                  progress={90} 
                  size={80}
                  strokeWidth={6}
                  color="hsl(var(--orange-500))"
                  className="mb-3"
                >
                  <span className="text-sm font-bold text-foreground">90%</span>
                </ProgressRing>
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground">Exercise</p>
                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400">54 min</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BMR Calculation Strategies */}
        <Card className="neumorphic border-0 p-6">
          <CardContent className="p-0">
            <h3 className="text-xl font-bold text-foreground mb-6">BMR Calculation Methods</h3>
            <div className="space-y-4">
              {/* Mifflin-St Jeor */}
              <div className="flex items-center justify-between p-4 neumorphic-inset bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full pulse-ring"></div>
                  <div>
                    <p className="font-semibold text-foreground">Mifflin-St Jeor</p>
                    <p className="text-sm text-muted-foreground">Primary Method</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    {latestBMR ? Math.round(parseFloat(latestBMR.bmrValue)) : '1,847'} cal
                  </p>
                  <p className="text-sm text-primary">
                    {latestBMR ? Math.round((parseFloat(latestBMR.confidence || '0.98')) * 100) : '98'}% confidence
                  </p>
                </div>
              </div>

              {/* Harris-Benedict */}
              <div className="flex items-center justify-between p-4 neumorphic-inset bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-foreground">Harris-Benedict</p>
                    <p className="text-sm text-muted-foreground">Secondary Method</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">1,834 cal</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">94% confidence</p>
                </div>
              </div>

              {/* Adaptive Ensemble */}
              <div className="flex items-center justify-between p-4 neumorphic-inset bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-semibold text-foreground">Adaptive Ensemble</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">AI-Enhanced</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">1,841 cal</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">99% confidence</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button className="neumorphic border-0 bg-card hover:bg-muted p-6 h-auto flex-col space-y-3 hover:scale-105 transition-all duration-200 group">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
            <Plus className="text-white text-xl" />
          </div>
          <p className="font-semibold text-foreground">Log Meal</p>
        </Button>

        <Button className="neumorphic border-0 bg-card hover:bg-muted p-6 h-auto flex-col space-y-3 hover:scale-105 transition-all duration-200 group">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
            <Dumbbell className="text-white text-xl" />
          </div>
          <p className="font-semibold text-foreground">Start Workout</p>
        </Button>

        <Button className="neumorphic border-0 bg-card hover:bg-muted p-6 h-auto flex-col space-y-3 hover:scale-105 transition-all duration-200 group">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
            <TrendingUp className="text-white text-xl" />
          </div>
          <p className="font-semibold text-foreground">View Progress</p>
        </Button>

        <Button className="neumorphic border-0 bg-card hover:bg-muted p-6 h-auto flex-col space-y-3 hover:scale-105 transition-all duration-200 group">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
            <Settings className="text-white text-xl" />
          </div>
          <p className="font-semibold text-foreground">Settings</p>
        </Button>
      </div>
    </div>
  );
}
