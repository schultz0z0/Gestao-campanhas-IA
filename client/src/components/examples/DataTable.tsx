import { DataTable } from "../DataTable";
import { Badge } from "@/components/ui/badge";

interface Lead {
  name: string;
  email: string;
  status: string;
  date: string;
}

export default function DataTableExample() {
  const leads: Lead[] = [
    { name: "João Silva", email: "joao@email.com", status: "Novo", date: "05/11/2025" },
    { name: "Maria Santos", email: "maria@email.com", status: "Qualificado", date: "04/11/2025" },
    { name: "Pedro Oliveira", email: "pedro@email.com", status: "Convertido", date: "03/11/2025" },
  ];

  const columns = [
    { key: "name", label: "Nome" },
    { key: "email", label: "Email" },
    {
      key: "status",
      label: "Status",
      render: (lead: Lead) => (
        <Badge variant="outline">{lead.status}</Badge>
      ),
    },
    { key: "date", label: "Data" },
  ];

  return (
    <div className="p-8">
      <DataTable
        data={leads}
        columns={columns}
        currentPage={1}
        totalPages={3}
        onPageChange={(page) => console.log("Page:", page)}
      />
    </div>
  );
}
