import { CampaignCard } from "../CampaignCard";

export default function CampaignCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
      <CampaignCard
        id="1"
        title="Campanha de Verão 2025"
        status="active"
        startDate={new Date(2025, 0, 1)}
        endDate={new Date(2025, 2, 31)}
        leadsCount={452}
        actionsCount={12}
        progress={67}
        lastUpdated={new Date()}
        onView={() => console.log("View campaign 1")}
        onEdit={() => console.log("Edit campaign 1")}
        onDelete={() => console.log("Delete campaign 1")}
      />
      <CampaignCard
        id="2"
        title="Lançamento Novo Curso"
        status="scheduled"
        startDate={new Date(2025, 3, 1)}
        endDate={new Date(2025, 5, 30)}
        leadsCount={0}
        actionsCount={8}
        progress={0}
        lastUpdated={new Date(2025, 2, 15)}
        onView={() => console.log("View campaign 2")}
        onEdit={() => console.log("Edit campaign 2")}
        onDelete={() => console.log("Delete campaign 2")}
      />
    </div>
  );
}
