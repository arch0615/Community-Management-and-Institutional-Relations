"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import type { PlatformStats } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, UserCog, MessageSquare, TrendingUp, Activity } from "lucide-react";
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
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  ARCHIVED: "Archivado",
  BLOCKED: "Bloqueado",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  MEMBER: "Miembro",
};

const channelLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  FACEBOOK_MESSENGER: "Facebook",
  EMAIL: "Email",
  SMS: "SMS",
};

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin}m`;
  if (diffHrs < 24) return `Hace ${diffHrs}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      api
        .get<PlatformStats>("/admin/stats")
        .then((res) => setStats(res.data))
        .finally(() => setFetching(false));
    }
  }, [user]);

  if (loading || user?.role !== "SUPER_ADMIN") return null;

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const summaryCards = [
    { title: "Organizaciones", value: stats?.totalOrganizations ?? 0, icon: Building2, color: "text-blue-600", href: "/admin/organizations" },
    { title: "Usuarios", value: stats?.totalUsers ?? 0, icon: UserCog, color: "text-green-600", href: "/admin/users" },
    { title: "Contactos", value: stats?.totalContacts ?? 0, icon: Users, color: "text-purple-600", href: null },
    { title: "Mensajes", value: stats?.totalMessages ?? 0, icon: MessageSquare, color: "text-amber-600", href: null },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Vista general de la plataforma</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card
            key={card.title}
            className={card.href ? "cursor-pointer transition-shadow hover:shadow-md" : ""}
            onClick={() => card.href && router.push(card.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1: Contact Growth + Contacts per Org */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Crecimiento de Contactos
            </CardTitle>
            <CardDescription>Nuevos contactos en los ultimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.contactGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e3a5f", border: "1px solid #2d4a6f", borderRadius: "8px", color: "#f1f5f9" }}
                  labelStyle={{ color: "#f1f5f9" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Contactos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contactos por Organizacion</CardTitle>
            <CardDescription>Distribucion de contactos entre organizaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.contactsByOrg || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e3a5f", border: "1px solid #2d4a6f", borderRadius: "8px", color: "#f1f5f9" }}
                  labelStyle={{ color: "#f1f5f9" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Bar dataKey="contacts" fill="#8b5cf6" name="Contactos" radius={[0, 4, 4, 0]} />
                <Bar dataKey="users" fill="#3b82f6" name="Usuarios" radius={[0, 4, 4, 0]} />
                <Bar dataKey="campaigns" fill="#f59e0b" name="Campanas" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Status Pie + Messages by Channel + Users by Role */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contactos por Estado</CardTitle>
            <CardDescription>Distribucion de estados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={(stats?.contactsByStatus || []).map((s) => ({
                    name: statusLabels[s.status] || s.status,
                    value: s.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(stats?.contactsByStatus || []).map((_, i) => (
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
            <CardTitle>Mensajes por Canal</CardTitle>
            <CardDescription>Volumen por canal de comunicacion</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(stats?.messagesByChannel || []).map((m) => ({
                channel: channelLabels[m.channel] || m.channel,
                count: m.count,
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="channel" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e3a5f", border: "1px solid #2d4a6f", borderRadius: "8px", color: "#f1f5f9" }}
                  labelStyle={{ color: "#f1f5f9" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="count" name="Mensajes" radius={[4, 4, 0, 0]}>
                  {(stats?.messagesByChannel || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios por Rol</CardTitle>
            <CardDescription>Distribucion de roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={(stats?.usersByRole || []).map((r) => ({
                    name: roleLabels[r.role] || r.role,
                    value: r.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(stats?.usersByRole || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e3a5f", border: "1px solid #2d4a6f", borderRadius: "8px", color: "#f1f5f9" }} labelStyle={{ color: "#f1f5f9" }} itemStyle={{ color: "#e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividad Reciente de la Plataforma
          </CardTitle>
          <CardDescription>Ultimas acciones realizadas en todas las organizaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(stats?.recentActivity || []).map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {a.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{a.userName}</span>{" "}
                    <span className="text-muted-foreground">
                      {a.details?.description || `${a.action} ${a.entityType}`}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.orgName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge variant="outline" className="text-xs">{a.action}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
                </div>
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <p className="text-center text-sm text-muted-foreground py-8">Sin actividad reciente</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
