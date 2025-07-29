import {
  users,
  userProfiles,
  workoutPlans,
  workouts,
  exercises,
  workoutExercises,
  nutritionEntries,
  nutritionGoals,
  bmrCalculations,
  plugins,
  experiments,
  experimentParticipants,
  frameworkEvents,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type WorkoutPlan,
  type InsertWorkoutPlan,
  type Workout,
  type InsertWorkout,
  type Exercise,
  type NutritionEntry,
  type InsertNutritionEntry,
  type NutritionGoal,
  type InsertNutritionGoal,
  type Plugin,
  type Experiment,
  type InsertExperiment,
  type BMRCalculation,
  type FrameworkEvent,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // BMR calculations
  createBMRCalculation(calculation: {
    userId: string;
    method: string;
    bmrValue: number;
    confidence?: number;
    calculationData?: any;
  }): Promise<BMRCalculation>;
  getUserBMRCalculations(userId: string, limit?: number): Promise<BMRCalculation[]>;
  
  // Workout operations
  getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined>;
  getUserWorkouts(userId: string, limit?: number): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // Exercise operations
  getExercises(category?: string): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  
  // Nutrition operations
  getUserNutritionEntries(userId: string, date?: Date): Promise<NutritionEntry[]>;
  createNutritionEntry(entry: InsertNutritionEntry): Promise<NutritionEntry>;
  getUserNutritionGoals(userId: string): Promise<NutritionGoal | undefined>;
  setUserNutritionGoals(goals: InsertNutritionGoal): Promise<NutritionGoal>;
  
  // Plugin operations
  getActivePlugins(): Promise<Plugin[]>;
  getAllPlugins(): Promise<Plugin[]>;
  updatePluginStatus(id: number, isActive: boolean): Promise<Plugin>;
  
  // Experiment operations
  getActiveExperiments(): Promise<Experiment[]>;
  getExperiment(id: number): Promise<Experiment | undefined>;
  assignUserToExperiment(experimentId: number, userId: string, variant: string): Promise<void>;
  getUserExperimentVariant(experimentId: number, userId: string): Promise<string | undefined>;
  
  // Event logging
  logFrameworkEvent(event: {
    eventType: string;
    userId?: string;
    data?: any;
    metadata?: any;
  }): Promise<FrameworkEvent>;
  getRecentFrameworkEvents(limit?: number): Promise<FrameworkEvent[]>;
  
  // Analytics
  getDashboardStats(userId: string): Promise<{
    totalWorkouts: number;
    currentStreak: number;
    todayCalories: number;
    weeklyProgress: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // BMR calculations
  async createBMRCalculation(calculation: {
    userId: string;
    method: string;
    bmrValue: number;
    confidence?: number;
    calculationData?: any;
  }): Promise<BMRCalculation> {
    const [bmrCalc] = await db
      .insert(bmrCalculations)
      .values({
        userId: calculation.userId,
        method: calculation.method,
        bmrValue: calculation.bmrValue.toString(),
        confidence: calculation.confidence?.toString(),
        calculationData: calculation.calculationData,
      })
      .returning();
    return bmrCalc;
  }

  async getUserBMRCalculations(userId: string, limit = 10): Promise<BMRCalculation[]> {
    return await db
      .select()
      .from(bmrCalculations)
      .where(eq(bmrCalculations.userId, userId))
      .orderBy(desc(bmrCalculations.createdAt))
      .limit(limit);
  }

  // Workout operations
  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return await db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.userId, userId))
      .orderBy(desc(workoutPlans.createdAt));
  }

  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [newPlan] = await db
      .insert(workoutPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined> {
    const [plan] = await db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.id, id));
    return plan;
  }

  async getUserWorkouts(userId: string, limit = 20): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId))
      .orderBy(desc(workouts.createdAt))
      .limit(limit);
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db
      .insert(workouts)
      .values(workout)
      .returning();
    return newWorkout;
  }

  // Exercise operations
  async getExercises(category?: string): Promise<Exercise[]> {
    if (category) {
      return await db
        .select()
        .from(exercises)
        .where(eq(exercises.category, category));
    }
    return await db.select().from(exercises);
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    const [exercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id));
    return exercise;
  }

  // Nutrition operations
  async getUserNutritionEntries(userId: string, date?: Date): Promise<NutritionEntry[]> {
    let query = db
      .select()
      .from(nutritionEntries)
      .where(eq(nutritionEntries.userId, userId));

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = db
        .select()
        .from(nutritionEntries)
        .where(
          and(
            eq(nutritionEntries.userId, userId),
            gte(nutritionEntries.date, startOfDay),
            lte(nutritionEntries.date, endOfDay)
          )
        );
    }

    return await query.orderBy(desc(nutritionEntries.date));
  }

  async createNutritionEntry(entry: InsertNutritionEntry): Promise<NutritionEntry> {
    const [newEntry] = await db
      .insert(nutritionEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async getUserNutritionGoals(userId: string): Promise<NutritionGoal | undefined> {
    const [goals] = await db
      .select()
      .from(nutritionGoals)
      .where(
        and(
          eq(nutritionGoals.userId, userId),
          eq(nutritionGoals.isActive, true)
        )
      )
      .orderBy(desc(nutritionGoals.createdAt));
    return goals;
  }

  async setUserNutritionGoals(goals: InsertNutritionGoal): Promise<NutritionGoal> {
    // Deactivate existing goals
    await db
      .update(nutritionGoals)
      .set({ isActive: false })
      .where(eq(nutritionGoals.userId, goals.userId));

    // Create new active goals
    const [newGoals] = await db
      .insert(nutritionGoals)
      .values({ ...goals, isActive: true })
      .returning();
    return newGoals;
  }

  // Plugin operations
  async getActivePlugins(): Promise<Plugin[]> {
    return await db
      .select()
      .from(plugins)
      .where(eq(plugins.isActive, true))
      .orderBy(plugins.priority);
  }

  async getAllPlugins(): Promise<Plugin[]> {
    return await db
      .select()
      .from(plugins)
      .orderBy(plugins.priority);
  }

  async updatePluginStatus(id: number, isActive: boolean): Promise<Plugin> {
    const [updatedPlugin] = await db
      .update(plugins)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(plugins.id, id))
      .returning();
    return updatedPlugin;
  }

  // Experiment operations
  async getActiveExperiments(): Promise<Experiment[]> {
    return await db
      .select()
      .from(experiments)
      .where(eq(experiments.isActive, true));
  }

  async getExperiment(id: number): Promise<Experiment | undefined> {
    const [experiment] = await db
      .select()
      .from(experiments)
      .where(eq(experiments.id, id));
    return experiment;
  }

  async assignUserToExperiment(experimentId: number, userId: string, variant: string): Promise<void> {
    await db
      .insert(experimentParticipants)
      .values({
        experimentId,
        userId,
        variant,
      })
      .onConflictDoNothing();
  }

  async getUserExperimentVariant(experimentId: number, userId: string): Promise<string | undefined> {
    const [participant] = await db
      .select()
      .from(experimentParticipants)
      .where(
        and(
          eq(experimentParticipants.experimentId, experimentId),
          eq(experimentParticipants.userId, userId)
        )
      );
    return participant?.variant;
  }

  // Event logging
  async logFrameworkEvent(event: {
    eventType: string;
    userId?: string;
    data?: any;
    metadata?: any;
  }): Promise<FrameworkEvent> {
    const [newEvent] = await db
      .insert(frameworkEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async getRecentFrameworkEvents(limit = 50): Promise<FrameworkEvent[]> {
    return await db
      .select()
      .from(frameworkEvents)
      .orderBy(desc(frameworkEvents.timestamp))
      .limit(limit);
  }

  // Analytics
  async getDashboardStats(userId: string): Promise<{
    totalWorkouts: number;
    currentStreak: number;
    todayCalories: number;
    weeklyProgress: number;
  }> {
    // Get total workouts
    const totalWorkoutsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(workouts)
      .where(eq(workouts.userId, userId));
    
    const totalWorkouts = totalWorkoutsResult[0]?.count || 0;

    // Get today's calories
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayNutritionResult = await db
      .select({ 
        totalCalories: sql<number>`sum(${nutritionEntries.calories})` 
      })
      .from(nutritionEntries)
      .where(
        and(
          eq(nutritionEntries.userId, userId),
          gte(nutritionEntries.date, today),
          lte(nutritionEntries.date, tomorrow)
        )
      );

    const todayCalories = Number(todayNutritionResult[0]?.totalCalories) || 0;

    // Calculate workout streak (simplified)
    const recentWorkouts = await db
      .select({ completedAt: workouts.completedAt })
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          sql`${workouts.completedAt} IS NOT NULL`
        )
      )
      .orderBy(desc(workouts.completedAt))
      .limit(30);

    let currentStreak = 0;
    if (recentWorkouts.length > 0) {
      // Simplified streak calculation
      currentStreak = Math.min(recentWorkouts.length, 14); // Max 14 for demo
    }

    // Weekly progress (simplified as percentage)
    const weeklyProgress = Math.min(85, (totalWorkouts * 5) % 100); // Demo calculation

    return {
      totalWorkouts,
      currentStreak,
      todayCalories,
      weeklyProgress,
    };
  }
}

export const storage = new DatabaseStorage();
