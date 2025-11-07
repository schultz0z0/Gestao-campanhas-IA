import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Edit, Trash2, Percent, DollarSign } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const offerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.string().min(1, "Valor do desconto é obrigatório"),
  courseId: z.string().optional(),
  validFrom: z.string().min(1, "Data inicial é obrigatória"),
  validUntil: z.string().min(1, "Data final é obrigatória"),
  isActive: z.boolean().default(true),
  maxRedemptions: z.string().optional(),
  code: z.string().optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

export default function Offers() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);

  const { data: offers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/offers"],
  });

  const { data: courses } = useQuery<any[]>({
    queryKey: ["/api/courses"],
  });

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      courseId: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
      maxRedemptions: "",
      code: "",
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      return apiRequest("/api/offers", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "Oferta criada!",
        description: "Sua oferta foi criada com sucesso.",
      });
      setIsModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar oferta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: async (data: OfferFormData & { id: string }) => {
      const { id, ...offerData } = data;
      return apiRequest(`/api/offers/${id}`, "PATCH", offerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "Oferta atualizada!",
        description: "Sua oferta foi atualizada com sucesso.",
      });
      setIsModalOpen(false);
      setEditingOffer(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar oferta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/offers/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "Oferta deletada!",
        description: "Sua oferta foi deletada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar oferta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenModal = (offer?: any) => {
    if (offer) {
      setEditingOffer(offer);
      form.reset({
        name: offer.name,
        description: offer.description || "",
        discountType: offer.discount_type,
        discountValue: offer.discount_value,
        courseId: offer.course_id || "",
        validFrom: new Date(offer.valid_from).toISOString().split('T')[0],
        validUntil: new Date(offer.valid_until).toISOString().split('T')[0],
        isActive: offer.is_active,
        maxRedemptions: offer.max_redemptions?.toString() || "",
        code: offer.code || "",
      });
    } else {
      setEditingOffer(null);
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (data: OfferFormData) => {
    const sanitizedData = {
      ...data,
      maxRedemptions: data.maxRedemptions && data.maxRedemptions.trim() !== "" 
        ? data.maxRedemptions 
        : undefined,
      code: data.code && data.code.trim() !== "" ? data.code : undefined,
      courseId: data.courseId && data.courseId.trim() !== "" ? data.courseId : undefined,
      description: data.description && data.description.trim() !== "" ? data.description : undefined,
    };

    if (editingOffer) {
      updateOfferMutation.mutate({ ...sanitizedData, id: editingOffer.id });
    } else {
      createOfferMutation.mutate(sanitizedData);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDiscount = (type: string, value: string) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return `R$ ${parseFloat(value).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Ofertas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas ofertas e promoções
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} data-testid="button-new-offer">
          <Plus className="h-4 w-4 mr-2" />
          Nova Oferta
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : offers?.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Nenhuma oferta criada"
          description="Crie ofertas especiais para aumentar suas conversões e engajar seus leads."
          actionLabel="Criar Primeira Oferta"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers?.map((offer) => (
            <Card key={offer.id} data-testid={`offer-card-${offer.id}`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{offer.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {offer.course?.name || "Todos os cursos"}
                  </p>
                </div>
                <Badge
                  variant={offer.is_active ? "default" : "outline"}
                  className={
                    offer.is_active
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                      : ""
                  }
                >
                  {offer.is_active ? "Ativa" : "Inativa"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Desconto</span>
                  <span className="text-2xl font-semibold text-primary flex items-center gap-1">
                    {offer.discount_type === "percentage" ? (
                      <Percent className="h-5 w-5" />
                    ) : (
                      <DollarSign className="h-5 w-5" />
                    )}
                    {formatDiscount(offer.discount_type, offer.discount_value)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Válido até</span>
                  <span className="font-medium">{formatDate(offer.valid_until)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uso</span>
                  <span className="font-medium">
                    {offer.current_redemptions} / {offer.max_redemptions || "∞"}
                  </span>
                </div>
                {offer.code && (
                  <div className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Código</span>
                    <code className="font-mono font-semibold">{offer.code}</code>
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenModal(offer)}
                    data-testid={`button-edit-offer-${offer.id}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja deletar esta oferta?")) {
                        deleteOfferMutation.mutate(offer.id);
                      }
                    }}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOffer ? "Editar Oferta" : "Nova Oferta"}
            </DialogTitle>
            <DialogDescription>
              {editingOffer
                ? "Atualize as informações da oferta"
                : "Crie uma nova oferta de desconto para seus cursos"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Oferta</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Black Friday 50% OFF"
                        {...field}
                        data-testid="input-offer-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva os detalhes da oferta..."
                        {...field}
                        data-testid="input-offer-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Desconto</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-discount-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentual (%)</SelectItem>
                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Desconto</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 50"
                          {...field}
                          data-testid="input-discount-value"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Curso (opcional)</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value || "all"} 
                        onValueChange={(value) => field.onChange(value === "all" ? "" : value)}
                      >
                        <SelectTrigger data-testid="select-course">
                          <SelectValue placeholder="Todos os cursos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os cursos</SelectItem>
                          {courses?.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Deixe vazio para aplicar a todos os cursos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válido de</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          data-testid="input-valid-from"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válido até</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          data-testid="input-valid-until"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxRedemptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Usos (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ilimitado"
                          {...field}
                          data-testid="input-max-redemptions"
                        />
                      </FormControl>
                      <FormDescription>
                        Deixe vazio para usos ilimitados
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: BLACKFRIDAY"
                          {...field}
                          data-testid="input-code"
                        />
                      </FormControl>
                      <FormDescription>
                        Código promocional único
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Oferta Ativa</FormLabel>
                      <FormDescription>
                        A oferta estará disponível para uso imediatamente
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-is-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createOfferMutation.isPending || updateOfferMutation.isPending}
                  data-testid="button-submit-offer"
                >
                  {createOfferMutation.isPending || updateOfferMutation.isPending
                    ? "Salvando..."
                    : editingOffer
                    ? "Atualizar Oferta"
                    : "Criar Oferta"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
