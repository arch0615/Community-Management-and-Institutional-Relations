"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import type { Organization } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Users, Building2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function OrganizationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: "", slug: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && user?.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [user, loading, router]);

  const fetchOrgs = useCallback(async () => {
    try {
      const params: any = { limit: 100 };
      if (search) params.search = search;
      const res = await api.get("/admin/organizations", { params });
      setOrganizations(res.data.data);
    } catch {
      toast.error("Error al cargar organizaciones");
    }
  }, [search]);

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") fetchOrgs();
  }, [user, fetchOrgs]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/admin/organizations", newOrg);
      toast.success("Organizacion creada");
      setNewOrg({ name: "", slug: "" });
      setShowCreate(false);
      fetchOrgs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al crear organizacion");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar la organizacion "${name}" y todos sus datos?`)) return;
    try {
      await api.delete(`/admin/organizations/${id}`);
      toast.success("Organizacion eliminada");
      fetchOrgs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al eliminar");
    }
  };

  if (loading || user?.role !== "SUPER_ADMIN") return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizaciones</h1>
          <p className="text-muted-foreground">Gestiona todas las organizaciones de la plataforma</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Organizacion
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Organizacion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex items-end gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  placeholder="Nombre de la organizacion"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium">Slug <span className="text-muted-foreground font-normal">(opcional)</span></label>
                <Input
                  placeholder="mi-organizacion"
                  value={newOrg.slug}
                  onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? "Creando..." : "Crear"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar organizaciones..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="secondary">{organizations.length} organizaciones</Badge>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organizacion</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Usuarios</TableHead>
              <TableHead className="text-center">Contactos</TableHead>
              <TableHead className="text-center">Campanas</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <button
                    onClick={() => router.push(`/admin/organizations/${org.id}`)}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{org.name}</span>
                  </button>
                </TableCell>
                <TableCell className="text-muted-foreground">{org.slug}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">
                    <Users className="mr-1 h-3 w-3" />
                    {org._count?.users ?? 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{org._count?.contacts ?? 0}</TableCell>
                <TableCell className="text-center">{org._count?.campaigns ?? 0}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(org.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/admin/organizations/${org.id}`)}
                    title="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(org.id, org.name)}
                    className="text-destructive hover:text-destructive"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {organizations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No se encontraron organizaciones
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
