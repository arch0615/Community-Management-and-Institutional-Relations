"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, MessageSquare, Tag, Edit2,
  Plus, X, Shield, Globe, Instagram, Facebook, Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import type { Contact } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activo", color: "bg-green-100 text-green-800" },
  { value: "INACTIVE", label: "Inactivo", color: "bg-gray-100 text-gray-800" },
  { value: "ARCHIVED", label: "Archivado", color: "bg-yellow-100 text-yellow-800" },
  { value: "BLOCKED", label: "Bloqueado", color: "bg-red-100 text-red-800" },
];

const GENDER_MAP: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
  NON_BINARY: "No Binario",
  OTHER: "Otro",
  PREFER_NOT_TO_SAY: "Prefiere no decir",
};

export default function ContactDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});

  const { data: contact, isLoading } = useQuery<Contact & {
    interactions: any[];
    messages: any[];
    segments: any[];
  }>({
    queryKey: ["contact", id],
    queryFn: async () => {
      const { data } = await api.get(`/contacts/${id}`);
      return data;
    },
  });

  const { data: availableTags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await api.get("/segments/tags");
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const { data: result } = await api.patch(`/contacts/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", id] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contacto actualizado");
      setShowStatusMenu(false);
      setShowEditForm(false);
    },
    onError: () => toast.error("Error al actualizar contacto"),
  });

  const addTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      await api.post(`/contacts/${id}/tags`, { tagId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", id] });
      toast.success("Etiqueta agregada");
    },
    onError: () => toast.error("Error al agregar etiqueta"),
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      await api.delete(`/contacts/${id}/tags/${tagId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", id] });
      toast.success("Etiqueta removida");
    },
    onError: () => toast.error("Error al remover etiqueta"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!contact) return <p>Contacto no encontrado</p>;

  const contactTagIds = new Set(contact.tags?.map((ct: any) => ct.tag.id) || []);
  const unassignedTags = (availableTags || []).filter((t: any) => !contactTagIds.has(t.id));
  const metadata = contact.metadata as Record<string, any> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contacts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {contact.firstName} {contact.lastName}
            </h1>
            <p className="text-muted-foreground">Detalles del contacto e historial de interacciones</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => {
          setEditData({
            firstName: contact.firstName || "",
            lastName: contact.lastName || "",
            email: contact.email || "",
            phone: contact.phone || "",
            location: contact.location || "",
          });
          setShowEditForm(!showEditForm);
        }}>
          <Edit2 className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Edit Form */}
      {showEditForm && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate(editData);
              }}
              className="grid gap-4 md:grid-cols-3"
            >
              <Input
                placeholder="Nombre"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
              />
              <Input
                placeholder="Apellido"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
              <Input
                placeholder="Teléfono"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
              <Input
                placeholder="Ubicación"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              />
              <div className="flex gap-2 items-center">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Información del Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {contact.firstName.charAt(0)}{contact.lastName?.charAt(0) || ""}
            </div>

            {contact.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {contact.email}
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {contact.phone}
              </div>
            )}
            {contact.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {contact.location}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Agregado el {new Date(contact.createdAt).toLocaleDateString("es-CL")}
            </div>

            {/* Status with change */}
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Estado</p>
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium cursor-pointer ${
                    STATUS_OPTIONS.find((s) => s.value === contact.status)?.color || ""
                  }`}
                >
                  {STATUS_OPTIONS.find((s) => s.value === contact.status)?.label || contact.status}
                  <Edit2 className="h-3 w-3 ml-1 opacity-50" />
                </button>
                {showStatusMenu && (
                  <div className="absolute z-10 mt-1 bg-background border rounded-md shadow-lg p-1 min-w-[140px]">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-muted ${
                          opt.value === contact.status ? "font-bold" : ""
                        }`}
                        onClick={() => updateMutation.mutate({ status: opt.value })}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {contact.gender && (
              <div>
                <p className="text-sm font-medium mb-1">Género</p>
                <p className="text-sm text-muted-foreground">{GENDER_MAP[contact.gender] || contact.gender}</p>
              </div>
            )}

            {contact.source && (
              <div>
                <p className="text-sm font-medium mb-1">Fuente</p>
                <p className="text-sm text-muted-foreground">{contact.source}</p>
              </div>
            )}

            {/* Tags with add/remove */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                <Tag className="h-3 w-3" /> Etiquetas
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {contact.tags?.map((ct: any) => (
                  <Badge key={ct.tag.id} variant="outline" style={{ borderColor: ct.tag.color }} className="flex items-center gap-1">
                    {ct.tag.name}
                    <button
                      onClick={() => removeTagMutation.mutate(ct.tag.id)}
                      className="ml-0.5 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(!contact.tags || contact.tags.length === 0) && (
                  <span className="text-xs text-muted-foreground">Sin etiquetas</span>
                )}
              </div>
              <button
                onClick={() => setShowTagInput(!showTagInput)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Agregar etiqueta
              </button>
              {showTagInput && unassignedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {unassignedTags.map((tag: any) => (
                    <button
                      key={tag.id}
                      onClick={() => addTagMutation.mutate(tag.id)}
                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs hover:bg-muted"
                      style={{ borderColor: tag.color }}
                    >
                      + {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interests */}
            {contact.interests && contact.interests.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Intereses</p>
                <div className="flex flex-wrap gap-1">
                  {contact.interests.map((ci: any) => (
                    <Badge key={ci.interest.id} variant="secondary">
                      {ci.interest.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media from metadata */}
            {metadata && (metadata.instagram || metadata.twitter || metadata.facebook) && (
              <div>
                <p className="text-sm font-medium mb-2">Redes Sociales</p>
                <div className="space-y-1">
                  {metadata.instagram && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Instagram className="h-3 w-3" /> {metadata.instagram}
                    </div>
                  )}
                  {metadata.twitter && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Twitter className="h-3 w-3" /> {metadata.twitter}
                    </div>
                  )}
                  {metadata.facebook && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Facebook className="h-3 w-3" /> {metadata.facebook}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Events attended from metadata */}
            {metadata?.events && metadata.events.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Eventos Asistidos</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {metadata.events.map((event: string, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      • {event}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Segments */}
            {contact.segments && contact.segments.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Segmentos
                </p>
                <div className="flex flex-wrap gap-1">
                  {contact.segments.map((sc: any) => (
                    <Badge key={sc.segment.id} variant="outline">
                      {sc.segment.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interactions & Messages */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interacciones Recientes</CardTitle>
              <CardDescription>Historial de interacciones más reciente</CardDescription>
            </CardHeader>
            <CardContent>
              {contact.interactions?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aún no hay interacciones</p>
              ) : (
                <div className="space-y-4">
                  {contact.interactions?.map((interaction: any) => (
                    <div key={interaction.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{interaction.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(interaction.date).toLocaleString("es-CL")}
                          </span>
                        </div>
                        {interaction.subject && (
                          <p className="text-sm font-medium mt-1">{interaction.subject}</p>
                        )}
                        {interaction.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{interaction.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mensajes</CardTitle>
              <CardDescription>Historial de mensajes recientes</CardDescription>
            </CardHeader>
            <CardContent>
              {contact.messages?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aún no hay mensajes</p>
              ) : (
                <div className="space-y-3">
                  {contact.messages?.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.direction === "OUTBOUND"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] h-4">
                            {message.channel}
                          </Badge>
                          <span className="text-[10px] opacity-70">
                            {new Date(message.sentAt).toLocaleString("es-CL")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
