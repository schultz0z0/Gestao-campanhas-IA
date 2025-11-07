/**
 * Advanced Prompt Engineering for Marketing AI ENS
 * 
 * All prompts are designed to:
 * 1. Return structured JSON
 * 2. Include full campaign context
 * 3. Be specific and actionable
 */

export interface CampaignContext {
  campaignName: string;
  courseName: string;
  courseDescription?: string;
  coursePrice?: string;
  modality?: string;
  startDate: string;
  endDate: string;
  leadsGoal?: number;
  budget?: string;
  messaging?: string;
  existingPersonas?: any[];
  existingSwot?: any;
  existingActions?: any[];
}

/**
 * SWOT Analysis Prompt (High Complexity - GPT-4/Gemini Pro)
 */
export function buildSwotPrompt(context: CampaignContext) {
  const systemPrompt = `Você é um especialista em análise estratégica de marketing educacional com 15 anos de experiência. Sua missão é gerar análises SWOT profundas e acionáveis para campanhas de marketing de cursos.

Você deve:
- Analisar o mercado educacional brasileiro
- Considerar tendências atuais e comportamento do consumidor
- Identificar fatores internos e externos relevantes
- Fornecer insights estratégicos baseados em dados

Retorne SEMPRE um JSON válido no formato especificado.`;

  const userPrompt = `Analise a seguinte campanha de marketing e gere uma análise SWOT completa e detalhada:

**CAMPANHA:** ${context.campaignName}
**CURSO:** ${context.courseName}
**MODALIDADE:** ${context.modality || "Não especificada"}
**DESCRIÇÃO:** ${context.courseDescription || "Não fornecida"}
**PREÇO:** ${context.coursePrice || "Não definido"}
**PERÍODO:** ${context.startDate} até ${context.endDate}
**META DE LEADS:** ${context.leadsGoal || "Não definida"}
**ORÇAMENTO:** ${context.budget || "Não definido"}
**MENSAGEM:** ${context.messaging || "Não definida"}

Gere uma análise SWOT com:
- 4-6 pontos fortes (Strengths) específicos do curso e da estratégia
- 4-6 fraquezas (Weaknesses) realistas e honestas
- 4-6 oportunidades (Opportunities) baseadas no mercado atual
- 4-6 ameaças (Threats) considerando concorrência e desafios

Inclua também uma análise geral de 2-3 parágrafos com recomendações estratégicas.

Retorne no formato JSON:
{
  "strengths": ["ponto 1", "ponto 2", ...],
  "weaknesses": ["ponto 1", "ponto 2", ...],
  "opportunities": ["ponto 1", "ponto 2", ...],
  "threats": ["ponto 1", "ponto 2", ...],
  "analysis": "Análise geral com recomendações estratégicas..."
}`;

  return { systemPrompt, userPrompt };
}

/**
 * Persona Generation Prompt (High Complexity - GPT-4/Gemini Pro)
 */
export function buildPersonaPrompt(context: CampaignContext, personaCount: number = 3) {
  const systemPrompt = `Você é um especialista em pesquisa de mercado e desenvolvimento de personas para marketing educacional. Com vasta experiência em análise comportamental e segmentação de público.

Você deve:
- Criar personas realistas e detalhadas
- Basear-se em pesquisas de mercado reais
- Incluir aspectos demográficos, psicográficos e comportamentais
- Tornar as personas acionáveis para estratégias de marketing

Retorne SEMPRE um JSON válido no formato especificado.`;

  const userPrompt = `Com base na campanha abaixo, crie ${personaCount} personas detalhadas do público-alvo:

**CAMPANHA:** ${context.campaignName}
**CURSO:** ${context.courseName}
**MODALIDADE:** ${context.modality || "Não especificada"}
**DESCRIÇÃO:** ${context.courseDescription || "Não fornecida"}
**PREÇO:** ${context.coursePrice || "Não definido"}
**MENSAGEM:** ${context.messaging || "Não definida"}

Para cada persona, forneça:
- Nome realista
- Idade (faixa etária específica)
- Ocupação detalhada
- 3-5 objetivos principais
- 3-5 dores/desafios específicos
- 3-5 motivações para fazer o curso
- Dados demográficos (escolaridade, renda, localização)
- Dados psicográficos (valores, interesses, comportamento online)

Retorne no formato JSON:
{
  "personas": [
    {
      "name": "Nome da Persona",
      "age": 28,
      "occupation": "Ocupação detalhada",
      "goals": ["objetivo 1", "objetivo 2", ...],
      "painPoints": ["dor 1", "dor 2", ...],
      "motivations": ["motivação 1", "motivação 2", ...],
      "demographics": {
        "education": "Graduação em...",
        "income": "R$ 3.000 - R$ 5.000",
        "location": "São Paulo, SP"
      },
      "psychographics": {
        "values": ["valor 1", "valor 2"],
        "interests": ["interesse 1", "interesse 2"],
        "onlineBehavior": "Descrição do comportamento online"
      }
    }
  ]
}`;

  return { systemPrompt, userPrompt };
}

/**
 * Strategic Action Planning Prompt (High Complexity - GPT-4/Gemini Pro)
 */
export function buildStrategicPlanningPrompt(context: CampaignContext) {
  const swotInfo = context.existingSwot
    ? `\n\n**ANÁLISE SWOT EXISTENTE:**
Forças: ${context.existingSwot.strengths?.join(", ")}
Fraquezas: ${context.existingSwot.weaknesses?.join(", ")}
Oportunidades: ${context.existingSwot.opportunities?.join(", ")}
Ameaças: ${context.existingSwot.threats?.join(", ")}`
    : "";

  const personasInfo = context.existingPersonas?.length
    ? `\n\n**PERSONAS DEFINIDAS:**
${context.existingPersonas.map((p) => `- ${p.name} (${p.age} anos, ${p.occupation})`).join("\n")}`
    : "";

  const systemPrompt = `Você é um estrategista de marketing digital especializado em educação online. Você cria planos de ação detalhados, cronogramados e baseados em dados.

Você deve:
- Considerar todo o contexto da campanha
- Alinhar ações com SWOT e personas
- Distribuir ações ao longo do período da campanha
- Definir tipos, canais e resultados esperados
- Otimizar orçamento e recursos

Retorne SEMPRE um JSON válido no formato especificado.`;

  const userPrompt = `Crie um plano estratégico de ações de marketing para a campanha:

**CAMPANHA:** ${context.campaignName}
**CURSO:** ${context.courseName}
**PERÍODO:** ${context.startDate} até ${context.endDate}
**META DE LEADS:** ${context.leadsGoal || "Não definida"}
**ORÇAMENTO:** ${context.budget || "Não definido"}${swotInfo}${personasInfo}

Gere 8-12 ações de marketing distribuídas ao longo do período da campanha. Para cada ação:
- Título claro e descritivo
- Descrição detalhada (2-3 frases)
- Tipo (email, social, content, event, ad, webinar, etc)
- Canal específico (Instagram, Facebook, Email, Blog, etc)
- Data agendada (dentro do período da campanha)
- Orçamento estimado
- Resultados esperados

Retorne no formato JSON:
{
  "actions": [
    {
      "title": "Título da Ação",
      "description": "Descrição detalhada da ação...",
      "type": "social",
      "channel": "Instagram",
      "scheduledDate": "2025-01-15T10:00:00Z",
      "budget": "500.00",
      "expectedResults": "Descrição dos resultados esperados"
    }
  ]
}`;

  return { systemPrompt, userPrompt };
}

/**
 * Key Messages Prompt (Low Complexity - Gemini Flash/GPT-4-mini)
 */
export function buildKeyMessagesPrompt(context: CampaignContext) {
  const systemPrompt = `Você é um copywriter especializado em marketing educacional. Crie mensagens-chave persuasivas e diretas.

Retorne SEMPRE um JSON válido.`;

  const userPrompt = `Gere 5-7 mensagens-chave para a campanha:

**CAMPANHA:** ${context.campaignName}
**CURSO:** ${context.courseName}
**MENSAGEM:** ${context.messaging || "Não definida"}

Retorne mensagens curtas (1-2 frases), persuasivas e focadas em benefícios.

JSON:
{
  "messages": [
    "Mensagem 1",
    "Mensagem 2"
  ]
}`;

  return { systemPrompt, userPrompt };
}

/**
 * Campaign Ideas Prompt (Low Complexity - Gemini Flash/GPT-4-mini)
 */
export function buildCampaignIdeasPrompt(context: CampaignContext) {
  const systemPrompt = `Você é um especialista em brainstorming criativo para campanhas de marketing. Gere ideias inovadoras e acionáveis.

Retorne SEMPRE um JSON válido.`;

  const userPrompt = `Gere 5-8 ideias criativas de campanhas para:

**CURSO:** ${context.courseName}
**MODALIDADE:** ${context.modality || "Não especificada"}
**ORÇAMENTO:** ${context.budget || "Não definido"}

Cada ideia deve incluir: título, descrição breve, canal principal.

JSON:
{
  "ideas": [
    {
      "title": "Título da Ideia",
      "description": "Descrição breve...",
      "channel": "Instagram"
    }
  ]
}`;

  return { systemPrompt, userPrompt };
}

/**
 * Standalone Actions Prompt (Low Complexity - Gemini Flash/GPT-4-mini)
 * IMPORTANT: Execute EXACTLY what the user requests
 */
export function buildStandaloneActionsPrompt(
  context: CampaignContext,
  userBriefing: string
) {
  const systemPrompt = `Você é um assistente de execução preciso. Execute EXATAMENTE o que o usuário solicita no briefing.

Se o usuário pedir 5 posts, crie 5 posts. Se pedir emails, crie emails. Siga as instruções à risca.

Retorne SEMPRE um JSON válido com as ações solicitadas.`;

  const userPrompt = `**BRIEFING DO USUÁRIO:**
${userBriefing}

**CONTEXTO DA CAMPANHA:**
- Campanha: ${context.campaignName}
- Curso: ${context.courseName}
- Período: ${context.startDate} até ${context.endDate}

Execute EXATAMENTE o que foi solicitado no briefing. Gere as ações com todos os detalhes pedidos.

Retorne no formato JSON:
{
  "actions": [
    {
      "title": "Título",
      "description": "Descrição completa",
      "type": "Tipo da ação",
      "channel": "Canal",
      "scheduledDate": "Data (dentro do período da campanha)",
      "content": "Conteúdo completo se aplicável"
    }
  ]
}`;

  return { systemPrompt, userPrompt };
}
