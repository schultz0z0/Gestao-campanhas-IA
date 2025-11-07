# Marketing AI ENS - Setup Guide

## ✅ Implementação Completa

Todos os componentes do sistema foram implementados com sucesso:

### Backend
- ✅ API de autenticação (signup, login, logout)
- ✅ CRUD completo de campanhas
- ✅ Endpoints de IA (SWOT, personas, planejamento estratégico)
- ✅ Sistema de Model Routing inteligente
- ✅ Validação de datas e ajuste automático
- ✅ Integração com Supabase

### Frontend
- ✅ Páginas: Login, Analytics, Campaigns, Campaign Details, New Campaign
- ✅ Formulário multi-step de criação de campanha
- ✅ Integração com backend (auth tokens propagados)
- ✅ Sistema de autenticação completo
- ✅ UI moderna com Shadcn

### Correções Aplicadas (Feedback do Architect)
- ✅ Auth tokens agora são enviados nas requisições (Bearer Authorization)
- ✅ Supabase Admin client criado para operações privilegiadas
- ✅ Fallback de modelo corrigido (OpenAI ⇄ Gemini)
- ✅ getCampaigns inclui relações necessárias (leads, marketing_actions)
- ✅ Datas convertidas para ISO strings antes de persistir

## 📋 Próximos Passos

### 1. Configurar Variáveis de Ambiente do Frontend

O frontend precisa das seguintes variáveis de ambiente (prefixadas com `VITE_`):

```bash
VITE_SUPABASE_URL=<sua_url_do_supabase>
VITE_SUPABASE_ANON_KEY=<sua_chave_anon_do_supabase>
```

**Como configurar:**
1. Vá para a aba "Secrets" no Replit
2. Adicione as secrets:
   - `VITE_SUPABASE_URL` com o valor da URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` com o valor da chave anônima do Supabase

### 2. Adicionar Service Role Key (Opcional mas Recomendado)

Para operações administrativas (como criar perfis de usuário), adicione:

```bash
SUPABASE_SERVICE_ROLE_KEY=<sua_service_role_key>
```

Esta chave bypassa RLS e permite operações privilegiadas no backend.

### 3. Configurar Banco de Dados Supabase

Execute os seguintes SQL scripts no Supabase SQL Editor:

```sql
-- 1. Criar tabela de profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela de modalities
CREATE TABLE modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela de courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2),
  modality_id UUID REFERENCES modalities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar tabela de campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leads_goal INTEGER,
  budget TEXT,
  messaging TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'scheduled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Criar tabela de personas
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  occupation TEXT,
  goals TEXT[] DEFAULT '{}',
  pain_points TEXT[] DEFAULT '{}',
  motivations TEXT[] DEFAULT '{}',
  demographics JSONB DEFAULT '{}',
  psychographics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Criar tabela de swot_analyses
CREATE TABLE swot_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  opportunities TEXT[] DEFAULT '{}',
  threats TEXT[] DEFAULT '{}',
  analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Criar tabela de marketing_actions
CREATE TABLE marketing_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  channel TEXT,
  scheduled_date DATE NOT NULL,
  budget TEXT,
  expected_results TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Criar tabela de leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE swot_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 10. Criar políticas RLS

-- Profiles: usuários podem ler e atualizar seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Campaigns: usuários podem gerenciar apenas suas campanhas
CREATE POLICY "Users can view own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Personas: acesso através da campanha
CREATE POLICY "Users can view personas from own campaigns" ON personas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = personas.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create personas for own campaigns" ON personas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = personas.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- SWOT: acesso através da campanha
CREATE POLICY "Users can view SWOT from own campaigns" ON swot_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = swot_analyses.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create SWOT for own campaigns" ON swot_analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = swot_analyses.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Marketing Actions: acesso através da campanha
CREATE POLICY "Users can view actions from own campaigns" ON marketing_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = marketing_actions.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create actions for own campaigns" ON marketing_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = marketing_actions.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update actions from own campaigns" ON marketing_actions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = marketing_actions.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Leads: acesso através da campanha
CREATE POLICY "Users can view leads from own campaigns" ON leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = leads.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create leads for own campaigns" ON leads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = leads.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update leads from own campaigns" ON leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = leads.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- 11. Inserir dados de exemplo (Opcional)

-- Modalidades
INSERT INTO modalities (name) VALUES 
  ('EAD'),
  ('Presencial'),
  ('Híbrido');

-- Cursos
INSERT INTO courses (name, description, price, modality_id) VALUES
  ('Gestão de Marketing Digital', 'Curso completo de marketing digital com foco em performance e ROI', 2500.00, (SELECT id FROM modalities WHERE name = 'EAD')),
  ('Análise de Dados', 'Aprenda a extrair insights de dados usando Python e SQL', 3000.00, (SELECT id FROM modalities WHERE name = 'EAD')),
  ('UX/UI Design', 'Design de interfaces centrado no usuário', 2800.00, (SELECT id FROM modalities WHERE name = 'Híbrido'));
```

### 4. Testar o Sistema

Após configurar tudo:

1. Reinicie o workflow (ou a aplicação)
2. Acesse a página de login
3. Crie uma conta de teste
4. Crie uma nova campanha
5. Use as ferramentas de IA para gerar:
   - Análise SWOT
   - Personas
   - Plano Estratégico

## 🔑 Secrets Necessários

Resumo de todas as secrets:

```
SUPABASE_URL - URL do projeto Supabase (backend)
SUPABASE_ANON_KEY - Chave anônima do Supabase (backend)
SUPABASE_SERVICE_ROLE_KEY - Service role key (backend, opcional)

VITE_SUPABASE_URL - URL do projeto Supabase (frontend)
VITE_SUPABASE_ANON_KEY - Chave anônima do Supabase (frontend)

OPENAI_API_KEY - Chave da API OpenAI
GEMINI_API_KEY - Chave da API Google Gemini
```

## 📊 Arquitetura do Sistema

```
Frontend (React + Vite)
  ↓ (Auth Tokens via Bearer)
Backend (Express)
  ↓ (Supabase Client)
Database (Supabase PostgreSQL)
  ↓ (RLS Policies)
Security Layer
```

```
AI Requests
  ↓
Model Router
  ├─ High Complexity → GPT-4 / Gemini Pro
  │  ├─ SWOT Analysis
  │  ├─ Personas
  │  └─ Strategic Planning
  │
  └─ Low Complexity → GPT-4-mini / Gemini Flash
     ├─ Key Messages
     ├─ Campaign Ideas
     └─ Standalone Actions
```

## 🎯 Features Implementadas

- [x] Autenticação com Supabase
- [x] CRUD de campanhas
- [x] Geração de SWOT com IA
- [x] Geração de personas com IA
- [x] Planejamento estratégico com IA
- [x] Validação e ajuste automático de datas
- [x] Model routing inteligente (custo/performance)
- [x] Formulário multi-step
- [x] UI moderna e responsiva
- [x] Integração frontend-backend completa

## 🚀 Ready to Deploy

O sistema está completo e pronto para uso. Após configurar as variáveis de ambiente e o banco de dados, você pode começar a criar campanhas e usar a IA para gerar insights estratégicos!
