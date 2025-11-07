import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CampaignCard } from "@/components/CampaignCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Megaphone, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";

function calculateProgress(campaign: any): number {
  const now = new Date().getTime();
  const start = new Date(campaign.start_date).getTime();
  const end = new Date(campaign.end_date).getTime();
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  return Math.round(((now - start) / (end - start)) * 100);
}

export default function Campaigns() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [, navigate] = useLocation();

  const { data: campaigns = [], isLoading, isFetching } = useQuery<any[]>({
    queryKey: ["/api/campaigns"],
  });

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading && !campaigns.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton-shimmer h-9 w-48" />
            <div className="skeleton-shimmer h-5 w-64" />
          </div>
          <div className="skeleton-shimmer h-10 w-36" />
        </div>
        <div className="flex gap-4">
          <div className="skeleton-shimmer h-10 flex-1" />
          <div className="skeleton-shimmer h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Campanhas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas campanhas de marketing
          </p>
        </div>
        <Button onClick={() => navigate("/campaigns/new")} data-testid="button-new-campaign">
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-campaigns"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="scheduled">Agendada</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nenhuma campanha encontrada"
          description="Não encontramos campanhas que correspondam aos seus critérios de busca."
          actionLabel="Limpar Filtros"
          onAction={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CampaignCard
                id={campaign.id}
                title={campaign.name}
                status={campaign.status}
                startDate={new Date(campaign.start_date)}
                endDate={new Date(campaign.end_date)}
                leadsCount={campaign.leads?.length || 0}
                actionsCount={campaign.marketing_actions?.length || 0}
                progress={calculateProgress(campaign)}
                lastUpdated={new Date(campaign.updated_at)}
                onView={() => navigate(`/campaigns/${campaign.id}`)}
                onEdit={() => navigate(`/campaigns/${campaign.id}`)}
                onDelete={() => console.log("Delete campaign:", campaign.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
