"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, Users, UserCheck, UserX, Filter, Tag, MapPin, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#06b6d4"];
const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: "#1e3a5f", border: "1px solid #2d4a6f", borderRadius: "8px", color: "#f1f5f9" },
  labelStyle: { color: "#f1f5f9" },
  itemStyle: { color: "#e2e8f0" },
};

export default function ReportsPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/reports/dashboard");
      return data;
    },
  });

  const { data: engagement } = useQuery({
    queryKey: ["engagement-report"],
    queryFn: async () => {
      const { data } = await api.get("/reports/engagement");
      return data;
    },
  });

  const handleExportReport = async () => {
    try {
      const response = await api.get("/contacts/export", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_contactos_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // fallback: export dashboard data as JSON
      const blob = new Blob([JSON.stringify(dashboard, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_dashboard_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">Reportes ejecutivos y analítica</p>
        </div>
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total Contactos", value: dashboard?.overview?.totalContacts || 0, icon: Users },
          { label: "Activos", value: dashboard?.overview?.activeContacts || 0, icon: UserCheck },
          { label: "Inactivos", value: dashboard?.overview?.inactiveContacts || 0, icon: UserX },
          { label: "Segmentos", value: dashboard?.overview?.totalSegments || 0, icon: Filter },
          { label: "Etiquetas", value: dashboard?.overview?.totalTags || 0, icon: Tag },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth + Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Contactos</CardTitle>
            <CardDescription>Crecimiento acumulado por trimestre</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard?.contactGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip {...TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="cumulative" stroke="#3b82f6" strokeWidth={2} name="Acumulado" />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" name="Nuevos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contactos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(dashboard?.contactsByStatus || []).map((s: any) => ({
                    name: translateStatus(s.status),
                    value: s._count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(dashboard?.contactsByStatus || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Location + Gender */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Distribución Geográfica
            </CardTitle>
            <CardDescription>Contactos por comuna</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                layout="vertical"
                data={(dashboard?.contactsByLocation || []).map((l: any) => ({
                  location: l.location || "Sin ubicación",
                  count: l._count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="location" width={140} tick={{ fontSize: 12 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contactos por Género</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(dashboard?.contactsByGender || []).map((g: any) => ({
                    name: translateGender(g.gender),
                    value: g._count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(dashboard?.contactsByGender || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tags + Interests */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Participación por Tipo de Evento
            </CardTitle>
            <CardDescription>Contactos por etiqueta</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                layout="vertical"
                data={(dashboard?.topTags || []).map((t: any) => ({
                  name: t.name,
                  count: t.count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {(dashboard?.topTags || []).map((t: any, i: number) => (
                    <Cell key={i} fill={t.color || COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Intereses Principales
            </CardTitle>
            <CardDescription>Temas de mayor interés</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={(dashboard?.topInterests || []).map((i: any) => ({
                name: i.name,
                count: i.count,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Contacts by Source */}
      <Card>
        <CardHeader>
          <CardTitle>Contactos por Fuente</CardTitle>
          <CardDescription>Evento o formulario de origen (top 15)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              layout="vertical"
              data={(dashboard?.contactsBySource || []).slice(0, 15).map((s: any) => ({
                source: truncateText(s.source || "Desconocido", 50),
                count: s._count,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="source" width={300} tick={{ fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Report */}
      <Card>
        <CardHeader>
          <CardTitle>Reporte de Engagement</CardTitle>
          <CardDescription>
            Interacciones y mensajes por tipo (últimos 30 días)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-3">Interacciones por Tipo</h4>
              {engagement?.interactions?.length === 0 || !engagement?.interactions ? (
                <p className="text-sm text-muted-foreground">Sin interacciones en este período</p>
              ) : (
                <div className="space-y-2">
                  {engagement?.interactions?.map((i: any) => (
                    <div key={i.type} className="flex items-center justify-between">
                      <Badge variant="outline">{i.type}</Badge>
                      <span className="text-sm font-medium">{i._count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Mensajes por Canal</h4>
              {engagement?.messages?.length === 0 || !engagement?.messages ? (
                <p className="text-sm text-muted-foreground">Sin mensajes en este período</p>
              ) : (
                <div className="space-y-2">
                  {engagement?.messages?.map((m: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{m.channel}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {m.direction === "INBOUND" ? "Recibidos" : "Enviados"}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{m._count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function translateGender(gender: string | null): string {
  const map: Record<string, string> = {
    MALE: "Masculino",
    FEMALE: "Femenino",
    NON_BINARY: "No Binario",
    OTHER: "Otro",
    PREFER_NOT_TO_SAY: "Prefiere no decir",
  };
  return gender ? map[gender] || gender : "Sin especificar";
}

function translateStatus(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    ARCHIVED: "Archivado",
    BLOCKED: "Bloqueado",
  };
  return map[status] || status;
}

function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
