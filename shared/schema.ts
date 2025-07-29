import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles for fitness data
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  age: integer("age"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  height: decimal("height", { precision: 5, scale: 2 }),
  gender: varchar("gender", { length: 10 }),
  activityLevel: varchar("activity_level", { length: 20 }),
  fitnessGoals: text("fitness_goals"),
  bodyFatPercentage: decimal("body_fat_percentage", { precision: 4, scale: 2 }),
  muscleMass: decimal("muscle_mass", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BMR calculations and results
export const bmrCalculations = pgTable("bmr_calculations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  method: varchar("method", { length: 50 }).notNull(),
  bmrValue: decimal("bmr_value", { precision: 7, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 4, scale: 3 }),
  calculationData: jsonb("calculation_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout plans
export const workoutPlans = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  duration: integer("duration"), // in weeks
  workoutsPerWeek: integer("workouts_per_week"),
  difficulty: varchar("difficulty", { length: 20 }),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual workouts
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => workoutPlans.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }),
  duration: integer("duration"), // in minutes
  caloriesBurned: integer("calories_burned"),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exercises
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }),
  muscleGroups: text("muscle_groups"),
  instructions: text("instructions"),
  equipment: varchar("equipment", { length: 100 }),
  difficulty: varchar("difficulty", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout exercises (junction table)
export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull().references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: decimal("weight", { precision: 6, scale: 2 }),
  restTime: integer("rest_time"), // in seconds
  notes: text("notes"),
});

// Nutrition entries
export const nutritionEntries = pgTable("nutrition_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  mealType: varchar("meal_type", { length: 20 }),
  foodName: varchar("food_name", { length: 100 }).notNull(),
  calories: decimal("calories", { precision: 7, scale: 2 }),
  protein: decimal("protein", { precision: 6, scale: 2 }),
  carbs: decimal("carbs", { precision: 6, scale: 2 }),
  fats: decimal("fats", { precision: 6, scale: 2 }),
  fiber: decimal("fiber", { precision: 5, scale: 2 }),
  sugar: decimal("sugar", { precision: 5, scale: 2 }),
  sodium: decimal("sodium", { precision: 7, scale: 2 }),
  quantity: decimal("quantity", { precision: 5, scale: 2 }),
  unit: varchar("unit", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily nutrition goals
export const nutritionGoals = pgTable("nutrition_goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  calorieGoal: integer("calorie_goal"),
  proteinGoal: decimal("protein_goal", { precision: 5, scale: 2 }),
  carbGoal: decimal("carb_goal", { precision: 5, scale: 2 }),
  fatGoal: decimal("fat_goal", { precision: 5, scale: 2 }),
  fiberGoal: decimal("fiber_goal", { precision: 4, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Plugin information
export const plugins = pgTable("plugins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  version: varchar("version", { length: 20 }),
  author: varchar("author", { length: 100 }),
  description: text("description"),
  isActive: boolean("is_active").default(false),
  priority: integer("priority").default(100),
  configuration: jsonb("configuration"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// A/B test experiments
export const experiments = pgTable("experiments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  variants: jsonb("variants").notNull(),
  trafficAllocation: jsonb("traffic_allocation").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Experiment participants
export const experimentParticipants = pgTable("experiment_participants", {
  id: serial("id").primaryKey(),
  experimentId: integer("experiment_id").notNull().references(() => experiments.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  variant: varchar("variant", { length: 50 }).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// Framework events log
export const frameworkEvents = pgTable("framework_events", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  userId: varchar("user_id").references(() => users.id),
  data: jsonb("data"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  bmrCalculations: many(bmrCalculations),
  workoutPlans: many(workoutPlans),
  workouts: many(workouts),
  nutritionEntries: many(nutritionEntries),
  nutritionGoals: many(nutritionGoals),
  experimentParticipants: many(experimentParticipants),
  frameworkEvents: many(frameworkEvents),
}));

export const userProfileRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const workoutPlanRelations = relations(workoutPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [workoutPlans.userId],
    references: [users.id],
  }),
  workouts: many(workouts),
}));

export const workoutRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  plan: one(workoutPlans, {
    fields: [workouts.planId],
    references: [workoutPlans.id],
  }),
  exercises: many(workoutExercises),
}));

export const exerciseRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExerciseRelations = relations(workoutExercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id],
  }),
}));

export const nutritionEntryRelations = relations(nutritionEntries, ({ one }) => ({
  user: one(users, {
    fields: [nutritionEntries.userId],
    references: [users.id],
  }),
}));

export const nutritionGoalRelations = relations(nutritionGoals, ({ one }) => ({
  user: one(users, {
    fields: [nutritionGoals.userId],
    references: [users.id],
  }),
}));

export const experimentRelations = relations(experiments, ({ many }) => ({
  participants: many(experimentParticipants),
}));

export const experimentParticipantRelations = relations(experimentParticipants, ({ one }) => ({
  experiment: one(experiments, {
    fields: [experimentParticipants.experimentId],
    references: [experiments.id],
  }),
  user: one(users, {
    fields: [experimentParticipants.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
});

export const insertNutritionEntrySchema = createInsertSchema(nutritionEntries).omit({
  id: true,
  createdAt: true,
});

export const insertNutritionGoalSchema = createInsertSchema(nutritionGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExperimentSchema = createInsertSchema(experiments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type NutritionEntry = typeof nutritionEntries.$inferSelect;
export type InsertNutritionEntry = z.infer<typeof insertNutritionEntrySchema>;
export type NutritionGoal = typeof nutritionGoals.$inferSelect;
export type InsertNutritionGoal = z.infer<typeof insertNutritionGoalSchema>;
export type Plugin = typeof plugins.$inferSelect;
export type Experiment = typeof experiments.$inferSelect;
export type InsertExperiment = z.infer<typeof insertExperimentSchema>;
export type BMRCalculation = typeof bmrCalculations.$inferSelect;
export type FrameworkEvent = typeof frameworkEvents.$inferSelect;
