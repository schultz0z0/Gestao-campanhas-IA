import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { supabase, supabaseAdmin, getAuthUser, db } from "./supabase";
import { ModelRouter } from "./ai/model-router";
import {
  buildSwotPrompt,
  buildPersonaPrompt,
  buildStrategicPlanningPrompt,
  buildKeyMessagesPrompt,
  buildCampaignIdeasPrompt,
  buildStandaloneActionsPrompt,
  type CampaignContext,
} from "./ai/prompts";
import { validateAndAdjustDates, distributeActionsEvenly } from "./ai/validators";
import { insertCampaignSchema, insertLeadSchema, insertPersonaSchema, insertSwotAnalysisSchema, insertMarketingActionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for authentication
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const user = await getAuthUser(req.headers.authorization);
      req.user = user;
      next();
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };

  // ============================================
  // AUTHENTICATION ROUTES
  // ============================================

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      // Create profile using admin client (bypasses RLS)
      if (data.user) {
        const { error: profileError } = await supabaseAdmin.from("profiles").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Don't throw - profile creation is secondary
        }
      }

      res.json({ user: data.user, session: data.session });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      res.json({ user: data.user, session: data.session });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      await supabase.auth.signOut();
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // MODALITIES & COURSES
  // ============================================

  app.get("/api/modalities", requireAuth, async (req, res) => {
    try {
      const modalities = await db.getModalities();
      res.json(modalities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/courses", requireAuth, async (req, res) => {
    try {
      const { modalityId } = req.query;
      const courses = await db.getCourses(modalityId as string);
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // CAMPAIGNS CRUD
  // ============================================

  app.get("/api/campaigns", requireAuth, async (req: any, res) => {
    try {
      const campaigns = await db.getCampaigns(req.user.id);
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/campaigns/:id", requireAuth, async (req: any, res) => {
    try {
      const campaign = await db.getCampaign(req.params.id, req.user.id);
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/campaigns", requireAuth, async (req: any, res) => {
    try {
      const validated = insertCampaignSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const campaign = await db.createCampaign(validated);
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/campaigns/:id", requireAuth, async (req: any, res) => {
    try {
      const campaign = await db.updateCampaign(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/campaigns/:id", requireAuth, async (req: any, res) => {
    try {
      await db.deleteCampaign(req.params.id, req.user.id);
      res.json({ message: "Campaign deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // AI ENDPOINTS - HIGH COMPLEXITY (GPT-4/Gemini Pro)
  // ============================================

  // Generate SWOT Analysis
  app.post("/api/ai/generate-swot", requireAuth, async (req: any, res) => {
    try {
      const { campaignId } = req.body;

      // Get campaign with full context
      const campaign = await db.getCampaign(campaignId, req.user.id);

      const context: CampaignContext = {
        campaignName: campaign.name,
        courseName: campaign.course.name,
        courseDescription: campaign.course.description,
        coursePrice: campaign.course.price,
        modality: campaign.course.modality?.name,
        startDate: new Date(campaign.start_date).toLocaleDateString("pt-BR"),
        endDate: new Date(campaign.end_date).toLocaleDateString("pt-BR"),
        leadsGoal: campaign.leads_goal,
        budget: campaign.budget,
        messaging: campaign.messaging,
      };

      const { systemPrompt, userPrompt } = buildSwotPrompt(context);

      const result = await ModelRouter.generateJSON<{
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
        analysis: string;
      }>(
        { complexity: "high", taskName: "SWOT Analysis" },
        systemPrompt,
        userPrompt
      );

      // Save to database
      const swot = await db.createSwotAnalysis({
        campaign_id: campaignId,
        ...result,
      });

      res.json(swot);
    } catch (error: any) {
      console.error("SWOT generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Personas
  app.post("/api/ai/generate-personas", requireAuth, async (req: any, res) => {
    try {
      const { campaignId, count = 3 } = req.body;

      const campaign = await db.getCampaign(campaignId, req.user.id);

      const context: CampaignContext = {
        campaignName: campaign.name,
        courseName: campaign.course.name,
        courseDescription: campaign.course.description,
        coursePrice: campaign.course.price,
        modality: campaign.course.modality?.name,
        startDate: new Date(campaign.start_date).toLocaleDateString("pt-BR"),
        endDate: new Date(campaign.end_date).toLocaleDateString("pt-BR"),
        messaging: campaign.messaging,
      };

      const { systemPrompt, userPrompt } = buildPersonaPrompt(context, count);

      const result = await ModelRouter.generateJSON<{
        personas: Array<{
          name: string;
          age: number;
          occupation: string;
          goals: string[];
          painPoints: string[];
          motivations: string[];
          demographics: any;
          psychographics: any;
        }>;
      }>(
        { complexity: "high", taskName: "Persona Generation" },
        systemPrompt,
        userPrompt
      );

      // Save all personas to database
      const savedPersonas = [];
      for (const persona of result.personas) {
        const saved = await db.createPersona({
          campaign_id: campaignId,
          name: persona.name,
          age: persona.age,
          occupation: persona.occupation,
          goals: persona.goals,
          pain_points: persona.painPoints,
          motivations: persona.motivations,
          demographics: persona.demographics,
          psychographics: persona.psychographics,
        });
        savedPersonas.push(saved);
      }

      res.json(savedPersonas);
    } catch (error: any) {
      console.error("Persona generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Strategic Plan
  app.post("/api/ai/generate-strategic-plan", requireAuth, async (req: any, res) => {
    try {
      const { campaignId } = req.body;

      const campaign = await db.getCampaign(campaignId, req.user.id);
      const personas = await db.getPersonas(campaignId);
      const swotAnalyses = await db.getSwotAnalyses(campaignId);
      const existingActions = await db.getMarketingActions(campaignId);

      const context: CampaignContext = {
        campaignName: campaign.name,
        courseName: campaign.course.name,
        courseDescription: campaign.course.description,
        coursePrice: campaign.course.price,
        modality: campaign.course.modality?.name,
        startDate: new Date(campaign.start_date).toLocaleDateString("pt-BR"),
        endDate: new Date(campaign.end_date).toLocaleDateString("pt-BR"),
        leadsGoal: campaign.leads_goal,
        budget: campaign.budget,
        messaging: campaign.messaging,
        existingPersonas: personas,
        existingSwot: swotAnalyses[0],
        existingActions,
      };

      const { systemPrompt, userPrompt } = buildStrategicPlanningPrompt(context);

      const result = await ModelRouter.generateJSON<{
        actions: Array<{
          title: string;
          description: string;
          type: string;
          channel: string;
          scheduledDate: string;
          budget?: string;
          expectedResults: string;
        }>;
      }>(
        { complexity: "high", taskName: "Strategic Planning" },
        systemPrompt,
        userPrompt
      );

      // Validate and adjust dates
      const validatedActions = validateAndAdjustDates(
        result.actions,
        new Date(campaign.start_date),
        new Date(campaign.end_date)
      );

      // Save actions to database
      const savedActions = [];
      for (const action of validatedActions) {
        const saved = await db.createMarketingAction({
          campaign_id: campaignId,
          title: action.title,
          description: action.description,
          type: action.type,
          channel: action.channel,
          scheduled_date: action.scheduledDate,
          budget: action.budget,
          expected_results: action.expectedResults,
          status: "pending",
        });
        savedActions.push(saved);
      }

      res.json(savedActions);
    } catch (error: any) {
      console.error("Strategic plan generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // AI ENDPOINTS - LOW COMPLEXITY (Gemini Flash/GPT-4-mini)
  // ============================================

  // Generate Key Messages
  app.post("/api/ai/generate-key-messages", requireAuth, async (req: any, res) => {
    try {
      const { campaignId } = req.body;

      const campaign = await db.getCampaign(campaignId, req.user.id);

      const context: CampaignContext = {
        campaignName: campaign.name,
        courseName: campaign.course.name,
        courseDescription: campaign.course.description,
        modality: campaign.course.modality?.name,
        startDate: new Date(campaign.start_date).toLocaleDateString("pt-BR"),
        endDate: new Date(campaign.end_date).toLocaleDateString("pt-BR"),
        messaging: campaign.messaging,
      };

      const { systemPrompt, userPrompt } = buildKeyMessagesPrompt(context);

      const result = await ModelRouter.generateJSON<{
        messages: string[];
      }>(
        { complexity: "low", taskName: "Key Messages" },
        systemPrompt,
        userPrompt
      );

      res.json(result);
    } catch (error: any) {
      console.error("Key messages generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Campaign Ideas
  app.post("/api/ai/generate-campaign-ideas", requireAuth, async (req: any, res) => {
    try {
      const { campaignId } = req.body;

      const campaign = await db.getCampaign(campaignId, req.user.id);

      const context: CampaignContext = {
        campaignName: campaign.name,
        courseName: campaign.course.name,
        modality: campaign.course.modality?.name,
        startDate: new Date(campaign.start_date).toLocaleDateString("pt-BR"),
        endDate: new Date(campaign.end_date).toLocaleDateString("pt-BR"),
        budget: campaign.budget,
      };

      const { systemPrompt, userPrompt } = buildCampaignIdeasPrompt(context);

      const result = await ModelRouter.generateJSON<{
        ideas: Array<{
          title: string;
          description: string;
          channel: string;
        }>;
      }>(
        { complexity: "low", taskName: "Campaign Ideas" },
        systemPrompt,
        userPrompt
      );

      res.json(result);
    } catch (error: any) {
      console.error("Campaign ideas generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Standalone Actions (EXACT execution of user briefing)
  app.post("/api/ai/generate-standalone-actions", requireAuth, async (req: any, res) => {
    try {
      const { campaignId, briefing } = req.body;

      const campaign = await db.getCampaign(campaignId, req.user.id);

      const context: CampaignContext = {
        campaignName: campaign.name,
        courseName: campaign.course.name,
        startDate: new Date(campaign.start_date).toLocaleDateString("pt-BR"),
        endDate: new Date(campaign.end_date).toLocaleDateString("pt-BR"),
      };

      const { systemPrompt, userPrompt } = buildStandaloneActionsPrompt(
        context,
        briefing
      );

      const result = await ModelRouter.generateJSON<{
        actions: Array<{
          title: string;
          description: string;
          type: string;
          channel?: string;
          scheduledDate?: string;
          content?: string;
        }>;
      }>(
        { complexity: "low", taskName: "Standalone Actions" },
        systemPrompt,
        userPrompt
      );

      // Validate and adjust dates
      const validatedActions = validateAndAdjustDates(
        result.actions,
        new Date(campaign.start_date),
        new Date(campaign.end_date)
      );

      // Save actions to database
      const savedActions = [];
      for (const action of validatedActions) {
        const saved = await db.createMarketingAction({
          campaign_id: campaignId,
          title: action.title,
          description: action.description,
          type: action.type,
          channel: action.channel,
          scheduled_date: action.scheduledDate,
          status: "pending",
        });
        savedActions.push(saved);
      }

      res.json(savedActions);
    } catch (error: any) {
      console.error("Standalone actions generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // LEADS, PERSONAS, SWOT, ACTIONS CRUD
  // ============================================

  // Leads
  app.get("/api/campaigns/:campaignId/leads", requireAuth, async (req: any, res) => {
    try {
      const leads = await db.getLeads(req.params.campaignId);
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/campaigns/:campaignId/leads", requireAuth, async (req: any, res) => {
    try {
      const validated = insertLeadSchema.parse({
        ...req.body,
        campaign_id: req.params.campaignId,
      });

      const lead = await db.createLead(validated);
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Personas
  app.get("/api/campaigns/:campaignId/personas", requireAuth, async (req: any, res) => {
    try {
      const personas = await db.getPersonas(req.params.campaignId);
      res.json(personas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SWOT Analyses
  app.get("/api/campaigns/:campaignId/swot", requireAuth, async (req: any, res) => {
    try {
      const swot = await db.getSwotAnalyses(req.params.campaignId);
      res.json(swot);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Marketing Actions
  app.get("/api/campaigns/:campaignId/actions", requireAuth, async (req: any, res) => {
    try {
      const actions = await db.getMarketingActions(req.params.campaignId);
      res.json(actions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/actions/:id", requireAuth, async (req: any, res) => {
    try {
      const action = await db.updateMarketingAction(req.params.id, req.body);
      res.json(action);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
