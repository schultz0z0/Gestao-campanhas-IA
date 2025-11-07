import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Profiles Table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Modalities Table
export const modalities = pgTable("modalities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertModalitySchema = createInsertSchema(modalities).omit({
  id: true,
  createdAt: true,
});

export type InsertModality = z.infer<typeof insertModalitySchema>;
export type Modality = typeof modalities.$inferSelect;

// Courses Table
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  modalityId: uuid("modality_id").notNull().references(() => modalities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  duration: text("duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Campaigns Table
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: text("status").notNull().default("draft"), // draft, active, scheduled, completed
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  leadsGoal: integer("leads_goal"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  messaging: text("messaging"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

// Personas Table
export const personas = pgTable("personas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age"),
  occupation: text("occupation"),
  goals: text("goals").array(),
  painPoints: text("pain_points").array(),
  motivations: text("motivations").array(),
  demographics: jsonb("demographics"),
  psychographics: jsonb("psychographics"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPersonaSchema = createInsertSchema(personas).omit({
  id: true,
  createdAt: true,
});

export type InsertPersona = z.infer<typeof insertPersonaSchema>;
export type Persona = typeof personas.$inferSelect;

// SWOT Analyses Table
export const swotAnalyses = pgTable("swot_analyses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  strengths: text("strengths").array().notNull(),
  weaknesses: text("weaknesses").array().notNull(),
  opportunities: text("opportunities").array().notNull(),
  threats: text("threats").array().notNull(),
  analysis: text("analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSwotAnalysisSchema = createInsertSchema(swotAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertSwotAnalysis = z.infer<typeof insertSwotAnalysisSchema>;
export type SwotAnalysis = typeof swotAnalyses.$inferSelect;

// Marketing Actions Table
export const marketingActions = pgTable("marketing_actions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // email, social, content, event, ad, etc
  channel: text("channel"),
  scheduledDate: timestamp("scheduled_date"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  budget: decimal("budget", { precision: 10, scale: 2 }),
  expectedResults: text("expected_results"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketingActionSchema = createInsertSchema(marketingActions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMarketingAction = z.infer<typeof insertMarketingActionSchema>;
export type MarketingAction = typeof marketingActions.$inferSelect;

// Leads Table
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("new"), // new, qualified, converted, lost
  source: text("source"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
