import { EmptyState } from "../EmptyState";
import { Megaphone } from "lucide-react";

export default function EmptyStateExample() {
  return (
    <div className="p-8">
      <EmptyState
        icon={Megaphone}
        title="Nenhuma campanha criada"
        description="Comece criando sua primeira campanha de marketing com inteligência artificial para alcançar seus objetivos."
        actionLabel="Nova Campanha"
        onAction={() => console.log("Create campaign clicked")}
      />
    </div>
  );
}
