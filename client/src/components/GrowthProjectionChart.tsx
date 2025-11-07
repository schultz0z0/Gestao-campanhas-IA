import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface GrowthProjectionChartProps {
  data?: {
    totalLeads: number;
    inscritos: number;
    matriculados: number;
  };
}

export function GrowthProjectionChart({ data }: GrowthProjectionChartProps) {
  const generateProjectionData = () => {
    const currentLeads = data?.totalLeads || 0;
    const currentInscritos = data?.inscritos || 0;
    const currentMatriculados = data?.matriculados || 0;
    
    const growthRate = 1.15;
    const months = ["Atual", "Mês 1", "Mês 2", "Mês 3", "Mês 4", "Mês 5", "Mês 6"];
    
    return months.map((month, index) => {
      const multiplier = Math.pow(growthRate, index);
      return {
        month,
        leads: Math.round(currentLeads * multiplier),
        inscritos: Math.round(currentInscritos * multiplier),
        matriculados: Math.round(currentMatriculados * multiplier),
        isProjection: index > 0,
      };
    });
  };

  const projectionData = generateProjectionData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 rounded-lg border border-primary/20 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold">{entry.value}</span>
            </div>
          ))}
          {payload[0]?.payload?.isProjection && (
            <p className="text-xs text-muted-foreground mt-2 italic">Projeção baseada em crescimento de 15%/mês</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Projeção de Crescimento
            </CardTitle>
            <CardDescription className="mt-2">
              Previsão de crescimento baseada em dados históricos (15% ao mês)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--ens-primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--ens-primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorInscritos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--ens-secondary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--ens-secondary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMatriculados" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--ens-success))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--ens-success))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="leads"
              name="Leads"
              stroke="hsl(var(--ens-primary))"
              strokeWidth={2}
              fill="url(#colorLeads)"
            />
            <Area
              type="monotone"
              dataKey="inscritos"
              name="Inscritos"
              stroke="hsl(var(--ens-secondary))"
              strokeWidth={2}
              fill="url(#colorInscritos)"
            />
            <Area
              type="monotone"
              dataKey="matriculados"
              name="Matriculados"
              stroke="hsl(var(--ens-success))"
              strokeWidth={2}
              fill="url(#colorMatriculados)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <motion.div 
          className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Insights:</strong> Com a taxa atual de crescimento de 15% ao mês,
            você pode alcançar aproximadamente{" "}
            <strong className="text-primary">{projectionData[6]?.leads || 0} leads</strong> e{" "}
            <strong className="text-primary">{projectionData[6]?.matriculados || 0} matrículas</strong> em 6 meses.
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
