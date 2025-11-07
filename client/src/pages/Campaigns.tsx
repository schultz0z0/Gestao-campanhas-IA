import { useState } from "react";
import { CampaignCard } from "@/components/CampaignCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Megaphone, Plus, Search } from "lucide-react";

export default function Campaigns() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const campaigns = [
    {
      id: "1",
      title: "Campanha de Verão 2025",
      status: "active" as const,
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 2, 31),
      leadsCount: 452,
      actionsCount: 12,
      progress: 67,
      lastUpdated: new Date(),
    },
    {
      id: "2",
      title: "Black Friday Tech",
      status: "active" as const,
      startDate: new Date(2024, 10, 15),
      endDate: new Date(2024, 11, 1),
      leadsCount: 389,
      actionsCount: 15,
      progress: 88,
      lastUpdated: new Date(2024, 10, 20),
    },
    {
      id: "3",
      title: "Lançamento Curso IA",
      status: "scheduled" as const,
      startDate: new Date(2025, 3, 1),
      endDate: new Date(2025, 5, 30),
      leadsCount: 0,
      actionsCount: 8,
      progress: 0,
      lastUpdated: new Date(2025, 2, 15),
    },
  ];

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Campanhas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas campanhas de marketing
          </p>
        </div>
        <Button data-testid="button-new-campaign">
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
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              {...campaign}
              onView={() => console.log("View campaign:", campaign.id)}
              onEdit={() => console.log("Edit campaign:", campaign.id)}
              onDelete={() => console.log("Delete campaign:", campaign.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
