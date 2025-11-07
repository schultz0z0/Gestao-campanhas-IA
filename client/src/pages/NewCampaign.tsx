import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const campaignSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  modalityId: z.string().min(1, "Selecione uma modalidade"),
  courseId: z.string().min(1, "Selecione um curso"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de término é obrigatória"),
  leadsGoal: z.coerce.number().min(1, "Meta de leads deve ser no mínimo 1").optional(),
  budget: z.string().optional(),
  messaging: z.string().optional(),
  status: z.enum(["draft", "active", "scheduled", "completed"]).default("draft"),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const steps = [
  { id: 1, title: "Informações Básicas", description: "Nome e curso da campanha" },
  { id: 2, title: "Período e Metas", description: "Datas e objetivos" },
  { id: 3, title: "Mensagem e Orçamento", description: "Detalhes finais" },
];

export default function NewCampaign() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch modalities
  const { data: modalities } = useQuery<any[]>({
    queryKey: ["/api/modalities"],
  });

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      modalityId: "",
      courseId: "",
      startDate: "",
      endDate: "",
      status: "draft",
    },
  });

  // Fetch courses based on selected modality (watch form field)
  const selectedModalityId = form.watch("modalityId");
  const { data: courses } = useQuery<any[]>({
    queryKey: ["/api/courses", selectedModalityId],
    enabled: !!selectedModalityId,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      return apiRequest("/api/campaigns", "POST", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campanha criada!",
        description: "Sua campanha foi criada com sucesso.",
      });
      navigate(`/campaigns/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data);
  };

  const nextStep = async () => {
    const fields = getStepFields(currentStep);
    const isValid = await form.trigger(fields);

    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const getStepFields = (step: number): any[] => {
    switch (step) {
      case 1:
        return ["name", "modalityId", "courseId"];
      case 2:
        return ["startDate", "endDate", "leadsGoal"];
      case 3:
        return ["budget", "messaging"];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/campaigns")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">Nova Campanha</h1>
          <p className="text-muted-foreground mt-1">
            Crie uma nova campanha de marketing com IA
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-background"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Campanha</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Campanha de Verão 2025"
                            {...field}
                            data-testid="input-campaign-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modalityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modalidade</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("courseId", "", { shouldValidate: true });
                            }}
                          >
                            <SelectTrigger data-testid="select-modality">
                              <SelectValue placeholder="Selecione a modalidade" />
                            </SelectTrigger>
                            <SelectContent>
                              {modalities?.map((modality) => (
                                <SelectItem key={modality.id} value={modality.id}>
                                  {modality.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Curso</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!selectedModalityId}
                          >
                            <SelectTrigger data-testid="select-course">
                              <SelectValue placeholder="Selecione o curso" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses?.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 2: Dates & Goals */}
              {currentStep === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-start-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Término</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-end-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="leadsGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta de Leads</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 500"
                            {...field}
                            data-testid="input-leads-goal"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 3: Message & Budget */}
              {currentStep === 3 && (
                <>
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Orçamento (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: R$ 10.000"
                            {...field}
                            data-testid="input-budget"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="messaging"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem da Campanha (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva a mensagem principal da campanha..."
                            className="min-h-32"
                            {...field}
                            data-testid="input-messaging"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 1}
          data-testid="button-previous"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          onClick={nextStep}
          disabled={createCampaignMutation.isPending}
          data-testid="button-next"
        >
          {currentStep === 3 ? (
            createCampaignMutation.isPending ? (
              "Criando..."
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Criar Campanha
              </>
            )
          ) : (
            <>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
