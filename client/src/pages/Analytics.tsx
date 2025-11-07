import { StatsCard } from "@/components/StatsCard";
import { GrowthProjectionChart } from "@/components/GrowthProjectionChart";
import { Users, DollarSign, Target, TrendingUp, Sparkles, BarChart3, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { exportToCSV, formatDataForExport } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalLeads: number;
  inscritos: number;
  matriculados: number;
  convLeadToInscrito: number;
  convInscritoToMatriculado: number;
  convLeadToMatriculado: number;
  totalBudget: number;
  totalRevenue: number;
  custoPerMatricula: number;
  roi: number;
  totalCampaigns: number;
  activeCampaigns: number;
  draftCampaigns: number;
  completedCampaigns: number;
  campaigns: any[];
  leads: any[];
  enrollments: any[];
}

export default function Analytics() {
  const [period, setPeriod] = useState("30");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const { toast } = useToast();

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", { period, campaignId: selectedCampaign }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("period", period);
      if (selectedCampaign) {
        params.append("campaignId", selectedCampaign);
      }
      const response = await fetch(`/api/analytics?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
  });

  const { data: campaigns } = useQuery<any[]>({
    queryKey: ["/api/campaigns"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleExportAnalytics = () => {
    if (!analytics?.campaigns || analytics.campaigns.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há campanhas para exportar no momento.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formattedData = formatDataForExport(analytics.campaigns);
      exportToCSV(formattedData, 'analytics_campanhas');
      toast({
        title: "Exportação concluída!",
        description: `${formattedData.length} campanhas exportadas com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Analytics Avançado</h1>
          <p className="text-muted-foreground mt-1">
            Insights estratégicos e performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExportAnalytics}
            data-testid="button-export-csv"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Select 
            value={selectedCampaign || "all"} 
            onValueChange={(value) => setSelectedCampaign(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-48" data-testid="select-campaign">
              <SelectValue placeholder="Todas as campanhas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as campanhas</SelectItem>
              {campaigns?.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList data-testid="tabs-analytics">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="insights" data-testid="tab-insights">
            <Sparkles className="h-4 w-4 mr-2" />
            Insights IA
          </TabsTrigger>
          <TabsTrigger value="comparison" data-testid="tab-comparison">
            <Target className="h-4 w-4 mr-2" />
            Comparação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton-shimmer h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Leads"
                  value={analytics?.totalLeads.toString() || "0"}
                  icon={Users}
                  description={`Conv: ${analytics?.convLeadToInscrito.toFixed(1)}%`}
                />
                <StatsCard
                  title="Inscritos"
                  value={analytics?.inscritos.toString() || "0"}
                  icon={Target}
                  description={`Conv: ${analytics?.convInscritoToMatriculado.toFixed(1)}%`}
                />
                <StatsCard
                  title="Matriculados"
                  value={analytics?.matriculados.toString() || "0"}
                  icon={TrendingUp}
                  description="Taxa sucesso"
                />
                <StatsCard
                  title="Custo/Matric."
                  value={analytics?.custoPerMatricula ? formatCurrency(analytics.custoPerMatricula) : "R$ 0,00"}
                  icon={DollarSign}
                  description="Média geral"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total Campanhas"
                  value={analytics?.totalCampaigns.toString() || "0"}
                  icon={BarChart3}
                />
                <StatsCard
                  title="Total Ações"
                  value="0"
                  icon={Sparkles}
                />
                <StatsCard
                  title="Conv. L→M"
                  value={`${analytics?.convLeadToMatriculado.toFixed(1)}%` || "0%"}
                  icon={Target}
                />
                <StatsCard
                  title="Orçamento Total"
                  value={analytics?.totalBudget ? formatCurrency(analytics.totalBudget) : "R$ 0"}
                  icon={DollarSign}
                />
              </div>

              <GrowthProjectionChart data={{
                totalLeads: analytics?.totalLeads || 0,
                inscritos: analytics?.inscritos || 0,
                matriculados: analytics?.matriculados || 0,
              }} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Funil de Conversão</CardTitle>
                    <CardDescription>Jornada do Lead até Matrícula</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Leads</span>
                            <span className="text-sm font-semibold">{analytics?.totalLeads || 0}</span>
                          </div>
                          <div className="h-3 bg-blue-500/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Inscritos</span>
                            <span className="text-sm font-semibold">{analytics?.inscritos || 0}</span>
                          </div>
                          <div className="h-3 bg-green-500/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full transition-all"
                              style={{ 
                                width: analytics?.totalLeads 
                                  ? `${(analytics.inscritos / analytics.totalLeads) * 100}%` 
                                  : '0%' 
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Matriculados</span>
                            <span className="text-sm font-semibold">{analytics?.matriculados || 0}</span>
                          </div>
                          <div className="h-3 bg-purple-500/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full transition-all"
                              style={{ 
                                width: analytics?.totalLeads 
                                  ? `${(analytics.matriculados / analytics.totalLeads) * 100}%` 
                                  : '0%' 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status das Campanhas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                          <span className="font-medium">Planejamento</span>
                        </div>
                        <Badge variant="secondary">{analytics?.draftCampaigns || 0}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">Ativa</span>
                        </div>
                        <Badge variant="secondary">{analytics?.activeCampaigns || 0}</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          <span className="font-medium">Concluída</span>
                        </div>
                        <Badge variant="secondary">{analytics?.completedCampaigns || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights com IA</CardTitle>
              <CardDescription>Análise inteligente do desempenho</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento. Em breve você terá insights automáticos gerados por IA sobre suas campanhas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Campanhas</CardTitle>
              <CardDescription>Compare o desempenho entre diferentes campanhas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento. Em breve você poderá comparar campanhas lado a lado.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
