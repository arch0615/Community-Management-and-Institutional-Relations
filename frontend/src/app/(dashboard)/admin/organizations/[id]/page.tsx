"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Building2,
  Users,
  Filter,
  MessageSquare,
  Radio,
  Calendar,
  Globe,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    contacts: number;
    segments: number;
    campaigns: number;
    channels: number;
  };
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
}

const roleBadgeColor: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  MANAGER: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  MEMBER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export default function OrganizationDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && user?.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN" && params.id) {
      api
        .get(`/admin/organizations/${params.id}`)
        .then((res) => setOrg(res.data))
        .catch(() => {
          toast.error("Organizacion no encontrada");
          router.push("/admin/organizations");
        })
        .finally(() => setFetching(false));
    }
  }, [user, params.id, router]);

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await api.delete(`/admin/users/${userId}`);
      } else {
        await api.put(`/admin/users/${userId}`, { isActive: true });
      }
      toast.success(isActive ? "Usuario desactivado" : "Usuario activado");
      const res = await api.get(`/admin/organizations/${params.id}`);
      setOrg(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al actualizar usuario");
    }
  };

  if (loading || user?.role !== "SUPER_ADMIN" || fetching) return null;
  if (!org) return null;

  const statCards = [
    { label: "Usuarios", value: org._count.users, icon: Users, color: "text-blue-600" },
    { label: "Contactos", value: org._count.contacts, icon: Users, color: "text-purple-600" },
    { label: "Segmentos", value: org._count.segments, icon: Filter, color: "text-green-600" },
    { label: "Campanas", value: org._count.campaigns, icon: MessageSquare, color: "text-amber-600" },
    { label: "Canales", value: org._count.channels, icon: Radio, color: "text-pink-600" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/organizations")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">{org.name}</h1>
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {org.slug}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Creada el {new Date(org.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios de la Organizacion</CardTitle>
          <CardDescription>{org._count.users} usuarios registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {org.users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeColor[u.role] || "bg-gray-100 text-gray-800"}`}>
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {u.isActive ? (
                      <Badge variant="outline" className="border-green-300 text-green-700">Activo</Badge>
                    ) : (
                      <Badge variant="outline" className="border-red-300 text-red-700">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleUserActive(u.id, u.isActive)}
                      title={u.isActive ? "Desactivar" : "Activar"}
                    >
                      {u.isActive ? (
                        <UserX className="h-4 w-4 text-destructive" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {org.users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay usuarios en esta organizacion
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
