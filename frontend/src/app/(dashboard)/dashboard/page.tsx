"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Filter, MessageSquare, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
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
            <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">Total de mensajes</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Crecimiento de Contactos
            </CardTitle>
            <CardDescription>Nuevos contactos en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.contactGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "#1e3a5f", border: "1px solid #2d4a6f", borderRadius: "8px", color: "#f1f5f9" }} labelStyle={{ color: "#f1f5f9" }} itemStyle={{ color: "#e2e8f0" }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
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
                  data={(stats?.contactsByGender || []).map((g) => ({
                    name: g.gender || "Sin especificar",
                    value: g._count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(stats?.contactsByGender || []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e3a5f", border: "1px solid #2d4a6f", borderRadius: "8px", color: "#f1f5f9" }} labelStyle={{ color: "#f1f5f9" }} itemStyle={{ color: "#e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Messages by Channel & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mensajes por Canal</CardTitle>
            <CardDescription>Distribución por canales de comunicación</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(stats?.messagesByChannel || []).map((m) => ({
                channel: m.channel,
                count: m._count,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "#1e3a5f", border: "1px solid #2d4a6f", borderRadius: "8px", color: "#f1f5f9" }} labelStyle={{ color: "#f1f5f9" }} itemStyle={{ color: "#e2e8f0" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Interacciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.recentInteractions || []).map((interaction) => (
                <div key={interaction.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {interaction.contact?.firstName?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {interaction.contact?.firstName} {interaction.contact?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {interaction.type} - {interaction.subject || "Sin asunto"}
                    </p>
                  </div>
                  <Badge variant="secondary">{interaction.type}</Badge>
                </div>
              ))}
              {(!stats?.recentInteractions || stats.recentInteractions.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">Sin interacciones recientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
