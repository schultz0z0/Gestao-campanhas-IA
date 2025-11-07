import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge, CampaignStatus } from "./StatusBadge";
import { MoreVertical, Users, Calendar, Target } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

interface CampaignCardProps {
  id: string;
  title: string;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  leadsCount: number;
  actionsCount: number;
  progress: number;
  lastUpdated: Date;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CampaignCard({
  id,
  title,
  status,
  startDate,
  endDate,
  leadsCount,
  actionsCount,
  progress,
  lastUpdated,
  onView,
  onEdit,
  onDelete,
}: CampaignCardProps) {
  return (
    <Card className="hover-elevate gradient-overlay border-primary/10" data-testid={`campaign-card-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid={`button-campaign-menu-${id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView} data-testid="menu-view">
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit} data-testid="menu-edit">
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive"
                data-testid="menu-delete"
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            className="flex flex-col"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-xs text-muted-foreground mb-1">Leads</span>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold" data-testid="text-leads">
                {leadsCount}
              </span>
            </div>
          </motion.div>
          <motion.div 
            className="flex flex-col"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-xs text-muted-foreground mb-1">Ações</span>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold" data-testid="text-actions">
                {actionsCount}
              </span>
            </div>
          </motion.div>
          <motion.div 
            className="flex flex-col"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-xs text-muted-foreground mb-1">Progresso</span>
            <span className="text-lg font-semibold text-primary" data-testid="text-progress">
              {progress}%
            </span>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(startDate, "dd MMM", { locale: ptBR })} -{" "}
            {format(endDate, "dd MMM yyyy", { locale: ptBR })}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <span className="text-xs text-muted-foreground">
          Atualizado {format(lastUpdated, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onView}
          data-testid={`button-view-campaign-${id}`}
        >
          Ver detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}
