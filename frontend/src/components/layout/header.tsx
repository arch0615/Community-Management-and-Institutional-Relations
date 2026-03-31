"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Users, MessageSquare, Filter, Tag, Upload, Download, LogIn, Pencil, Plus, Sun, Moon, Monitor, Megaphone, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import api from "@/lib/api";

interface SearchResults {
  contacts: { id: string; firstName: string; lastName?: string; email?: string; phone?: string; status: string }[];
  segments: { id: string; name: string; description?: string; _count?: { contacts: number } }[];
  campaigns: { id: string; name: string; status: string; channel?: string }[];
}

interface Notification {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: { description?: string; count?: number } | null;
  userName: string;
  createdAt: string;
}

const actionIcons: Record<string, typeof Users> = {
  CREATE: Plus,
  UPDATE: Pencil,
  SEND: MessageSquare,
  IMPORT: Upload,
  EXPORT: Download,
  LOGIN: LogIn,
  TAG_ADDED: Tag,
};

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  UPDATE: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  SEND: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  IMPORT: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  EXPORT: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  LOGIN: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  TAG_ADDED: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin}m`;
  if (diffHrs < 24) return `Hace ${diffHrs}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString();
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo", INACTIVE: "Inactivo", ARCHIVED: "Archivado", BLOCKED: "Bloqueado",
  DRAFT: "Borrador", SCHEDULED: "Programada", SENDING: "Enviando", SENT: "Enviada", CANCELLED: "Cancelada",
};

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // ─── Search State ─────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults(null);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    try {
      const { data } = await api.get<SearchResults>("/reports/search", { params: { q: query } });
      setSearchResults(data);
      const hasResults = data.contacts.length > 0 || data.segments.length > 0 || data.campaigns.length > 0;
      setSearchOpen(hasResults || query.trim().length >= 2);
    } catch {
      // silently fail
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 300);
  };

  const navigateTo = (path: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults(null);
    router.push(path);
  };

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    if (open || themeOpen || searchOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, themeOpen, searchOpen]);

  // Fetch notifications on mount and poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await api.get<Notification[]>("/reports/notifications", { params: { limit: 15 } });
      const fetched = res.data;

      // Check if there are new notifications since last seen
      const lastSeen = localStorage.getItem("lastSeenNotification");
      if (fetched.length > 0 && fetched[0].id !== lastSeen) {
        setHasNew(true);
      }

      setNotifications(fetched);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(!open);
    if (!open) {
      setHasNew(false);
      if (notifications.length > 0) {
        localStorage.setItem("lastSeenNotification", notifications[0].id);
      }
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          {searchLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
          )}
          <Input
            placeholder="Buscar contactos, segmentos, campañas..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => { if (searchResults) setSearchOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setSearchOpen(false); (e.target as HTMLInputElement).blur(); }
            }}
          />

          {/* Search Results Dropdown */}
          {searchOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border bg-card shadow-lg overflow-hidden">
              {!searchResults || (searchResults.contacts.length === 0 && searchResults.segments.length === 0 && searchResults.campaigns.length === 0) ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No se encontraron resultados para &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto">
                  {/* Contacts */}
                  {searchResults.contacts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Contactos
                        </span>
                      </div>
                      {searchResults.contacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => navigateTo(`/contacts/${contact.id}`)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {contact.firstName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {contact.email || contact.phone || ""}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {statusLabels[contact.status] || contact.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Segments */}
                  {searchResults.segments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-t">
                        <Filter className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Segmentos
                        </span>
                      </div>
                      {searchResults.segments.map((segment) => (
                        <button
                          key={segment.id}
                          onClick={() => navigateTo("/segments")}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <Filter className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{segment.name}</p>
                            {segment.description && (
                              <p className="text-xs text-muted-foreground truncate">{segment.description}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {segment._count?.contacts || 0} contactos
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Campaigns */}
                  {searchResults.campaigns.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-t">
                        <Megaphone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Campañas
                        </span>
                      </div>
                      {searchResults.campaigns.map((campaign) => (
                        <button
                          key={campaign.id}
                          onClick={() => navigateTo(`/campaigns/${campaign.id}`)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            <Megaphone className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{campaign.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {campaign.channel || "Sin canal"}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {statusLabels[campaign.status] || campaign.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
      {/* Theme toggle */}
      <div className="relative" ref={themeRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setThemeOpen(!themeOpen); setOpen(false); }}
          title="Cambiar tema"
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : theme === "system" ? (
            <Monitor className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {themeOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border bg-card shadow-lg py-1">
            {([
              { value: "light" as const, label: "Claro", icon: Sun },
              { value: "dark" as const, label: "Oscuro", icon: Moon },
              { value: "system" as const, label: "Sistema", icon: Monitor },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setTheme(opt.value); setThemeOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted ${
                  theme === opt.value ? "font-medium text-primary" : "text-foreground"
                }`}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
                {theme === opt.value && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="relative" ref={dropdownRef}>
        <Button variant="ghost" size="icon" onClick={handleOpen} className="relative">
          <Bell className="h-4 w-4" />
          {hasNew && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border bg-card shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold">Notificaciones</h3>
              <span className="text-xs text-muted-foreground">
                {notifications.length} recientes
              </span>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Cargando...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay notificaciones
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = actionIcons[n.action] || Users;
                  const colorClass = actionColors[n.action] || "bg-gray-100 text-gray-600";

                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 border-b px-4 py-3 last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{n.userName}</span>
                          {" "}
                          <span className="text-muted-foreground">
                            {n.details?.description || `${n.action} ${n.entityType}`}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
