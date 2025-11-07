import { StatusBadge } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-4 p-8">
      <StatusBadge status="active" />
      <StatusBadge status="draft" />
      <StatusBadge status="completed" />
      <StatusBadge status="scheduled" />
    </div>
  );
}
