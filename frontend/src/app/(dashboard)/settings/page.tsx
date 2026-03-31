"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import {
  Settings, Globe, Key, Users, Plus, Trash2, Power, PowerOff,
  MessageSquare, Wifi, WifiOff, TestTube, Eye, EyeOff, Save,
  User, Shield, ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";

const channelTypeConfig: Record<string, { label: string; color: string; fields: { key: string; label: string; placeholder: string }[] }> = {
  WHATSAPP: {
    label: "WhatsApp Business",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    fields: [
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "Ej: 123456789012345" },
      { key: "accessToken", label: "Access Token", placeholder: "Token de acceso permanente" },
      { key: "businessAccountId", label: "Business Account ID (opcional)", placeholder: "Ej: 123456789012345" },
    ],
  },
  INSTAGRAM: {
    label: "Instagram",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    fields: [
      { key: "pageAccessToken", label: "Page Access Token", placeholder: "Token de acceso de la página vinculada" },
      { key: "igUserId", label: "Instagram User ID", placeholder: "Ej: 17841400123456789" },
    ],
  },
  FACEBOOK_MESSENGER: {
    label: "Facebook Messenger",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    fields: [
      { key: "pageAccessToken", label: "Page Access Token", placeholder: "Token de acceso de la página" },
      { key: "pageId", label: "Page ID", placeholder: "Ej: 123456789012345" },
    ],
  },
  EMAIL: {
    label: "Email",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    fields: [
      { key: "smtpHost", label: "SMTP Host", placeholder: "Ej: smtp.gmail.com" },
      { key: "smtpPort", label: "SMTP Port", placeholder: "Ej: 587" },
      { key: "smtpUser", label: "SMTP Usuario", placeholder: "tu@correo.com" },
      { key: "smtpPass", label: "SMTP Contraseña", placeholder: "Contraseña de app" },
    ],
  },
  SMS: {
    label: "SMS",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "API key del proveedor SMS" },
      { key: "senderId", label: "Sender ID", placeholder: "Nombre o número remitente" },
    ],
  },
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  MANAGER: "Gestor",
  MEMBER: "Miembro",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  // ─── Channels ─────────────────────────────────────────────
  const { data: channels, isLoading: loadingChannels } = useQuery<any[]>({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data } = await api.get("/meta/channels");
      return data;
    },
  });

  // ─── Create Channel ───────────────────────────────────────
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannel, setNewChannel] = useState({ type: "", name: "", credentials: {} as Record<string, string> });
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});

  const createChannelMutation = useMutation({
    mutationFn: async (channelData: typeof newChannel) => {
      const { data } = await api.post("/meta/channels", {
        type: channelData.type,
        name: channelData.name,
        credentials: channelData.credentials,
        isActive: true,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal creado exitosamente");
      setShowAddChannel(false);
      setNewChannel({ type: "", name: "", credentials: {} });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al crear canal");
    },
  });

  const toggleChannelMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await api.put(`/meta/channels/${id}`, { isActive });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success(`Canal ${data.isActive ? "activado" : "desactivado"}`);
    },
  });

  const updateChannelCredsMutation = useMutation({
    mutationFn: async ({ id, credentials }: { id: string; credentials: any }) => {
      const { data } = await api.put(`/meta/channels/${id}`, { credentials });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Credenciales actualizadas");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al actualizar");
    },
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/meta/channels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal eliminado");
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async ({ type, credentials }: { type: string; credentials: any }) => {
      const { data } = await api.post("/meta/test-connection", { type, credentials });
      return data;
    },
    onSuccess: () => {
      toast.success("Conexión exitosa");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error de conexión");
    },
  });

  // ─── Edit Channel Credentials ─────────────────────────────
  const [editingChannel, setEditingChannel] = useState<string | null>(null);
  const [editCredentials, setEditCredentials] = useState<Record<string, string>>({});

  const startEditChannel = (channel: any) => {
    setEditingChannel(channel.id);
    setEditCredentials(channel.credentials || {});
  };

  const selectedTypeConfig = newChannel.type ? channelTypeConfig[newChannel.type] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu cuenta, integraciones y canales</p>
      </div>

      {/* Profile & Org Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {roleLabels[user?.role || ""] || user?.role}
              </Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-3 w-3" />
                Editar Perfil
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Organización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Nombre</p>
              <p className="text-sm text-muted-foreground">{user?.organization?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Slug</p>
              <p className="text-sm text-muted-foreground">{user?.organization?.slug}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meta Integration Guide */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Guía de Integración Meta
            </CardTitle>
            <CardDescription>Pasos para conectar WhatsApp, Instagram y Facebook Messenger</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold text-sm">1</div>
                <h4 className="font-medium text-sm">Crear App en Meta</h4>
                <p className="text-xs text-muted-foreground">
                  Ve a Meta for Developers, crea una app de tipo Business y configura los productos necesarios (WhatsApp, Messenger, Instagram).
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold text-sm">2</div>
                <h4 className="font-medium text-sm">Obtener Credenciales</h4>
                <p className="text-xs text-muted-foreground">
                  Copia el Phone Number ID, Access Token (WhatsApp) o Page Access Token (Instagram/Messenger) desde el panel de tu app.
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold text-sm">3</div>
                <h4 className="font-medium text-sm">Configurar Canal</h4>
                <p className="text-xs text-muted-foreground">
                  Agrega un canal abajo, ingresa las credenciales y usa "Probar Conexión" para verificar. Configura el webhook URL en Meta.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Webhook URL:</span>{" "}
                <code className="rounded bg-background px-1.5 py-0.5 text-xs">
                  {typeof window !== "undefined" ? window.location.origin.replace(":3000", ":4000") : "https://tu-dominio.com"}/api/meta/webhook
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Channels Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Canales de Integración
              </CardTitle>
              <CardDescription>Canales de comunicación configurados</CardDescription>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowAddChannel(!showAddChannel)}>
                <Plus className="mr-2 h-3 w-3" />
                Agregar Canal
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Channel Form */}
          {showAddChannel && isAdmin && (
            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-medium text-sm">Nuevo Canal</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Canal</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newChannel.type}
                    onChange={(e) => setNewChannel({ ...newChannel, type: e.target.value, credentials: {} })}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="WHATSAPP">WhatsApp Business</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="FACEBOOK_MESSENGER">Facebook Messenger</option>
                    <option value="EMAIL">Email (SMTP)</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre del Canal</label>
                  <Input
                    placeholder="Ej: WhatsApp Principal"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                  />
                </div>
              </div>

              {selectedTypeConfig && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Credenciales — {selectedTypeConfig.label}</p>
                  {selectedTypeConfig.fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                      <div className="relative">
                        <Input
                          type={showCredentials[field.key] ? "text" : "password"}
                          placeholder={field.placeholder}
                          value={newChannel.credentials[field.key] || ""}
                          onChange={(e) => setNewChannel({
                            ...newChannel,
                            credentials: { ...newChannel.credentials, [field.key]: e.target.value },
                          })}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCredentials({ ...showCredentials, [field.key]: !showCredentials[field.key] })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCredentials[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {selectedTypeConfig && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnectionMutation.mutate({
                      type: newChannel.type,
                      credentials: newChannel.credentials,
                    })}
                    disabled={testConnectionMutation.isPending}
                  >
                    <TestTube className="mr-1 h-3 w-3" />
                    {testConnectionMutation.isPending ? "Probando..." : "Probar Conexión"}
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => createChannelMutation.mutate(newChannel)}
                  disabled={!newChannel.type || !newChannel.name || createChannelMutation.isPending}
                >
                  <Save className="mr-1 h-3 w-3" />
                  {createChannelMutation.isPending ? "Guardando..." : "Guardar Canal"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddChannel(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Channel List */}
          {loadingChannels ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : !channels || channels.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No hay canales configurados.{isAdmin ? " Agrega uno para empezar." : ""}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {channels.map((channel: any) => {
                const typeConfig = channelTypeConfig[channel.type];
                const isEditing = editingChannel === channel.id;

                return (
                  <div key={channel.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${typeConfig?.color || "bg-gray-100 text-gray-700"}`}>
                          {channel.isActive ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                          {typeConfig?.label || channel.type}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{channel.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {channel._count?.messages || 0} mensajes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={channel.isActive ? "default" : "secondary"}>
                          {channel.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleChannelMutation.mutate({
                                id: channel.id,
                                isActive: !channel.isActive,
                              })}
                              title={channel.isActive ? "Desactivar" : "Activar"}
                            >
                              {channel.isActive ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => isEditing ? setEditingChannel(null) : startEditChannel(channel)}
                            >
                              <Key className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => {
                                if (confirm("¿Eliminar este canal?")) deleteChannelMutation.mutate(channel.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Edit Credentials */}
                    {isEditing && isAdmin && typeConfig && (
                      <div className="border-t pt-3 space-y-3">
                        <p className="text-sm font-medium">Editar Credenciales</p>
                        {typeConfig.fields.map((field) => (
                          <div key={field.key} className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                            <div className="relative">
                              <Input
                                type={showCredentials[`edit_${field.key}`] ? "text" : "password"}
                                placeholder={field.placeholder}
                                value={editCredentials[field.key] || ""}
                                onChange={(e) => setEditCredentials({
                                  ...editCredentials,
                                  [field.key]: e.target.value,
                                })}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCredentials({
                                  ...showCredentials,
                                  [`edit_${field.key}`]: !showCredentials[`edit_${field.key}`],
                                })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showCredentials[`edit_${field.key}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnectionMutation.mutate({
                              type: channel.type,
                              credentials: editCredentials,
                            })}
                            disabled={testConnectionMutation.isPending}
                          >
                            <TestTube className="mr-1 h-3 w-3" />
                            {testConnectionMutation.isPending ? "Probando..." : "Probar Conexión"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              updateChannelCredsMutation.mutate({ id: channel.id, credentials: editCredentials });
                              setEditingChannel(null);
                            }}
                            disabled={updateChannelCredsMutation.isPending}
                          >
                            <Save className="mr-1 h-3 w-3" />
                            Guardar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingChannel(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
