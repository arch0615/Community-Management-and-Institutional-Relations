"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import {
  Plus, Search, Download, Upload, Eye, Trash2,
  FileSpreadsheet, X, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import type { Contact, PaginatedResponse } from "@/lib/types";

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number; skipped: number; total: number; errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    location: "",
    source: "",
  });

  const { data, isLoading } = useQuery<PaginatedResponse<Contact>>({
    queryKey: ["contacts", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const { data } = await api.get(`/contacts?${params}`);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (contactData: typeof newContact) => {
      const payload = Object.fromEntries(
        Object.entries(contactData).filter(([_, v]) => v !== "")
      );
      const { data } = await api.post("/contacts", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contacto creado exitosamente");
      setShowCreateForm(false);
      setNewContact({ firstName: "", lastName: "", email: "", phone: "", gender: "", location: "", source: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al crear contacto");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contacto eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar contacto");
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/contacts/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setImportResult(data);
      toast.success(`${data.created} contactos importados`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al importar");
    },
  });

  const handleExport = async () => {
    try {
      const response = await api.get("/contacts/export", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contactos_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Contactos exportados exitosamente");
    } catch {
      toast.error("Error al exportar contactos");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Solo se permiten archivos CSV");
      return;
    }
    setImportResult(null);
    importMutation.mutate(file);
    e.target.value = "";
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "INACTIVE": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "ARCHIVED": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "BLOCKED": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contactos</h1>
          <p className="text-muted-foreground">Gestiona tus contactos e interacciones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => setShowImport(!showImport)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar CSV
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Contacto
          </Button>
        </div>
      </div>

      {/* Import Section */}
      {showImport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Importar Contactos
                </CardTitle>
                <CardDescription>Sube un archivo CSV para importar contactos en masa</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setShowImport(false); setImportResult(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed p-8 text-center">
              <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">Selecciona un archivo CSV</p>
              <p className="text-xs text-muted-foreground mb-4">
                Columnas soportadas: nombre, apellido, email, telefono, genero, ubicacion, fuente
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={importMutation.isPending}
              >
                {importMutation.isPending ? "Importando..." : "Seleccionar Archivo"}
              </Button>
            </div>

            {/* Import Result */}
            {importResult && (
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Importación completada</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-2xl font-bold text-green-600">{importResult.created}</p>
                    <p className="text-xs text-muted-foreground">Creados</p>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-2xl font-bold text-amber-600">{importResult.skipped}</p>
                    <p className="text-xs text-muted-foreground">Omitidos</p>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-2xl font-bold">{importResult.total}</p>
                    <p className="text-xs text-muted-foreground">Total en archivo</p>
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                      Advertencias:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {importResult.errors.map((err, i) => (
                        <li key={i}>- {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* CSV Format Guide */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium mb-2">Formato esperado del CSV:</p>
              <code className="text-xs block bg-background rounded p-2 overflow-x-auto">
                nombre,apellido,email,telefono,genero,ubicacion,fuente{"\n"}
                Juan,Pérez,juan@ejemplo.cl,+56912345678,Masculino,Santiago,WhatsApp
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Nota: Los contactos con email duplicado serán omitidos automáticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(newContact);
              }}
              className="grid gap-4 md:grid-cols-3"
            >
              <Input
                placeholder="Nombre *"
                value={newContact.firstName}
                onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                required
              />
              <Input
                placeholder="Apellido"
                value={newContact.lastName}
                onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
              <Input
                placeholder="Teléfono"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newContact.gender}
                onChange={(e) => setNewContact({ ...newContact, gender: e.target.value })}
              >
                <option value="">Género</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
                <option value="NON_BINARY">No Binario</option>
                <option value="OTHER">Otro</option>
              </select>
              <Input
                placeholder="Ubicación"
                value={newContact.location}
                onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
              />
              <div className="md:col-span-3 flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creando..." : "Crear Contacto"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar contactos..."
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Etiquetas</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron contactos
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      {contact.firstName} {contact.lastName}
                    </TableCell>
                    <TableCell>{contact.email || "-"}</TableCell>
                    <TableCell>{contact.phone || "-"}</TableCell>
                    <TableCell>{contact.location || "-"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags?.map((ct) => (
                          <Badge key={ct.tag.id} variant="secondary" className="text-xs">
                            {ct.tag.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/contacts/${contact.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            if (confirm("¿Eliminar este contacto?")) {
                              deleteMutation.mutate(contact.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {data.pagination.page} de {data.pagination.totalPages} ({data.pagination.total} contactos)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
