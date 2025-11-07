import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, BookOpen, GraduationCap } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertModalitySchema, insertCourseSchema } from "@shared/schema";

type ModalityFormData = z.infer<typeof insertModalitySchema>;
type CourseFormData = z.infer<typeof insertCourseSchema>;

export default function Offers() {
  const { toast } = useToast();
  const [isModalityModalOpen, setIsModalityModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingModality, setEditingModality] = useState<any>(null);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const { data: modalities, isLoading: modalitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/modalities"],
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<any[]>({
    queryKey: ["/api/courses"],
  });

  const modalityForm = useForm<ModalityFormData>({
    resolver: zodResolver(insertModalitySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const courseForm = useForm<CourseFormData>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      modalityId: "",
      name: "",
      description: "",
      about: "",
      targetAudience: "",
      offerDetails: "",
      price: "",
      duration: "",
      status: "active",
    },
  });

  // Modality mutations
  const createModalityMutation = useMutation({
    mutationFn: async (data: ModalityFormData) => apiRequest("/api/modalities", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modalities"] });
      toast({ title: "Modalidade criada!", description: "Modalidade criada com sucesso." });
      setIsModalityModalOpen(false);
      modalityForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar modalidade", description: error.message, variant: "destructive" });
    },
  });

  const updateModalityMutation = useMutation({
    mutationFn: async (data: ModalityFormData & { id: string }) => {
      const { id, ...modalityData } = data;
      return apiRequest(`/api/modalities/${id}`, "PATCH", modalityData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modalities"] });
      toast({ title: "Modalidade atualizada!", description: "Modalidade atualizada com sucesso." });
      setIsModalityModalOpen(false);
      setEditingModality(null);
      modalityForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar modalidade", description: error.message, variant: "destructive" });
    },
  });

  const deleteModalityMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/modalities/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modalities"] });
      toast({ title: "Modalidade deletada!", description: "Modalidade deletada com sucesso." });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao deletar modalidade", description: error.message, variant: "destructive" });
    },
  });

  // Course mutations
  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => apiRequest("/api/courses", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Curso criado!", description: "Curso criado com sucesso." });
      setIsCourseModalOpen(false);
      courseForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar curso", description: error.message, variant: "destructive" });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData & { id: string }) => {
      const { id, ...courseData } = data;
      return apiRequest(`/api/courses/${id}`, "PATCH", courseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Curso atualizado!", description: "Curso atualizado com sucesso." });
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      courseForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar curso", description: error.message, variant: "destructive" });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/courses/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Curso deletado!", description: "Curso deletado com sucesso." });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao deletar curso", description: error.message, variant: "destructive" });
    },
  });

  const handleOpenModalityModal = (modality?: any) => {
    if (modality) {
      setEditingModality(modality);
      modalityForm.reset({
        name: modality.name,
        description: modality.description || "",
      });
    } else {
      setEditingModality(null);
      modalityForm.reset();
    }
    setIsModalityModalOpen(true);
  };

  const handleOpenCourseModal = (course?: any) => {
    if (course) {
      setEditingCourse(course);
      courseForm.reset({
        modalityId: course.modality_id,
        name: course.name,
        description: course.description || "",
        about: course.about || "",
        targetAudience: course.target_audience || "",
        offerDetails: course.offer_details || "",
        price: course.price || "",
        duration: course.duration || "",
        status: course.status || "active",
      });
    } else {
      setEditingCourse(null);
      courseForm.reset();
    }
    setIsCourseModalOpen(true);
  };

  const handleModalitySubmit = (data: ModalityFormData) => {
    if (editingModality) {
      updateModalityMutation.mutate({ ...data, id: editingModality.id });
    } else {
      createModalityMutation.mutate(data);
    }
  };

  const handleCourseSubmit = (data: CourseFormData) => {
    if (editingCourse) {
      updateCourseMutation.mutate({ ...data, id: editingCourse.id });
    } else {
      createCourseMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Ofertas no Ar</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie modalidades e cursos disponíveis
        </p>
      </div>

      <Tabs defaultValue="modalities" className="space-y-6">
        <TabsList>
          <TabsTrigger value="modalities" data-testid="tab-modalities">
            <BookOpen className="h-4 w-4 mr-2" />
            Modalidades
          </TabsTrigger>
          <TabsTrigger value="courses" data-testid="tab-courses">
            <GraduationCap className="h-4 w-4 mr-2" />
            Cursos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modalities" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenModalityModal()} data-testid="button-new-modality">
              <Plus className="h-4 w-4 mr-2" />
              Nova Modalidade
            </Button>
          </div>

          {modalitiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : modalities?.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nenhuma modalidade criada"
              description="Crie modalidades para organizar seus cursos."
              actionLabel="Criar Primeira Modalidade"
              onAction={() => handleOpenModalityModal()}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modalities?.map((modality) => {
                const courseCount = courses?.filter(c => c.modality_id === modality.id).length || 0;
                return (
                  <Card key={modality.id} data-testid={`modality-card-${modality.id}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">{modality.name}</CardTitle>
                      {modality.description && (
                        <CardDescription>{modality.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {courseCount} {courseCount === 1 ? 'curso' : 'cursos'}
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleOpenModalityModal(modality)}
                          data-testid={`button-edit-modality-${modality.id}`}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => {
                            if (courseCount > 0) {
                              toast({
                                title: "Não é possível deletar",
                                description: "Esta modalidade possui cursos vinculados.",
                                variant: "destructive",
                              });
                            } else if (confirm("Tem certeza que deseja deletar esta modalidade?")) {
                              deleteModalityMutation.mutate(modality.id);
                            }
                          }}
                          data-testid={`button-delete-modality-${modality.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenCourseModal()} data-testid="button-new-course">
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Button>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-56 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : courses?.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Nenhum curso criado"
              description="Crie cursos para suas modalidades."
              actionLabel="Criar Primeiro Curso"
              onAction={() => handleOpenCourseModal()}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses?.map((course) => (
                <Card key={course.id} data-testid={`course-card-${course.id}`}>
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <Badge variant={course.status === "active" ? "default" : "outline"}>
                        {course.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <CardDescription>{course.modality?.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    {course.price && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Preço: </span>
                        <span className="font-semibold">R$ {parseFloat(course.price).toFixed(2)}</span>
                      </div>
                    )}
                    {course.duration && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Duração: </span>
                        <span className="font-medium">{course.duration}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenCourseModal(course)}
                        data-testid={`button-edit-course-${course.id}`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja deletar este curso?")) {
                            deleteCourseMutation.mutate(course.id);
                          }
                        }}
                        data-testid={`button-delete-course-${course.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modality Modal */}
      <Dialog open={isModalityModalOpen} onOpenChange={setIsModalityModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingModality ? "Editar Modalidade" : "Nova Modalidade"}
            </DialogTitle>
            <DialogDescription>
              {editingModality
                ? "Atualize as informações da modalidade"
                : "Crie uma nova modalidade para seus cursos"}
            </DialogDescription>
          </DialogHeader>

          <Form {...modalityForm}>
            <form onSubmit={modalityForm.handleSubmit(handleModalitySubmit)} className="space-y-4">
              <FormField
                control={modalityForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: MBA, Graduação, CHCS"
                        {...field}
                        data-testid="input-modality-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={modalityForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a modalidade..."
                        {...field}
                        data-testid="input-modality-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalityModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createModalityMutation.isPending || updateModalityMutation.isPending}
                  data-testid="button-submit-modality"
                >
                  {createModalityMutation.isPending || updateModalityMutation.isPending
                    ? "Salvando..."
                    : editingModality
                    ? "Atualizar"
                    : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Course Modal */}
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Editar Curso" : "Novo Curso"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? "Atualize as informações do curso"
                : "Crie um novo curso para uma modalidade"}
            </DialogDescription>
          </DialogHeader>

          <Form {...courseForm}>
            <form onSubmit={courseForm.handleSubmit(handleCourseSubmit)} className="space-y-4">
              <FormField
                control={courseForm.control}
                name="modalityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidade</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger data-testid="select-modality">
                          <SelectValue placeholder="Selecione uma modalidade" />
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
                control={courseForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Curso</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Gestão de Seguros 2026.1"
                        {...field}
                        data-testid="input-course-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={courseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Curta (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Resumo do curso..."
                        {...field}
                        data-testid="input-course-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={courseForm.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobre o Curso (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações detalhadas sobre o curso..."
                        {...field}
                        data-testid="input-course-about"
                      />
                    </FormControl>
                    <FormDescription>
                      Informações completas sobre o curso
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={courseForm.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Público-Alvo (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Profissionais de seguros"
                          {...field}
                          data-testid="input-course-target-audience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={courseForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 12 meses"
                          {...field}
                          data-testid="input-course-duration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={courseForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 15000.00"
                          {...field}
                          data-testid="input-course-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={courseForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-course-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={courseForm.control}
                name="offerDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalhes da Oferta (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações sobre inscrições, valores promocionais, etc..."
                        {...field}
                        data-testid="input-course-offer-details"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCourseModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
                  data-testid="button-submit-course"
                >
                  {createCourseMutation.isPending || updateCourseMutation.isPending
                    ? "Salvando..."
                    : editingCourse
                    ? "Atualizar"
                    : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
