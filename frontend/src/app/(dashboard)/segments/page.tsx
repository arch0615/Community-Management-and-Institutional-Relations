"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Users, Zap, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import type { Segment, PaginatedResponse } from "@/lib/types";

export default function SegmentsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: "",
    description: "",
    filters: { gender: "", status: "", location: "" },
  });

  const { data, isLoading } = useQuery<PaginatedResponse<Segment>>({
    queryKey: ["segments"],
    queryFn: async () => {
      const { data } = await api.get("/segments");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (segmentData: typeof newSegment) => {
      const filters = Object.fromEntries(
        Object.entries(segmentData.filters).filter(([_, v]) => v !== "")
      );
      const { data } = await api.post("/segments", {
        name: segmentData.name,
        description: segmentData.description,
        filters,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      toast.success("Segmento creado");
      setShowCreate(false);
      setNewSegment({ name: "", description: "", filters: { gender: "", status: "", location: "" } });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al crear segmento");
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/segments/${id}/apply`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      toast.success(`Segmento aplicado: ${data.matched} contactos coincidentes`);
    },
    onError: () => {
      toast.error("Error al aplicar filtros del segmento");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/segments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      toast.success("Segmento eliminado");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Segmentos</h1>
          <p className="text-muted-foreground">Crea y gestiona segmentos de audiencia</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Segmento
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Segmento</CardTitle>
            <CardDescription>Define filtros para segmentar tu audiencia</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate(newSegment); }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Nombre del segmento *"
                  value={newSegment.name}
                  onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Descripción"
                  value={newSegment.description}
                  onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                />
              </div>
              <p className="text-sm font-medium">Filtros</p>
              <div className="grid gap-4 md:grid-cols-3">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newSegment.filters.gender}
                  onChange={(e) => setNewSegment({
                    ...newSegment,
                    filters: { ...newSegment.filters, gender: e.target.value },
                  })}
                >
                  <option value="">Cualquier género</option>
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Femenino</option>
                  <option value="NON_BINARY">No Binario</option>
                  <option value="OTHER">Otro</option>
                </select>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newSegment.filters.status}
                  onChange={(e) => setNewSegment({
                    ...newSegment,
                    filters: { ...newSegment.filters, status: e.target.value },
                  })}
                >
                  <option value="">Cualquier estado</option>
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="ARCHIVED">Archivado</option>
                </select>
                <Input
                  placeholder="Filtro de ubicación"
                  value={newSegment.filters.location}
                  onChange={(e) => setNewSegment({
                    ...newSegment,
                    filters: { ...newSegment.filters, location: e.target.value },
                  })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creando..." : "Crear Segmento"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.data?.map((segment) => (
            <Card key={segment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{segment.name}</CardTitle>
                  <Badge variant={segment.isActive ? "default" : "secondary"}>
                    {segment.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                {segment.description && (
                  <CardDescription>{segment.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {segment._count?.contacts || 0} contactos
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(segment.filters as Record<string, any>).map(([key, value]) =>
                    value ? (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {String(value)}
                      </Badge>
                    ) : null
                  )}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyMutation.mutate(segment.id)}
                  disabled={applyMutation.isPending}
                >
                  <Zap className="mr-1 h-3 w-3" />
                  Aplicar Filtros
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm("¿Eliminar este segmento?")) deleteMutation.mutate(segment.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          {(!data?.data || data.data.length === 0) && (
            <Card className="md:col-span-3">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aún no hay segmentos. Crea uno para comenzar.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
