"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import type { AdminUser, Organization } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, UserX, UserCheck, UserCog } from "lucide-react";
import { toast } from "sonner";

const roleBadgeColor: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  MANAGER: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  MEMBER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "", email: "", password: "", role: "MEMBER", organizationId: "",
  });

  useEffect(() => {
    if (!loading && user?.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [user, loading, router]);

  const fetchUsers = useCallback(async () => {
    try {
      const params: any = { limit: 100 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (orgFilter) params.organizationId = orgFilter;
      const res = await api.get("/admin/users", { params });
      setUsers(res.data.data);
    } catch {
      toast.error("Error al cargar usuarios");
    }
  }, [search, roleFilter, orgFilter]);

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      fetchUsers();
      api.get("/admin/organizations", { params: { limit: 100 } }).then((res) => {
        setOrganizations(res.data.data);
      });
    }
  }, [user, fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/admin/users", newUser);
      toast.success("Usuario creado");
      setNewUser({ name: "", email: "", password: "", role: "MEMBER", organizationId: "" });
      setShowCreate(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al crear usuario");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (u: AdminUser) => {
    try {
      if (u.isActive) {
        await api.delete(`/admin/users/${u.id}`);
        toast.success("Usuario desactivado");
      } else {
        await api.put(`/admin/users/${u.id}`, { isActive: true });
        toast.success("Usuario activado");
      }
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al actualizar usuario");
    }
  };

  if (loading || user?.role !== "SUPER_ADMIN") return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona todos los usuarios de la plataforma</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  placeholder="Nombre completo"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Contrasena</label>
                <Input
                  type="password"
                  placeholder="Min. 8 caracteres"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Rol</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="MEMBER">Member</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Organizacion</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newUser.organizationId}
                  onChange={(e) => setNewUser({ ...newUser, organizationId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creando..." : "Crear"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Todos los roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="MEMBER">Member</option>
        </select>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
        >
          <option value="">Todas las organizaciones</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>
        <Badge variant="secondary">{users.length} usuarios</Badge>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Organizacion</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
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
                <TableCell>{u.organization?.name}</TableCell>
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
                    onClick={() => toggleActive(u)}
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
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
