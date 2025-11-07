import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CampaignStatus = "ativa" | "planejamento" | "concluida" | "pausada";

interface StatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

const statusConfig = {
  ativa: {
    label: "Ativa",
    className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  planejamento: {
    label: "Planejamento",
    className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  },
  concluida: {
    label: "Concluída",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  pausada: {
    label: "Pausada",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
