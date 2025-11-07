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
- `leads` - Leads capturados com tracking de stage (lead → inscrito → matriculado)
- `offers` - Ofertas e promoções com descontos (percentual/fixo), códigos, limites
- `enrollments` - Matrículas com vínculo a leads, ofertas e campanhas

## Funcionalidades Principais

### 1. Gestão de Campanhas
- CRUD completo de campanhas
- Formulário multi-step para criação com validação robusta
- Filtros e busca
- Status tracking (draft, active, scheduled, completed)
- Sincronização automática modalidade ↔ cursos disponíveis

### 2. Analytics Avançado
- Dashboard com 8 métricas principais em tempo real
- Funil de conversão visual (Leads → Inscritos → Matriculados)
- Filtros por período (7/30/90 dias) e campanha específica
- Cálculo de ROI e taxa de conversão
- Cards de status de campanhas (Planejamento, Ativa, Concluída)
- Sistema de tabs (Visão Geral, Insights IA, Comparação)
- Refetch automático quando filtros mudam

### 3. Gestão de Ofertas
- CRUD completo de ofertas e promoções
- Tipos de desconto: percentual ou valor fixo (R$)
- Códigos promocionais únicos
- Limite de redenções configurável
- Período de validade (data início/fim)
- Vinculação a cursos específicos ou todos os cursos
- Status ativo/inativo
- Tracking de uso (quantas vezes foi aplicada)

### 4. Geração com IA

**Tarefas de Alta Complexidade:**
- Análise SWOT com contexto completo da campanha
- Geração de 3+ personas detalhadas
- Planejamento estratégico com 8-12 ações distribuídas

**Tarefas de Baixa Complexidade:**
- 5-7 mensagens-chave persuasivas
- Brainstorming de ideias de campanha
- Ações avulsas executando exatamente o briefing do usuário

### 5. Validação Inteligente
- Ajuste automático de datas das ações para respeitar período da campanha
- Distribuição equilibrada de ações ao longo do tempo
- Validação de dados com Zod

### 6. Autenticação
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

### Analytics
- `GET /api/analytics?period=30&campaignId=uuid` - Métricas agregadas com filtros

### Ofertas
- `GET /api/offers` - Listar ofertas do usuário
- `POST /api/offers` - Criar oferta
- `PATCH /api/offers/:id` - Atualizar oferta
- `DELETE /api/offers/:id` - Deletar oferta

### Matrículas
- `GET /api/enrollments` - Listar matrículas
- `POST /api/enrollments` - Criar matrícula
- `PATCH /api/enrollments/:id` - Atualizar matrícula

## Variáveis de Ambiente

As seguintes variáveis de ambiente são necessárias e devem ser configuradas nos Secrets do Replit:

```
OPENAI_API_KEY - Chave de API da OpenAI
GEMINI_API_KEY - Chave de API do Google Gemini
SUPABASE_URL - URL do projeto Supabase
SUPABASE_ANON_KEY - Chave anônima do Supabase
VITE_SUPABASE_URL - URL do Supabase para o cliente (mesma que SUPABASE_URL)
VITE_SUPABASE_ANON_KEY - Chave anônima para o cliente (mesma que SUPABASE_ANON_KEY)
SUPABASE_SERVICE_ROLE_KEY - Chave de service role do Supabase (apenas backend)
```

**Nota de Segurança**: Todas as chaves de API devem ser armazenadas como Secrets no Replit e nunca commitadas no código.

## Estado do Projeto

### ✅ Implementado

**Backend:**
- Schema completo com offers, enrollments e lead stages
- Sistema de Model Routing com fallback automático
- Prompt engineering avançado para todas as tarefas
- API completa de autenticação
- CRUD de campanhas, ofertas e matrículas
- Conversão automática camelCase → snake_case para Supabase
- Endpoints de analytics com métricas agregadas
- Todos os endpoints de IA
- Validação e ajuste de datas

**Frontend:**
- Formulário multi-step de Nova Campanha com validação robusta
- Página de Analytics Avançado com filtros funcionais
- Gestão completa de Ofertas com modal CRUD
- Página de detalhes da campanha com tabs
- Sistema de autenticação real
- Loading states e skeleton screens
- Integração completa com backend

**Correções Críticas:**
- ✅ toSnakeCase aplicado em todos os métodos de insert/update do Supabase
- ✅ Analytics com queryKey dinâmico e refetch automático
- ✅ SelectItem corrigido em todos os formulários (não usa value="")
- ✅ Sanitização de dados opcionais antes de submeter
- ✅ Validação de courseId ao trocar modalidade

### 🔄 Próximos Passos
- Adicionar animações com framer-motion (cards, transições)
- Implementar loading states avançados
- Adicionar micro-interações e efeitos hover
- Sistema de filtros avançados no Analytics
- Gráfico de projeção de crescimento
- Testes end-to-end
- Deploy e configuração de produção

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

## Notas de Implementação

**Backend:**
- Todos os prompts incluem contexto completo da campanha
- JSON estruturado garantido via response_format (OpenAI) ou limpeza de markdown (Gemini)
- Validação robusta com Zod em todos os endpoints
- Fallback automático entre provedores de IA em caso de erro
- Conversão automática camelCase → snake_case para compatibilidade com Supabase

**Frontend:**
- TanStack Query com invalidação de cache após mutações
- queryKey dinâmico para refetch automático quando filtros mudam
- Sanitização de dados antes de submeter (strings vazias → undefined)
- SelectItem sempre com valor não-vazio (usa sentinela "all" quando necessário)
- Validação de formulários com react-hook-form + Zod
- Loading states e skeleton screens em todas as páginas

**Convenções:**
- Sempre use `form.setValue(field, value, { shouldValidate: true })` ao limpar campos programaticamente
- Nunca use `<SelectItem value="">` (use sentinela como "all" e converta)
- Sempre aplique toSnakeCase antes de inserir/atualizar no Supabase
- Sempre inclua variáveis de filtro no queryKey para refetch automático
