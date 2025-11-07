import { StatusBadge } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-4 p-8">
      <StatusBadge status="ativa" />
      <StatusBadge status="planejamento" />
      <StatusBadge status="concluida" />
      <StatusBadge status="pausada" />
    </div>
  );
}
