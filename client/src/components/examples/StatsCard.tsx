import { StatsCard } from "../StatsCard";
import { Users, DollarSign, Target, TrendingUp } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
      <StatsCard
        title="Total de Leads"
        value="1,234"
        icon={Users}
        trend={{ value: 12.5, isPositive: true }}
        description="Últimos 30 dias"
      />
      <StatsCard
        title="Investimento"
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
  );
}
