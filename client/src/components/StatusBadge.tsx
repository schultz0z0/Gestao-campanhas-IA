import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CampaignStatus = "active" | "draft" | "completed" | "scheduled";

interface StatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

const statusConfig = {
  active: {
    label: "Ativa",
    className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  draft: {
    label: "Rascunho",
    className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  },
  completed: {
    label: "Concluída",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  scheduled: {
    label: "Agendada",
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
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
