"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft, Save, Send, Clock, Users, MessageSquare,
  CheckCircle2, FileEdit, XCircle, Loader2, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import type { Campaign, Segment, PaginatedResponse } from "@/lib/types";

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Borrador", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  SCHEDULED: { label: "Programada", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  SENDING: { label: "Enviando", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  SENT: { label: "Enviada", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const channelLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  FACEBOOK_MESSENGER: "Facebook Messenger",
  EMAIL: "Email",
  SMS: "SMS",
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: campaign, isLoading } = useQuery<Campaign & { segment?: any }>({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data } = await api.get(`/campaigns/${id}`);
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

  const [form, setForm] = useState({
    name: "",
    description: "",
    channel: "",
    segmentId: "",
    message: "",
    scheduledAt: "",
  });

  const isEditable = campaign?.status === "DRAFT" || campaign?.status === "SCHEDULED";

  useEffect(() => {
    if (campaign) {
      setForm({
        name: campaign.name,
        description: campaign.description || "",
        channel: campaign.channel || "",
        segmentId: campaign.segmentId || "",
        message: (campaign.content as any)?.message || "",
        scheduledAt: campaign.scheduledAt
          ? new Date(campaign.scheduledAt).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [campaign]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload: any = {
        name: data.name,
        description: data.description || undefined,
        channel: data.channel || undefined,
        segmentId: data.segmentId || undefined,
        content: data.message ? { message: data.message } : undefined,
        scheduledAt: data.scheduledAt || undefined,
      };
      const { data: result } = await api.put(`/campaigns/${id}`, payload);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaña actualizada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al actualizar");
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/campaigns/${id}/send`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(`Campaña enviada: ${data.sent} mensajes enviados`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al enviar");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.put(`/campaigns/${id}`, { status: "CANCELLED" });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaña cancelada");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!campaign) return <p>Campaña no encontrada</p>;

  const status = statusConfig[campaign.status] || statusConfig.DRAFT;
  const recipientCount = campaign.segment?._count?.contacts || campaign.segment?.contacts?.length || 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-muted-foreground">{campaign.description || "Sin descripción"}</p>
        </div>
        <div className="flex gap-2">
          {isEditable && (
            <Button
              onClick={() => {
                if (confirm("¿Enviar esta campaña ahora?")) sendMutation.mutate();
              }}
              disabled={sendMutation.isPending || !campaign.channel}
            >
              <Send className="mr-2 h-4 w-4" />
              {sendMutation.isPending ? "Enviando..." : "Enviar Ahora"}
            </Button>
          )}
          {(campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("¿Cancelar esta campaña?")) cancelMutation.mutate();
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Canal</p>
              <p className="text-lg font-semibold">
                {campaign.channel ? channelLabels[campaign.channel] || campaign.channel : "No definido"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Destinatarios</p>
              <p className="text-lg font-semibold">
                {campaign.segment ? `${recipientCount} contactos` : "Sin segmento"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                {campaign.sentAt ? "Enviada" : campaign.scheduledAt ? "Programada" : "Estado"}
              </p>
              <p className="text-lg font-semibold">
                {campaign.sentAt
                  ? new Date(campaign.sentAt).toLocaleString("es-CL")
                  : campaign.scheduledAt
                    ? new Date(campaign.scheduledAt).toLocaleString("es-CL")
                    : status.label}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Contenido del Mensaje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(campaign.content as any)?.message ? (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm whitespace-pre-wrap">{(campaign.content as any).message}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin contenido de mensaje definido</p>
          )}
        </CardContent>
      </Card>

      {/* Recipients List */}
      {campaign.segment?.contacts && campaign.segment.contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Destinatarios — {campaign.segment.name}
            </CardTitle>
            <CardDescription>{campaign.segment.contacts.length} contactos en este segmento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {campaign.segment.contacts.slice(0, 12).map((sc: any) => (
                <div key={sc.contact.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {sc.contact.firstName?.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="font-medium truncate">{sc.contact.firstName} {sc.contact.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{sc.contact.email || sc.contact.phone || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
            {campaign.segment.contacts.length > 12 && (
              <p className="text-sm text-muted-foreground text-center mt-3">
                y {campaign.segment.contacts.length - 12} más...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {isEditable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileEdit className="h-4 w-4" />
              Editar Campaña
            </CardTitle>
            <CardDescription>Modifica los detalles antes de enviar</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Canal</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
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
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Segmento</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.segmentId}
                    onChange={(e) => setForm({ ...form, segmentId: e.target.value })}
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
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje</label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px] resize-y"
                  placeholder="Escribe el contenido del mensaje..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
