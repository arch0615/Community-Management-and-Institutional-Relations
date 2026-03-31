"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Mail, Lock, Eye, EyeOff, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  // ─── Profile Form ─────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put("/auth/profile", profileForm);
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Perfil actualizado exitosamente");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al actualizar perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const profileChanged = user && (profileForm.name !== user.name || profileForm.email !== user.email);

  // ─── Password Form ────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordErrors = (() => {
    const errors: string[] = [];
    const p = passwordForm.newPassword;
    if (p.length > 0) {
      if (p.length < 8) errors.push("Al menos 8 caracteres");
      if (!/[A-Z]/.test(p)) errors.push("Al menos una letra mayúscula");
      if (!/[a-z]/.test(p)) errors.push("Al menos una letra minúscula");
      if (!/[0-9]/.test(p)) errors.push("Al menos un número");
      if (!/[^A-Za-z0-9]/.test(p)) errors.push("Al menos un carácter especial");
    }
    return errors;
  })();

  const passwordsMatch = passwordForm.confirmPassword.length === 0 || passwordForm.newPassword === passwordForm.confirmPassword;
  const isPasswordValid = passwordForm.newPassword.length >= 8 && passwordErrors.length === 0;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("La nueva contraseña no cumple con los requisitos");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put("/auth/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Contraseña actualizada exitosamente");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al cambiar contraseña");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Administrador",
    MANAGER: "Gestor",
    MEMBER: "Miembro",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y contraseña</p>
      </div>

      {/* Avatar & Role Info */}
      <Card>
        <CardContent className="flex items-center gap-6 pt-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {roleLabels[user?.role || ""] || user?.role}
              </Badge>
              <Badge variant="outline">{user?.organization?.name}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Información Personal
          </CardTitle>
          <CardDescription>Actualiza tu nombre y correo electrónico</CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tu nombre completo"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={savingProfile || !profileChanged}>
              <Save className="mr-2 h-4 w-4" />
              {savingProfile ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña Actual</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showCurrent ? "text" : "password"}
                  placeholder="********"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="Mín. 8 caracteres"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={8}
                  className={`pl-10 pr-10 ${passwordForm.newPassword.length > 0 && !isPasswordValid ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.newPassword.length > 0 && passwordErrors.length > 0 && (
                <ul className="text-xs text-destructive space-y-1 mt-1">
                  {passwordErrors.map((err) => (
                    <li key={err}>- {err}</li>
                  ))}
                </ul>
              )}
              {passwordForm.newPassword.length > 0 && passwordErrors.length === 0 && (
                <p className="text-xs text-green-600 mt-1">La contraseña es segura</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Reingresa la nueva contraseña"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  className={`pl-10 pr-10 ${!passwordsMatch ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!passwordsMatch && (
                <p className="text-xs text-destructive mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              variant="outline"
              disabled={savingPassword || !isPasswordValid || !passwordsMatch || !passwordForm.currentPassword}
            >
              <Lock className="mr-2 h-4 w-4" />
              {savingPassword ? "Actualizando..." : "Cambiar Contraseña"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
