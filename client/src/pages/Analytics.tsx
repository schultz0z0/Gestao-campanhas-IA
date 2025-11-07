import { StatsCard } from "@/components/StatsCard";
import { Users, DollarSign, Target, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function Analytics() {
  const [period, setPeriod] = useState("30");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o desempenho de suas campanhas
          </p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Leads"
          value="1,234"
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
          description={`Últimos ${period} dias`}
        />
        <StatsCard
          title="Investimento Total"
          value="R$ 45.000"
          icon={DollarSign}
          trend={{ value: 8.2, isPositive: false }}
          description="Budget atual"
        />
        <StatsCard
          title="Taxa de Conversão"
          value="24.5%"
          icon={Target}
          trend={{ value: 4.1, isPositive: true }}
        />
        <StatsCard
          title="ROI"
          value="385%"
          icon={TrendingUp}
          trend={{ value: 15.3, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Campanha de Verão 2025", leads: 452, budget: "R$ 15.000" },
                { name: "Black Friday Tech", leads: 389, budget: "R$ 12.000" },
                { name: "Lançamento Curso IA", leads: 267, budget: "R$ 8.000" },
              ].map((campaign, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  data-testid={`active-campaign-${i}`}
                >
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.leads} leads • {campaign.budget}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      +{Math.floor(Math.random() * 20 + 5)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Email Marketing - Promoção", date: "08/11/2025", type: "Email" },
                { title: "Post Instagram - Depoimentos", date: "09/11/2025", type: "Social" },
                { title: "Webinar ao Vivo", date: "12/11/2025", type: "Evento" },
              ].map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                  data-testid={`upcoming-action-${i}`}
                >
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.date} • {action.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
