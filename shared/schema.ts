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
  about: text("about"),
  targetAudience: text("target_audience"),
  offerDetails: text("offer_details"),
  price: decimal("price", { precision: 10, scale: 2 }),
  duration: text("duration"),
  enrollmentPeriod: jsonb("enrollment_period"),
  courseStartDate: timestamp("course_start_date"),
  status: text("status").notNull().default("active"), // active, inactive
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
  linkedType: text("linked_type").notNull(), // 'course' or 'modality'
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
  modalityId: uuid("modality_id").references(() => modalities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  marker: text("marker").notNull().unique(),
  campaignObjective: text("campaign_objective"),
  additionalDetails: text("additional_details"),
  status: text("status").notNull().default("planejamento"), // planejamento, ativa, pausada, concluida
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goals: jsonb("goals"),
  metrics: jsonb("metrics"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  differentiatorsEns: text("differentiators_ens").array(),
  keyMessages: text("key_messages").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  marker: true,
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
  objective: text("objective"),
  type: text("type").notNull(),
  channels: text("channels").array(),
  actionStartDate: timestamp("action_start_date"),
  actionEndDate: timestamp("action_end_date"),
  scheduledDate: timestamp("scheduled_date"),
  status: text("status").notNull().default("planejada"), // planejada, em_andamento, concluida, cancelada
  budget: decimal("budget", { precision: 10, scale: 2 }),
  individualGoal: integer("individual_goal"),
  goalUnit: text("goal_unit"),
  results: jsonb("results"),
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
  marker: text("marker"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("new"),
  stage: text("stage").notNull().default("lead"), // lead, inscrito, matriculado
  source: text("source"),
  notes: text("notes"),
  leadDate: timestamp("lead_date").defaultNow(),
  inscritoDate: timestamp("inscrito_date"),
  matriculadoDate: timestamp("matriculado_date"),
  enrolledAt: timestamp("enrolled_at"),
  matriculatedAt: timestamp("matriculated_at"),
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

// Offers Table (Ofertas de Desconto)
export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "set null" }),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  maxRedemptions: integer("max_redemptions"),
  currentRedemptions: integer("current_redemptions").notNull().default(0),
  code: text("code").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  currentRedemptions: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;

// Enrollments Table (Matrículas)
export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  offerId: uuid("offer_id").references(() => offers.id, { onDelete: "set null" }),
  status: text("status").notNull().default("enrolled"), // enrolled, active, completed, dropped
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, refunded
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
