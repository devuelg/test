import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Check, Calendar, Dumbbell } from "lucide-react";

export default function WorkoutsTab() {
  const { toast } = useToast();

  const { data: workoutPlans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/workouts/plans"],
    retry: false,
  });

  const { data: workouts, isLoading: workoutsLoading } = useQuery({
    queryKey: ["/api/workouts"],
    retry: false,
  });

  const { data: exercises } = useQuery({
    queryKey: ["/api/exercises"],
    retry: false,
  });

  if (plansLoading || workoutsLoading) {
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
          <h2 className="text-3xl font-bold text-foreground">Workout Planning System</h2>
          <p className="text-muted-foreground mt-2">Leverage framework calculation strategies for personalized training</p>
        </div>
        <Button className="neumorphic bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      {/* Current Workout Plan */}
      <Card className="neumorphic border-0 p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-foreground mb-6">Current Plan: Strength & Conditioning</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's Workout */}
            <div className="neumorphic-inset bg-gradient-to-br from-primary/10 to-primary/20 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-primary">Today's Session</h4>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Upper Body</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Bench Press</span>
                  <span className="font-semibold text-foreground">4x8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Pull-ups</span>
                  <span className="font-semibold text-foreground">3x10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Shoulder Press</span>
                  <span className="font-semibold text-foreground">3x12</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200">
                Start Workout
              </Button>
            </div>

            {/* This Week's Progress */}
            <div className="neumorphic-inset bg-muted/30 p-4 rounded-lg">
              <h4 className="font-bold text-foreground mb-4">This Week</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                    <span className="text-foreground">Mon - Upper</span>
                  </div>
                  <Check className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                    <span className="text-foreground">Wed - Lower</span>
                  </div>
                  <Check className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-foreground">Fri - Upper</span>
                  </div>
                  <span className="text-blue-500 font-semibold">Today</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-muted-foreground rounded-full mr-3"></div>
                    <span className="text-muted-foreground">Sun - Cardio</span>
                  </div>
                  <span className="text-muted-foreground">Pending</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="neumorphic-inset bg-muted/30 p-4 rounded-lg">
              <h4 className="font-bold text-foreground mb-4">Performance</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Volume Load</span>
                    <span className="font-semibold text-foreground">12,340 lbs</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Consistency</span>
                    <span className="font-semibold text-foreground">85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Intensity</span>
                    <span className="font-semibold text-foreground">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all duration-1000" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Library */}
      <Card className="neumorphic border-0 p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-foreground mb-6">Exercise Library</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Exercise Cards */}
            <div className="neumorphic-inset bg-muted/30 p-4 rounded-lg hover:scale-105 transition-all duration-200 group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">Bench Press</h4>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Chest</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Primary: Pectorals, Triceps, Anterior Deltoids</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last: 185 lbs x 8</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Add to Plan
                </Button>
              </div>
            </div>

            <div className="neumorphic-inset bg-muted/30 p-4 rounded-lg hover:scale-105 transition-all duration-200 group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">Deadlift</h4>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">Back</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Primary: Erector Spinae, Glutes, Hamstrings</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last: 225 lbs x 5</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Add to Plan
                </Button>
              </div>
            </div>

            <div className="neumorphic-inset bg-muted/30 p-4 rounded-lg hover:scale-105 transition-all duration-200 group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">Squats</h4>
                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">Legs</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Primary: Quadriceps, Glutes, Hamstrings</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last: 205 lbs x 6</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Add to Plan
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
