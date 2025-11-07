import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client for RLS-protected operations (uses user auth context)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for privileged operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to regular client if service role key not available

// Helper to get authenticated user from request
export async function getAuthUser(authHeader?: string) {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("Invalid or expired token");
  }

  return data.user;
}

// Database helpers
export const db = {
  // Campaigns
  async getCampaigns(userId: string) {
    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        course:courses(
          id,
          name,
          description,
          modality:modalities(id, name)
        ),
        leads(id),
        marketing_actions(id)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCampaign(id: string, userId: string) {
    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        course:courses(
          id,
          name,
          description,
          price,
          modality:modalities(id, name)
        ),
        personas(*),
        swot_analyses(*),
        marketing_actions(*),
        leads(*)
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async createCampaign(campaign: any) {
    const { data, error } = await supabase
      .from("campaigns")
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCampaign(id: string, userId: string, updates: any) {
    const { data, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCampaign(id: string, userId: string) {
    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },

  // Modalities
  async getModalities() {
    const { data, error } = await supabase
      .from("modalities")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },

  // Courses
  async getCourses(modalityId?: string) {
    let query = supabase
      .from("courses")
      .select(`
        *,
        modality:modalities(id, name)
      `)
      .order("name");

    if (modalityId) {
      query = query.eq("modality_id", modalityId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Personas
  async createPersona(persona: any) {
    const { data, error } = await supabase
      .from("personas")
      .insert(persona)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPersonas(campaignId: string) {
    const { data, error } = await supabase
      .from("personas")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // SWOT Analyses
  async createSwotAnalysis(swot: any) {
    const { data, error } = await supabase
      .from("swot_analyses")
      .insert(swot)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSwotAnalyses(campaignId: string) {
    const { data, error } = await supabase
      .from("swot_analyses")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Marketing Actions
  async createMarketingAction(action: any) {
    const { data, error } = await supabase
      .from("marketing_actions")
      .insert(action)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMarketingActions(campaignId: string) {
    const { data, error } = await supabase
      .from("marketing_actions")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("scheduled_date");

    if (error) throw error;
    return data;
  },

  async updateMarketingAction(id: string, updates: any) {
    const { data, error } = await supabase
      .from("marketing_actions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Leads
  async createLead(lead: any) {
    const { data, error } = await supabase
      .from("leads")
      .insert(lead)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLeads(campaignId: string) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateLead(id: string, updates: any) {
    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
