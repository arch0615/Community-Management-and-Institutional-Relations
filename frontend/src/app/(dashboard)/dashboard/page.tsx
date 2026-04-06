"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Filter, MessageSquare, TrendingUp, Activity, MapPin, Tag, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/reports/dashboard");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const overview = stats?.overview;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel</h1>
        <p className="text-muted-foreground">Resumen de la actividad del CRM</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contactos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalContacts || 0}</div>
            <p className="text-xs text-muted-foreground">Todos los contactos registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactos Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.activeContacts || 0}</div>
            <p className="text-xs text-muted-foreground">Actualmente activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segmentos</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalSegments || 0}</div>
            <p className="text-xs text-muted-foreground">Segmentos de audiencia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etiquetas</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalTags || 0}</div>
            <p className="text-xs text-muted-foreground">Tipos de evento</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Growth + Gender */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Crecimiento de Contactos
            </CardTitle>
            <CardDescription>Crecimiento acumulado por trimestre</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.contactGrowth || []}>
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
            <CardTitle>Contactos por Género</CardTitle>
            <CardDescription>Distribución de contactos por género</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(stats?.contactsByGender || []).map((g: any) => ({
                    name: translateGender(g.gender),
                    value: g._count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(stats?.contactsByGender || []).map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Location + Top Tags */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Contactos por Ubicación
            </CardTitle>
            <CardDescription>Top 15 comunas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                layout="vertical"
                data={(stats?.contactsByLocation || []).map((l: any) => ({
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
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Participación por Tipo de Evento
            </CardTitle>
            <CardDescription>Contactos por etiqueta de evento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                layout="vertical"
                data={(stats?.topTags || []).map((t: any) => ({
                  name: t.name,
                  count: t.count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {(stats?.topTags || []).map((t: any, i: number) => (
                    <Cell key={i} fill={t.color || COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Interests + Recent Contacts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Intereses Principales
            </CardTitle>
            <CardDescription>Temas de mayor interés entre los contactos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(stats?.topInterests || []).map((i: any) => ({
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Contactos Recientes
            </CardTitle>
            <CardDescription>Últimos contactos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.recentContacts || []).map((contact: any) => (
                <div key={contact.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {contact.firstName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.email || contact.location || "Sin email"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(contact.createdAt).toLocaleDateString("es-CL")}
                  </span>
                </div>
              ))}
              {(!stats?.recentContacts || stats.recentContacts.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">Sin contactos recientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
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
