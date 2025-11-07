# Marketing AI ENS - Sistema Inteligente de Marketing

## Overview

Marketing AI ENS é uma plataforma completa de marketing com IA que utiliza **Model Routing** inteligente para otimizar custos e performance, alternando entre LLMs robustos (GPT-4/Gemini Pro) e leves (Gemini Flash/GPT-4-mini) conforme a complexidade da tarefa.

## Tecnologias

- **Frontend**: React + Vite, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI (GPT-4, GPT-4-mini) + Google Gemini (Gemini Pro, Gemini Flash)

## Arquitetura

### Model Routing System

O sistema de roteamento inteligente otimiza custos usando:

**LLM Robusto (GPT-4/Gemini Pro)** - Tarefas Complexas:
- Análise SWOT
- Geração de Personas
- Planejamento Estratégico

**LLM Leve (Gemini Flash/GPT-4-mini)** - Tarefas Simples:
- Mensagens-chave
- Ideias de campanhas
- Ações avulsas

### Estrutura do Banco de Dados

Tabelas principais:
- `profiles` - Perfis de usuários
- `modalities` - Modalidades de cursos
- `courses` - Cursos disponíveis
- `campaigns` - Campanhas de marketing
- `personas` - Personas geradas pela IA
- `swot_analyses` - Análises SWOT
- `marketing_actions` - Ações de marketing
- `leads` - Leads capturados

## Funcionalidades Principais

### 1. Gestão de Campanhas
- CRUD completo de campanhas
- Formulário multi-step para criação
- Filtros e busca
- Status tracking (draft, active, scheduled, completed)

### 2. Geração com IA

**Tarefas de Alta Complexidade:**
- Análise SWOT com contexto completo da campanha
- Geração de 3+ personas detalhadas
- Planejamento estratégico com 8-12 ações distribuídas

**Tarefas de Baixa Complexidade:**
- 5-7 mensagens-chave persuasivas
- Brainstorming de ideias de campanha
- Ações avulsas executando exatamente o briefing do usuário

### 3. Validação Inteligente
- Ajuste automático de datas das ações para respeitar período da campanha
- Distribuição equilibrada de ações ao longo do tempo
- Validação de dados com Zod

### 4. Autenticação
- Login/registro via Supabase Auth
- Sessões persistentes
- Row Level Security (RLS)

## API Endpoints

### Autenticação
- `POST /api/auth/signup` - Criar conta
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Campanhas
- `GET /api/campaigns` - Listar campanhas do usuário
- `GET /api/campaigns/:id` - Detalhes da campanha
- `POST /api/campaigns` - Criar campanha
- `PATCH /api/campaigns/:id` - Atualizar campanha
- `DELETE /api/campaigns/:id` - Deletar campanha

### IA - Alta Complexidade
- `POST /api/ai/generate-swot` - Gerar análise SWOT
- `POST /api/ai/generate-personas` - Gerar personas
- `POST /api/ai/generate-strategic-plan` - Gerar plano estratégico

### IA - Baixa Complexidade
- `POST /api/ai/generate-key-messages` - Gerar mensagens-chave
- `POST /api/ai/generate-campaign-ideas` - Gerar ideias de campanha
- `POST /api/ai/generate-standalone-actions` - Gerar ações avulsas

### Dados Complementares
- `GET /api/modalities` - Listar modalidades
- `GET /api/courses` - Listar cursos
- `GET/POST /api/campaigns/:campaignId/leads` - Gerenciar leads
- `GET /api/campaigns/:campaignId/personas` - Listar personas
- `GET /api/campaigns/:campaignId/swot` - Listar análises SWOT
- `GET /api/campaigns/:campaignId/actions` - Listar ações

## Variáveis de Ambiente

```
OPENAI_API_KEY - Chave da API OpenAI
GEMINI_API_KEY - Chave da API Google Gemini
SUPABASE_URL - URL do projeto Supabase
SUPABASE_ANON_KEY - Chave pública do Supabase

VITE_SUPABASE_URL - URL do Supabase (frontend)
VITE_SUPABASE_ANON_KEY - Chave do Supabase (frontend)
```

## Estado do Projeto

### ✅ Implementado
- Schema completo do banco de dados
- Sistema de Model Routing com fallback automático
- Prompt engineering avançado para todas as tarefas
- API completa de autenticação
- CRUD de campanhas
- Todos os endpoints de IA
- Validação e ajuste de datas
- Frontend integrado com backend
- Formulário multi-step de Nova Campanha
- Página de detalhes da campanha com tabs
- Sistema de autenticação real

### 🔄 Próximos Passos
- Testes end-to-end
- Setup do banco de dados Supabase (tabelas + RLS)
- Deploy e configuração de produção

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

## Notas de Implementação

- Todos os prompts incluem contexto completo da campanha
- JSON estruturado garantido via response_format (OpenAI) ou limpeza de markdown (Gemini)
- Validação robusta com Zod em todos os endpoints
- Fallback automático entre provedores de IA em caso de erro
- Invalidação de cache após mutações para dados sempre atualizados
