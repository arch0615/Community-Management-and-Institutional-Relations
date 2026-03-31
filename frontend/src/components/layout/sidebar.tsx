"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Filter,
  BarChart3,
  MessageSquare,
  Megaphone,
  Settings,
  LogOut,
  Zap,
  Shield,
  Building2,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contactos", href: "/contacts", icon: Users },
  { name: "Segmentos", href: "/segments", icon: Filter },
  { name: "Campañas", href: "/campaigns", icon: Megaphone },
  { name: "Mensajes", href: "/messages", icon: MessageSquare },
  { name: "Reportes", href: "/reports", icon: BarChart3 },
  { name: "Configuracion", href: "/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Admin Panel", href: "/admin", icon: Shield },
  { name: "Organizaciones", href: "/admin/organizations", icon: Building2 },
  { name: "Usuarios", href: "/admin/users", icon: UserCog },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Zap className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">CRM</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}

        {isSuperAdmin && (
          <>
            <div className="my-3 border-t" />
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Plataforma
            </p>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-primary-foreground",
              isSuperAdmin ? "bg-red-500" : "bg-primary"
            )}>
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {isSuperAdmin ? "Super Admin" : user?.organization?.name}
              </p>
            </div>
          </Link>
          <button onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
