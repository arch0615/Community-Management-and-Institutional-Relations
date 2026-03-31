"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import {
  Plus, Search, Send, Clock, FileEdit, Trash2, Copy, Eye,
  Megaphone, BarChart3, CheckCircle2, XCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import type { Campaign, PaginatedResponse, Segment } from "@/lib/types";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  DRAFT: { label: "Borrador", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: FileEdit },
  SCHEDULED: { label: "Programada", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  SENDING: { label: "Enviando", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Loader2 },
  SENT: { label: "Enviada", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

const channelLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  FACEBOOK_MESSENGER: "Messenger",
  EMAIL: "Email",
  SMS: "SMS",
};

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    channel: "",
    segmentId: "",
    message: "",
    scheduledAt: "",
  });

  const { data, isLoading } = useQuery<PaginatedResponse<Campaign>>({
    queryKey: ["campaigns", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get(`/campaigns?${params}`);
      return data;
    },
  });

  const { data: segments } = useQuery<PaginatedResponse<Segment>>({
    queryKey: ["segments-for-campaigns"],
    queryFn: async () => {
      const { data } = await api.get("/segments?limit=100");
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["campaign-stats"],
    queryFn: async () => {
      const { data } = await api.get("/campaigns/stats");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (campaignData: typeof newCampaign) => {
      const payload: any = {
        name: campaignData.name,
        description: campaignData.description || undefined,
        channel: campaignData.channel || undefined,
        segmentId: campaignData.segmentId || undefined,
        content: campaignData.message ? { message: campaignData.message } : undefined,
        scheduledAt: campaignData.scheduledAt || undefined,
      };
      const { data } = await api.post("/campaigns", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campaña creada exitosamente");
      setShowCreate(false);
      setNewCampaign({ name: "", description: "", channel: "", segmentId: "", message: "", scheduledAt: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al crear campaña");
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/campaigns/${id}/send`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success(`Campaña enviada: ${data.sent} mensajes enviados`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al enviar campaña");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/campaigns/${id}/duplicate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaña duplicada");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campaña eliminada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al eliminar campaña");
    },
  });

  const statCards = [
    { label: "Total", value: stats?.total || 0, icon: Megaphone },
    { label: "Borradores", value: stats?.byStatus?.find((s: any) => s.status === "DRAFT")?._count || 0, icon: FileEdit },
    { label: "Programadas", value: stats?.byStatus?.find((s: any) => s.status === "SCHEDULED")?._count || 0, icon: Clock },
    { label: "Enviadas", value: stats?.byStatus?.find((s: any) => s.status === "SENT")?._count || 0, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campañas</h1>
          <p className="text-muted-foreground">Crea, programa y envía campañas a tus segmentos</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Campaña
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Campaña</CardTitle>
            <CardDescription>Configura los detalles de tu campaña</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate(newCampaign); }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    placeholder="Ej: Campaña de bienvenida"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Canal</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newCampaign.channel}
                    onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
                  >
                    <option value="">Seleccionar canal</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="FACEBOOK_MESSENGER">Facebook Messenger</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Input
                  placeholder="Breve descripción de la campaña"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Segmento de audiencia</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newCampaign.segmentId}
                    onChange={(e) => setNewCampaign({ ...newCampaign, segmentId: e.target.value })}
                  >
                    <option value="">Sin segmento</option>
                    {segments?.data?.map((seg) => (
                      <option key={seg.id} value={seg.id}>
                        {seg.name} ({seg._count?.contacts || 0} contactos)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Programar envío</label>
                  <Input
                    type="datetime-local"
                    value={newCampaign.scheduledAt}
                    onChange={(e) => setNewCampaign({ ...newCampaign, scheduledAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje</label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] resize-y"
                  placeholder="Escribe el contenido del mensaje..."
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creando..." : "Crear Campaña"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar campañas..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="SCHEDULED">Programada</option>
          <option value="SENDING">Enviando</option>
          <option value="SENT">Enviada</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : data?.data?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay campañas. Crea una para comenzar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.data?.map((campaign) => {
            const status = statusConfig[campaign.status] || statusConfig.DRAFT;
            const StatusIcon = status.icon;
            return (
              <Card key={campaign.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">{campaign.name}</CardTitle>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${status.color}`}>
                      <StatusIcon className={`h-3 w-3 ${campaign.status === "SENDING" ? "animate-spin" : ""}`} />
                      {status.label}
                    </span>
                  </div>
                  {campaign.description && (
                    <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {campaign.channel && (
                    <div className="flex items-center gap-2 text-sm">
                      <Send className="h-3 w-3 text-muted-foreground" />
                      <span>{channelLabels[campaign.channel] || campaign.channel}</span>
                    </div>
                  )}
                  {campaign.segment && (
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-3 w-3 text-muted-foreground" />
                      <span>{campaign.segment.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {campaign.segment._count?.contacts || 0} contactos
                      </Badge>
                    </div>
                  )}
                  {campaign.scheduledAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Programada: {new Date(campaign.scheduledAt).toLocaleString("es-CL")}
                    </div>
                  )}
                  {campaign.sentAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Enviada: {new Date(campaign.sentAt).toLocaleString("es-CL")}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Creada: {new Date(campaign.createdAt).toLocaleDateString("es-CL")}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-3 w-3" />
                      Ver
                    </Button>
                  </Link>
                  {(campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (confirm("¿Enviar esta campaña ahora?")) {
                          sendMutation.mutate(campaign.id);
                        }
                      }}
                      disabled={sendMutation.isPending || !campaign.channel}
                    >
                      <Send className="mr-1 h-3 w-3" />
                      Enviar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicateMutation.mutate(campaign.id)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {campaign.status !== "SENDING" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("¿Eliminar esta campaña?")) {
                          deleteMutation.mutate(campaign.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
