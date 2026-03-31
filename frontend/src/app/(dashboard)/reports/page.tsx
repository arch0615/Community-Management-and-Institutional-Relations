"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download } from "lucide-react";
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
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

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
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Total Contactos", value: dashboard?.overview?.totalContacts || 0 },
          { label: "Activos", value: dashboard?.overview?.activeContacts || 0 },
          { label: "Inactivos", value: dashboard?.overview?.inactiveContacts || 0 },
          { label: "Segmentos", value: dashboard?.overview?.totalSegments || 0 },
          { label: "Mensajes", value: dashboard?.overview?.totalMessages || 0 },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contactos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(dashboard?.contactsByStatus || []).map((s: any) => ({
                    name: s.status,
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
                <Tooltip contentStyle={{ backgroundColor: "#1e3a5f", border: "1px solid #2d4a6f", borderRadius: "8px", color: "#f1f5f9" }} labelStyle={{ color: "#f1f5f9" }} itemStyle={{ color: "#e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contactos por Fuente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(dashboard?.contactsBySource || []).map((s: any) => ({
                source: s.source || "Desconocido",
                count: s._count,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "#1e3a5f", border: "1px solid #2d4a6f", borderRadius: "8px", color: "#f1f5f9" }} labelStyle={{ color: "#f1f5f9" }} itemStyle={{ color: "#e2e8f0" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
              {engagement?.interactions?.length === 0 ? (
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
              {engagement?.messages?.length === 0 ? (
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
