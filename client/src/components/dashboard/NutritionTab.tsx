import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Apple, Utensils, TrendingUp, Lightbulb, ThumbsUp } from "lucide-react";

export default function NutritionTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch nutrition entries for selected date
  const { data: nutritionEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/nutrition/entries", selectedDate],
    queryFn: () => fetch(`/api/nutrition/entries?date=${selectedDate}`, {
      credentials: "include",
    }).then(res => {
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    }),
    retry: false,
  });

  // Fetch nutrition goals
  const { data: nutritionGoals } = useQuery({
    queryKey: ["/api/nutrition/goals"],
    retry: false,
  });

  // Add nutrition entry mutation
  const addNutritionMutation = useMutation({
    mutationFn: async (entryData: any) => {
      await apiRequest("POST", "/api/nutrition/entries", entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/entries"] });
      setIsAddFoodOpen(false);
      toast({
        title: "Success",
        description: "Food entry added successfully",
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
        description: "Failed to add food entry",
        variant: "destructive",
      });
    },
  });

  // Calculate daily totals
  const dailyTotals = nutritionEntries?.reduce((totals: any, entry: any) => {
    return {
      calories: totals.calories + (parseFloat(entry.calories) || 0),
      protein: totals.protein + (parseFloat(entry.protein) || 0),
      carbs: totals.carbs + (parseFloat(entry.carbs) || 0),
      fats: totals.fats + (parseFloat(entry.fats) || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 }) || { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const goals = {
    calories: (nutritionGoals as any)?.calorieGoal || 2400,
    protein: parseFloat((nutritionGoals as any)?.proteinGoal || '180'),
    carbs: parseFloat((nutritionGoals as any)?.carbGoal || '300'),
    fats: parseFloat((nutritionGoals as any)?.fatGoal || '80'),
  };

  const handleAddFood = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const entryData = {
      date: new Date(),
      mealType: formData.get('mealType'),
      foodName: formData.get('foodName'),
      calories: parseFloat(formData.get('calories') as string),
      protein: parseFloat(formData.get('protein') as string),
      carbs: parseFloat(formData.get('carbs') as string),
      fats: parseFloat(formData.get('fats') as string),
      quantity: parseFloat(formData.get('quantity') as string),
      unit: formData.get('unit'),
    };

    addNutritionMutation.mutate(entryData);
  };

  if (entriesLoading) {
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
          <h2 className="text-3xl font-bold text-foreground">Nutrition Analysis</h2>
          <p className="text-muted-foreground mt-2">Comprehensive macro/micronutrient tracking with calculation engine</p>
        </div>
        <Dialog open={isAddFoodOpen} onOpenChange={setIsAddFoodOpen}>
          <DialogTrigger asChild>
            <Button className="neumorphic bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Log Food
            </Button>
          </DialogTrigger>
          <DialogContent className="neumorphic border-0">
            <DialogHeader>
              <DialogTitle>Add Food Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddFood} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="foodName">Food Name</Label>
                  <Input id="foodName" name="foodName" required className="neumorphic-inset border-0" />
                </div>
                <div>
                  <Label htmlFor="mealType">Meal Type</Label>
                  <Select name="mealType" required>
                    <SelectTrigger className="neumorphic-inset border-0">
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" name="quantity" type="number" step="0.1" required className="neumorphic-inset border-0" />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" name="unit" placeholder="e.g., cups, grams" required className="neumorphic-inset border-0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input id="calories" name="calories" type="number" step="0.1" required className="neumorphic-inset border-0" />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input id="protein" name="protein" type="number" step="0.1" required className="neumorphic-inset border-0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input id="carbs" name="carbs" type="number" step="0.1" required className="neumorphic-inset border-0" />
                </div>
                <div>
                  <Label htmlFor="fats">Fats (g)</Label>
                  <Input id="fats" name="fats" type="number" step="0.1" required className="neumorphic-inset border-0" />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={addNutritionMutation.isPending}
              >
                {addNutritionMutation.isPending ? "Adding..." : "Add Food Entry"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Daily Nutrition Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Macros Breakdown */}
        <div className="lg:col-span-2 neumorphic border-0 p-6">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <h3 className="text-xl font-bold text-foreground mb-6">Today's Macros</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Protein */}
                <div className="text-center">
                  <ProgressRing 
                    progress={Math.min(100, (dailyTotals.protein / goals.protein) * 100)} 
                    size={128}
                    strokeWidth={8}
                    color="hsl(var(--primary))"
                    className="mb-4 mx-auto"
                  >
                    <div className="text-center">
                      <span className="text-2xl font-bold text-foreground block">{Math.round(dailyTotals.protein)}g</span>
                      <span className="text-xs text-muted-foreground">of {goals.protein}g</span>
                    </div>
                  </ProgressRing>
                  <h4 className="font-semibold text-primary mb-2">Protein</h4>
                  <div className="flex justify-center items-center space-x-2">
                    <span className="text-lg font-bold text-foreground">
                      {Math.round((dailyTotals.protein / goals.protein) * 100)}%
                    </span>
                    <span className="text-sm text-muted-foreground">complete</span>
                  </div>
                </div>

                {/* Carbs */}
                <div className="text-center">
                  <ProgressRing 
                    progress={Math.min(100, (dailyTotals.carbs / goals.carbs) * 100)} 
                    size={128}
                    strokeWidth={8}
                    color="hsl(var(--blue-500))"
                    className="mb-4 mx-auto"
                  >
                    <div className="text-center">
                      <span className="text-2xl font-bold text-foreground block">{Math.round(dailyTotals.carbs)}g</span>
                      <span className="text-xs text-muted-foreground">of {goals.carbs}g</span>
                    </div>
                  </ProgressRing>
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Carbohydrates</h4>
                  <div className="flex justify-center items-center space-x-2">
                    <span className="text-lg font-bold text-foreground">
                      {Math.round((dailyTotals.carbs / goals.carbs) * 100)}%
                    </span>
                    <span className="text-sm text-muted-foreground">complete</span>
                  </div>
                </div>

                {/* Fats */}
                <div className="text-center">
                  <ProgressRing 
                    progress={Math.min(100, (dailyTotals.fats / goals.fats) * 100)} 
                    size={128}
                    strokeWidth={8}
                    color="hsl(var(--orange-500))"
                    className="mb-4 mx-auto"
                  >
                    <div className="text-center">
                      <span className="text-2xl font-bold text-foreground block">{Math.round(dailyTotals.fats)}g</span>
                      <span className="text-xs text-muted-foreground">of {goals.fats}g</span>
                    </div>
                  </ProgressRing>
                  <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">Fats</h4>
                  <div className="flex justify-center items-center space-x-2">
                    <span className="text-lg font-bold text-foreground">
                      {Math.round((dailyTotals.fats / goals.fats) * 100)}%
                    </span>
                    <span className="text-sm text-muted-foreground">complete</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calorie Goals */}
        <Card className="neumorphic border-0 p-6">
          <CardContent className="p-0">
            <h3 className="text-xl font-bold text-foreground mb-6">Calorie Distribution</h3>
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-foreground">{Math.round(dailyTotals.calories)}</p>
                <p className="text-sm text-muted-foreground">of {goals.calories} calories</p>
                <div className="w-full bg-muted rounded-full h-3 mt-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-blue-500 h-3 rounded-full transition-all duration-1000 ease-in-out" 
                    style={{ width: `${Math.min(100, (dailyTotals.calories / goals.calories) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3">
                {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                  const mealEntries = nutritionEntries?.filter((entry: any) => entry.mealType === mealType) || [];
                  const mealCalories = mealEntries.reduce((sum: number, entry: any) => sum + (parseFloat(entry.calories) || 0), 0);
                  
                  return (
                    <div key={mealType} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground capitalize">{mealType}</span>
                      <span className="font-semibold text-foreground">{Math.round(mealCalories)} cal</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Food Log */}
      <Card className="neumorphic border-0 p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-foreground mb-6">Recent Meals</h3>
          <div className="space-y-4">
            {nutritionEntries?.length === 0 ? (
              <div className="text-center py-8">
                <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No food entries for today</p>
                <p className="text-sm text-muted-foreground">Start logging your meals to track your nutrition</p>
              </div>
            ) : (
              nutritionEntries?.map((entry: any, index: number) => (
                <div key={index} className="neumorphic-inset bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Utensils className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{entry.foodName}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {entry.mealType} • {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{Math.round(parseFloat(entry.calories))} cal</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(parseFloat(entry.protein))}P • {Math.round(parseFloat(entry.carbs))}C • {Math.round(parseFloat(entry.fats))}F
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Insights */}
      <Card className="neumorphic border-0 p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-foreground mb-6">AI Nutrition Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="neumorphic-inset bg-gradient-to-br from-primary/10 to-primary/20 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center mb-3">
                <ThumbsUp className="text-primary mr-3 h-5 w-5" />
                <h4 className="font-semibold text-primary">Great Protein Intake</h4>
              </div>
              <p className="text-sm text-foreground">
                You're {dailyTotals.protein >= goals.protein * 0.8 ? 'on track' : 'below target'} with protein goals. 
                This supports muscle recovery and growth.
              </p>
            </div>

            <div className="neumorphic-inset bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="flex items-center mb-3">
                <Lightbulb className="text-orange-600 dark:text-orange-400 mr-3 h-5 w-5" />
                <h4 className="font-semibold text-orange-800 dark:text-orange-300">Nutrition Tip</h4>
              </div>
              <p className="text-sm text-foreground">
                {dailyTotals.calories < goals.calories * 0.8 
                  ? "Consider adding nutrient-dense snacks to reach your calorie goals."
                  : "Great job maintaining your calorie target for the day!"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
