import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Sparkles, Users, Target, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: campaign, isLoading } = useQuery<any>({
    queryKey: ["/api/campaigns", id],
  });

  const generateSwotMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/ai/generate-swot", "POST", { campaignId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", id] });
      toast({
        title: "Análise SWOT gerada!",
        description: "A análise foi criada com sucesso.",
      });
    },
  });

  const generatePersonasMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/ai/generate-personas", "POST", {
        campaignId: id,
        count: 3,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", id] });
      toast({
        title: "Personas geradas!",
        description: "3 personas foram criadas com sucesso.",
      });
    },
  });

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/ai/generate-strategic-plan", "POST", {
        campaignId: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", id] });
      toast({
        title: "Plano gerado!",
        description: "O plano estratégico foi criado com sucesso.",
      });
    },
  });

  if (isLoading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!campaign) {
    return <div className="p-8">Campanha não encontrada</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/campaigns")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">{campaign.name}</h1>
          <p className="text-muted-foreground mt-1">
            {campaign.course?.name} - {campaign.course?.modality?.name}
          </p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Leads</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {campaign.leads?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Personas</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {campaign.personas?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Ações</h3>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {campaign.marketing_actions?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Período</h3>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {format(new Date(campaign.start_date), "dd MMM", { locale: ptBR })} -{" "}
              {format(new Date(campaign.end_date), "dd MMM", { locale: ptBR })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="swot">SWOT</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas de IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => generateSwotMutation.mutate()}
                disabled={generateSwotMutation.isPending}
                data-testid="button-generate-swot"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generateSwotMutation.isPending ? "Gerando..." : "Gerar Análise SWOT"}
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => generatePersonasMutation.mutate()}
                disabled={generatePersonasMutation.isPending}
                data-testid="button-generate-personas"
              >
                <Users className="h-4 w-4 mr-2" />
                {generatePersonasMutation.isPending ? "Gerando..." : "Gerar Personas (3)"}
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => generatePlanMutation.mutate()}
                disabled={generatePlanMutation.isPending}
                data-testid="button-generate-plan"
              >
                <Target className="h-4 w-4 mr-2" />
                {generatePlanMutation.isPending
                  ? "Gerando..."
                  : "Gerar Plano Estratégico"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personas">
          {campaign.personas?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaign.personas.map((persona: any) => (
                <Card key={persona.id}>
                  <CardHeader>
                    <CardTitle>{persona.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {persona.age} anos - {persona.occupation}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Objetivos</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {persona.goals?.map((goal: string, i: number) => (
                          <li key={i}>• {goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Dores</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {persona.pain_points?.map((pain: string, i: number) => (
                          <li key={i}>• {pain}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhuma persona criada ainda. Use a ferramenta de IA para gerar.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="swot">
          {campaign.swot_analyses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaign.swot_analyses.map((swot: any) => (
                <div key={swot.id} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600 dark:text-green-400">
                        Forças
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {swot.strengths?.map((item: string, i: number) => (
                          <li key={i} className="text-sm">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-yellow-600 dark:text-yellow-400">
                        Fraquezas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {swot.weaknesses?.map((item: string, i: number) => (
                          <li key={i} className="text-sm">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600 dark:text-blue-400">
                        Oportunidades
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {swot.opportunities?.map((item: string, i: number) => (
                          <li key={i} className="text-sm">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600 dark:text-red-400">
                        Ameaças
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {swot.threats?.map((item: string, i: number) => (
                          <li key={i} className="text-sm">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhuma análise SWOT criada ainda. Use a ferramenta de IA para gerar.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions">
          {campaign.marketing_actions?.length > 0 ? (
            <div className="space-y-4">
              {campaign.marketing_actions.map((action: any) => (
                <Card key={action.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{action.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.type} • {action.channel}
                        </p>
                      </div>
                      <StatusBadge status={action.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{action.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {format(new Date(action.scheduled_date), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                      {action.budget && <span>Budget: R$ {action.budget}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhuma ação criada ainda. Use a ferramenta de IA para gerar um plano.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
