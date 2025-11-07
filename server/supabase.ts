import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = typeof value === 'object' && value !== null ? toSnakeCase(value) : value;
  }
  return result;
}

export function generateMarker(prefix: string = "ENS"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${random}`;
}

export function calculateMetrics(leads: any[], enrollments: any[], totalBudget: number = 0) {
  const leadsCount = leads?.length || 0;
  const inscritosCount = leads?.filter(l => l.stage === "inscrito" || l.inscrito_date).length || 0;
  const matriculadosCount = enrollments?.filter(e => e.payment_status === "paid").length || 0;
  
  const convLeadToInscrito = leadsCount > 0 ? (inscritosCount / leadsCount) * 100 : 0;
  const convInscritoToMatriculado = inscritosCount > 0 ? (matriculadosCount / inscritosCount) * 100 : 0;
  const convLeadToMatriculado = leadsCount > 0 ? (matriculadosCount / leadsCount) * 100 : 0;
  const costPerLead = leadsCount > 0 ? totalBudget / leadsCount : 0;
  
  const totalRevenue = enrollments?.reduce((sum, e) => sum + (parseFloat(e.paid_amount || "0")), 0) || 0;
  const roi = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0;

  return {
    leads_count: leadsCount,
    inscritos_count: inscritosCount,
    matriculados_count: matriculadosCount,
    conversion_lead_inscrito: Number(convLeadToInscrito.toFixed(1)),
    conversion_inscrito_matriculado: Number(convInscritoToMatriculado.toFixed(1)),
    conversion_lead_matriculado: Number(convLeadToMatriculado.toFixed(1)),
    cost_per_lead: Number(costPerLead.toFixed(2)),
    roi: Number(roi.toFixed(1)),
  };
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
    const campaignWithMarker = {
      ...campaign,
      marker: generateMarker("ENS"),
    };
    
    const { data, error } = await supabase
      .from("campaigns")
      .insert(toSnakeCase(campaignWithMarker))
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCampaign(id: string, userId: string, updates: any) {
    const { data, error } = await supabase
      .from("campaigns")
      .update(toSnakeCase(updates))
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

  async createModality(modality: any) {
    const { data, error } = await supabase
      .from("modalities")
      .insert(toSnakeCase(modality))
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateModality(id: string, updates: any) {
    const { data, error } = await supabase
      .from("modalities")
      .update(toSnakeCase(updates))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteModality(id: string) {
    const { error } = await supabase
      .from("modalities")
      .delete()
      .eq("id", id);

    if (error) throw error;
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

  async createCourse(course: any) {
    const { data, error } = await supabase
      .from("courses")
      .insert(toSnakeCase(course))
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCourse(id: string, updates: any) {
    const { data, error} = await supabase
      .from("courses")
      .update(toSnakeCase(updates))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCourse(id: string) {
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Personas
  async createPersona(persona: any) {
    const { data, error } = await supabase
      .from("personas")
      .insert(toSnakeCase(persona))
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
      .insert(toSnakeCase(swot))
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
      .insert(toSnakeCase(action))
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
      .update(toSnakeCase(updates))
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
      .insert(toSnakeCase(lead))
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
    const { data, error} = await supabase
      .from("leads")
      .update(toSnakeCase(updates))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Offers
  async getOffers(userId: string) {
    const { data, error } = await supabase
      .from("offers")
      .select(`
        *,
        course:courses(id, name)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getOffer(id: string, userId: string) {
    const { data, error } = await supabase
      .from("offers")
      .select(`
        *,
        course:courses(id, name)
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async createOffer(offer: any) {
    const { data, error } = await supabase
      .from("offers")
      .insert(toSnakeCase(offer))
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOffer(id: string, userId: string, updates: any) {
    const { data, error } = await supabase
      .from("offers")
      .update(toSnakeCase(updates))
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteOffer(id: string, userId: string) {
    const { error } = await supabase
      .from("offers")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },

  // Enrollments
  async getEnrollments(campaignId: string) {
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        lead:leads(id, name, email),
        course:courses(id, name),
        offer:offers(id, name)
      `)
      .eq("campaign_id", campaignId)
      .order("enrolled_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createEnrollment(enrollment: any) {
    const { data, error } = await supabase
      .from("enrollments")
      .insert(toSnakeCase(enrollment))
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEnrollment(id: string, updates: any) {
    const { data, error } = await supabase
      .from("enrollments")
      .update(toSnakeCase(updates))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Analytics & Metrics
  async getAnalytics(userId: string, campaignId?: string, startDate?: Date, endDate?: Date) {
    let leadsQuery = supabase
      .from("leads")
      .select("*, campaign:campaigns!inner(user_id)")
      .eq("campaigns.user_id", userId);

    if (campaignId) {
      leadsQuery = leadsQuery.eq("campaign_id", campaignId);
    }

    if (startDate) {
      leadsQuery = leadsQuery.gte("created_at", startDate.toISOString());
    }

    if (endDate) {
      leadsQuery = leadsQuery.lte("created_at", endDate.toISOString());
    }

    const { data: leads, error: leadsError } = await leadsQuery;
    if (leadsError) throw leadsError;

    let enrollmentsQuery = supabase
      .from("enrollments")
      .select("*, campaign:campaigns!inner(user_id)")
      .eq("campaigns.user_id", userId);

    if (campaignId) {
      enrollmentsQuery = enrollmentsQuery.eq("campaign_id", campaignId);
    }

    if (startDate) {
      enrollmentsQuery = enrollmentsQuery.gte("enrolled_at", startDate.toISOString());
    }

    if (endDate) {
      enrollmentsQuery = enrollmentsQuery.lte("enrolled_at", endDate.toISOString());
    }

    const { data: enrollments, error: enrollmentsError } = await enrollmentsQuery;
    if (enrollmentsError) throw enrollmentsError;

    let campaignsQuery = supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId);

    if (campaignId) {
      campaignsQuery = campaignsQuery.eq("id", campaignId);
    }

    const { data: campaigns, error: campaignsError } = await campaignsQuery;
    if (campaignsError) throw campaignsError;

    const totalLeads = leads?.length || 0;
    const inscritos = leads?.filter(l => l.stage === "inscrito" || l.enrolled_at).length || 0;
    const matriculados = enrollments?.filter(e => e.payment_status === "paid").length || 0;
    
    const convLeadToInscrito = totalLeads > 0 ? (inscritos / totalLeads) * 100 : 0;
    const convInscritoToMatriculado = inscritos > 0 ? (matriculados / inscritos) * 100 : 0;
    const convLeadToMatriculado = totalLeads > 0 ? (matriculados / totalLeads) * 100 : 0;

    const totalBudget = campaigns?.reduce((sum, c) => sum + (parseFloat(c.budget || "0")), 0) || 0;
    const totalRevenue = enrollments?.reduce((sum, e) => sum + (parseFloat(e.paid_amount || "0")), 0) || 0;
    const custoPerMatricula = matriculados > 0 ? totalBudget / matriculados : 0;
    const roi = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0;

    const activeCampaigns = campaigns?.filter(c => c.status === "ativa").length || 0;
    const draftCampaigns = campaigns?.filter(c => c.status === "planejamento").length || 0;
    const completedCampaigns = campaigns?.filter(c => c.status === "concluida").length || 0;
    const pausedCampaigns = campaigns?.filter(c => c.status === "pausada").length || 0;

    return {
      totalLeads,
      inscritos,
      matriculados,
      convLeadToInscrito: Number(convLeadToInscrito.toFixed(1)),
      convInscritoToMatriculado: Number(convInscritoToMatriculado.toFixed(1)),
      convLeadToMatriculado: Number(convLeadToMatriculado.toFixed(1)),
      totalBudget: Number(totalBudget.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      custoPerMatricula: Number(custoPerMatricula.toFixed(2)),
      roi: Number(roi.toFixed(1)),
      totalCampaigns: campaigns?.length || 0,
      activeCampaigns,
      draftCampaigns,
      pausedCampaigns,
      completedCampaigns,
      campaigns: campaigns || [],
      leads: leads || [],
      enrollments: enrollments || [],
    };
  },
};
