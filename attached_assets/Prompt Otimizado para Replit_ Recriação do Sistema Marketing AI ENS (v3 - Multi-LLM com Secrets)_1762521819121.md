# Prompt Otimizado para Replit: Recriação do Sistema Marketing AI ENS (v3 - Multi-LLM com Secrets)

**Ei, Replit! Vamos elevar o nível desse projeto!**

**Você é um Engenheiro de Software Full-Stack Sênior, especialista em Arquitetura de Microserviços, Model Routing e Integração de Múltiplos LLMs (OpenAI e Gemini/similar).** Seu objetivo é recriar o sistema "Marketing AI ENS" com foco em otimização de custo e performance.

**1. Arquitetura e Setup:**

*   **Tecnologias:** Use **React** (Next.js ou Vite), **TypeScript** e **Tailwind CSS** (com estilo Shadcn/UI).
*   **Backend e Banco de Dados:** **100% Supabase**. Use o **Postgres** para dados, **Supabase Auth** para login e o **Supabase Client** para comunicação.
*   **Segurança (Secrets):** **ATENÇÃO!** As chaves de API e URLs já foram fornecidas. Por favor, configure as seguintes **Replit Secrets** imediatamente para que o desenvolvimento possa começar sem interrupções:

| Nome da Secret | Valor |
| :--- | :--- |
| `OPENAI_API_KEY` | `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` |
| `GEMINI_API_KEY` | `AIzaSyBQpWNrG1dkG0Mt9cMhIeMvZgqplyV_Ldg` |
| `SUPABASE_URL` | `https://xazsyivwarckaqzwlook.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhenN5aXZ3YXJja2Fxendsb29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTY5OTEsImV4cCI6MjA3ODA5Mjk5MX0.9casWczz7A6xlyt86QIqEM0rv1arXmAagK5SrOdDwpo` |
| `SUPABASE_DB_PASSWORD` | `Ens@2025.atn` |

**2. Estrutura do Supabase (Schema):**

Crie as tabelas essenciais: `profiles`, `modalities`, `courses`, `campaigns`, `personas`, `swot_analyses`, `marketing_actions` e `leads`. Lembre-se do **Row Level Security (RLS)**!

**3. Funcionalidades de IA (Otimização Multi-LLM):**

Aqui está a grande sacada: vamos usar a estratégia de **Model Routing** para otimizar custo e velocidade.

*   **Regra de Ouro:** Todas as chamadas à IA devem ser feitas com **Prompt Engineering Avançado** e devem retornar um **JSON estruturado** (usando o `response_format` da API). O prompt deve ser enriquecido com o **Contexto Completo da Campanha** (dados do Supabase) para todas as tarefas estratégicas.

*   **LLM Robusto (Ex: GPT-4 ou Gemini Pro):** Use o modelo mais potente para tarefas que exigem raciocínio complexo, criatividade e análise de múltiplos dados do Supabase.
    *   **Tarefas:** Geração de **Análise SWOT**, Geração de **Personas** detalhadas e **Planejamento Estratégico de Ações** (que analisa o curso, metas, SWOT e ações existentes).

*   **LLM Leve/Rápido (Ex: Gemini Flash ou gpt-4.1-mini):** Use o modelo mais rápido e de menor custo para tarefas mais simples ou de alto volume.
    *   **Tarefas:** Geração de **Mensagens-Chave**, Geração de **Ideias de Campanhas** (brainstorm inicial) e a funcionalidade de **Ações Avulsas** (onde a precisão da instrução do usuário é mais importante que o raciocínio complexo).

*   **Ações Avulsas (StandaloneActions):** Mantenha a precisão: a IA precisa executar **EXATAMENTE** o que o usuário pedir no briefing (quantidade, formato, tipo de ação).

*   **Validação de Datas:** Implemente a lógica de verificação e ajuste das datas das ações geradas pela IA, garantindo que respeitem o período da campanha salvo no Supabase.

**4. Páginas e UX:**

Crie as rotas principais: `/Analytics`, `/Campaigns`, `/Offers` e `/AIAssistant`. Garanta que o feedback visual (loaders) seja rápido, especialmente nas chamadas de IA.

**Comece pelo setup do Supabase Client e da Autenticação, e depois crie o formulário de `Nova Campanha` para ter a base de dados para as funcionalidades de IA.**

**Manda ver!**
