import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Edit, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Offers() {
  const offers = [
    {
      id: "1",
      name: "Desconto 30% - Curso Marketing Digital",
      course: "Marketing Digital Avançado",
      discount: "30%",
      validUntil: "31/12/2025",
      isActive: true,
      usageCount: 45,
    },
    {
      id: "2",
      name: "Black Friday - 50% OFF",
      course: "Pacote Completo IA",
      discount: "50%",
      validUntil: "30/11/2024",
      isActive: false,
      usageCount: 128,
    },
    {
      id: "3",
      name: "Primeira Compra - 20% OFF",
      course: "Todos os Cursos",
      discount: "20%",
      validUntil: "31/12/2025",
      isActive: true,
      usageCount: 89,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Ofertas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas ofertas e promoções
          </p>
        </div>
        <Button data-testid="button-new-offer">
          <Plus className="h-4 w-4 mr-2" />
          Nova Oferta
        </Button>
      </div>

      {offers.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Nenhuma oferta criada"
          description="Crie ofertas especiais para aumentar suas conversões e engajar seus leads."
          actionLabel="Criar Primeira Oferta"
          onAction={() => console.log("Create first offer")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} data-testid={`offer-card-${offer.id}`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{offer.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {offer.course}
                  </p>
                </div>
                <Badge
                  variant={offer.isActive ? "default" : "outline"}
                  className={
                    offer.isActive
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                      : ""
                  }
                >
                  {offer.isActive ? "Ativa" : "Inativa"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Desconto</span>
                  <span className="text-2xl font-semibold text-primary">
                    {offer.discount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Válido até</span>
                  <span className="font-medium">{offer.validUntil}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uso</span>
                  <span className="font-medium">
                    {offer.usageCount} vezes
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid={`button-edit-offer-${offer.id}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    data-testid={`button-delete-offer-${offer.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
