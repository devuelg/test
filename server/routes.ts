import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { PythonFrameworkService } from "./pythonFramework";
import { 
  insertUserProfileSchema,
  insertWorkoutPlanSchema,
  insertWorkoutSchema,
  insertNutritionEntrySchema,
  insertNutritionGoalSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Python framework service
  const pythonFramework = new PythonFrameworkService();
  
  // Auth middleware
  await setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    // Send initial connection message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to FitFramework Pro'
    }));
    
    // Send periodic updates
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'system_update',
          data: {
            timestamp: new Date().toISOString(),
            eventBusActivity: Math.floor(Math.random() * 100) + 1200,
            activePlugins: '8/12',
            avgCalcTime: Math.floor(Math.random() * 10) + 18 + 'ms',
            systemHealth: '99.' + Math.floor(Math.random() * 9) + '%'
          }
        }));
      }
    }, 5000);
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clearInterval(interval);
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user profile
      const profile = await storage.getUserProfile(userId);
      
      res.json({
        ...user,
        profile
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // User profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertUserProfileSchema.parse({ ...req.body, userId });
      
      const existingProfile = await storage.getUserProfile(userId);
      
      let profile;
      if (existingProfile) {
        profile = await storage.updateUserProfile(userId, profileData);
      } else {
        profile = await storage.createUserProfile(profileData);
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error saving profile:", error);
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  // BMR calculation routes
  app.post('/api/calculations/bmr', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { method = 'mifflin_st_jeor' } = req.body;
      
      // Get user profile for calculations
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(400).json({ message: "User profile required for BMR calculation" });
      }
      
      // Calculate BMR using Python framework
      const bmrResult = await pythonFramework.calculateBMR(profile, method);
      
      // Store calculation result
      await storage.createBMRCalculation({
        userId,
        method: bmrResult.method,
        bmrValue: bmrResult.bmr,
        confidence: bmrResult.confidence,
        calculationData: bmrResult.components
      });
      
      // Log event
      await storage.logFrameworkEvent({
        eventType: 'bmr_calculation_completed',
        userId,
        data: { method, bmr: bmrResult.bmr },
        metadata: { confidence: bmrResult.confidence }
      });
      
      res.json(bmrResult);
    } catch (error) {
      console.error("Error calculating BMR:", error);
      res.status(500).json({ message: "Failed to calculate BMR" });
    }
  });

  app.get('/api/calculations/bmr/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const calculations = await storage.getUserBMRCalculations(userId);
      res.json(calculations);
    } catch (error) {
      console.error("Error fetching BMR history:", error);
      res.status(500).json({ message: "Failed to fetch BMR history" });
    }
  });

  // Workout routes
  app.get('/api/workouts/plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plans = await storage.getUserWorkoutPlans(userId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  app.post('/api/workouts/plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const planData = insertWorkoutPlanSchema.parse({ ...req.body, userId });
      
      const plan = await storage.createWorkoutPlan(planData);
      
      await storage.logFrameworkEvent({
        eventType: 'workout_plan_created',
        userId,
        data: { planId: plan.id, name: plan.name }
      });
      
      res.json(plan);
    } catch (error) {
      console.error("Error creating workout plan:", error);
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });

  app.get('/api/workouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workouts = await storage.getUserWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.post('/api/workouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workoutData = insertWorkoutSchema.parse({ ...req.body, userId });
      
      const workout = await storage.createWorkout(workoutData);
      
      await storage.logFrameworkEvent({
        eventType: 'workout_completed',
        userId,
        data: { workoutId: workout.id, name: workout.name, duration: workout.duration }
      });
      
      res.json(workout);
    } catch (error) {
      console.error("Error creating workout:", error);
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  app.get('/api/exercises', isAuthenticated, async (req: any, res) => {
    try {
      const { category } = req.query;
      const exercises = await storage.getExercises(category as string);
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Nutrition routes
  app.get('/api/nutrition/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.query;
      
      const targetDate = date ? new Date(date as string) : new Date();
      const entries = await storage.getUserNutritionEntries(userId, targetDate);
      
      res.json(entries);
    } catch (error) {
      console.error("Error fetching nutrition entries:", error);
      res.status(500).json({ message: "Failed to fetch nutrition entries" });
    }
  });

  app.post('/api/nutrition/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertNutritionEntrySchema.parse({ ...req.body, userId });
      
      const entry = await storage.createNutritionEntry(entryData);
      
      await storage.logFrameworkEvent({
        eventType: 'nutrition_entry_logged',
        userId,
        data: { 
          foodName: entry.foodName, 
          calories: entry.calories,
          mealType: entry.mealType 
        }
      });
      
      res.json(entry);
    } catch (error) {
      console.error("Error creating nutrition entry:", error);
      res.status(500).json({ message: "Failed to create nutrition entry" });
    }
  });

  app.get('/api/nutrition/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getUserNutritionGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching nutrition goals:", error);
      res.status(500).json({ message: "Failed to fetch nutrition goals" });
    }
  });

  app.post('/api/nutrition/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalsData = insertNutritionGoalSchema.parse({ ...req.body, userId });
      
      const goals = await storage.setUserNutritionGoals(goalsData);
      
      await storage.logFrameworkEvent({
        eventType: 'nutrition_goals_updated',
        userId,
        data: { calorieGoal: goals.calorieGoal, proteinGoal: goals.proteinGoal }
      });
      
      res.json(goals);
    } catch (error) {
      console.error("Error setting nutrition goals:", error);
      res.status(500).json({ message: "Failed to set nutrition goals" });
    }
  });

  // Plugin management routes
  app.get('/api/plugins', isAuthenticated, async (req: any, res) => {
    try {
      const plugins = await storage.getAllPlugins();
      res.json(plugins);
    } catch (error) {
      console.error("Error fetching plugins:", error);
      res.status(500).json({ message: "Failed to fetch plugins" });
    }
  });

  app.patch('/api/plugins/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const plugin = await storage.updatePluginStatus(parseInt(id), isActive);
      
      await storage.logFrameworkEvent({
        eventType: 'plugin_status_changed',
        userId: req.user.claims.sub,
        data: { pluginId: plugin.id, name: plugin.name, isActive }
      });
      
      res.json(plugin);
    } catch (error) {
      console.error("Error updating plugin status:", error);
      res.status(500).json({ message: "Failed to update plugin status" });
    }
  });

  // Experiment routes
  app.get('/api/experiments', isAuthenticated, async (req: any, res) => {
    try {
      const experiments = await storage.getActiveExperiments();
      res.json(experiments);
    } catch (error) {
      console.error("Error fetching experiments:", error);
      res.status(500).json({ message: "Failed to fetch experiments" });
    }
  });

  app.get('/api/experiments/:id/variant', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const variant = await storage.getUserExperimentVariant(parseInt(id), userId);
      res.json({ variant });
    } catch (error) {
      console.error("Error fetching experiment variant:", error);
      res.status(500).json({ message: "Failed to fetch experiment variant" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/events', isAuthenticated, async (req: any, res) => {
    try {
      const { limit = 20 } = req.query;
      const events = await storage.getRecentFrameworkEvents(parseInt(limit as string));
      res.json(events);
    } catch (error) {
      console.error("Error fetching analytics events:", error);
      res.status(500).json({ message: "Failed to fetch analytics events" });
    }
  });

  // Framework health check
  app.get('/api/framework/health', isAuthenticated, async (req: any, res) => {
    try {
      const health = await pythonFramework.getHealthStatus();
      res.json(health);
    } catch (error) {
      console.error("Error checking framework health:", error);
      res.status(500).json({ message: "Failed to check framework health" });
    }
  });

  return httpServer;
}
