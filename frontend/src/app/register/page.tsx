"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordErrors = (() => {
    const errors: string[] = [];
    const p = form.password;
    if (p.length > 0) {
      if (p.length < 8) errors.push("Al menos 8 caracteres");
      if (!/[A-Z]/.test(p)) errors.push("Al menos una letra mayúscula");
      if (!/[a-z]/.test(p)) errors.push("Al menos una letra minúscula");
      if (!/[0-9]/.test(p)) errors.push("Al menos un número");
      if (!/[^A-Za-z0-9]/.test(p)) errors.push("Al menos un carácter especial");
    }
    return errors;
  })();

  const passwordsMatch = form.confirmPassword.length === 0 || form.password === form.confirmPassword;
  const isPasswordValid = form.password.length >= 8 && passwordErrors.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("La contraseña no cumple con los requisitos");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword: _, ...payload } = form;
      await register(payload);
      toast.success("Cuenta creada exitosamente!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>Configura tu organización y comienza a gestionar contactos</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre Completo</label>
              <Input
                placeholder="Juan Pérez"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Correo electrónico</label>
              <Input
                type="email"
                placeholder="tu@ejemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mín. 8 caracteres"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className={`pr-10 ${form.password.length > 0 && !isPasswordValid ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password.length > 0 && passwordErrors.length > 0 && (
                <ul className="text-xs text-destructive space-y-1 mt-1">
                  {passwordErrors.map((err) => (
                    <li key={err}>- {err}</li>
                  ))}
                </ul>
              )}
              {form.password.length > 0 && passwordErrors.length === 0 && (
                <p className="text-xs text-green-600 mt-1">La contraseña es segura</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Contraseña</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Reingresa tu contraseña"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className={`pr-10 ${!passwordsMatch ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!passwordsMatch && (
                <p className="text-xs text-destructive mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de la Organización <span className="text-muted-foreground font-normal">(opcional)</span></label>
              <Input
                placeholder="Tu Organización"
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Si no lo indicas, se creará automáticamente.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading || !isPasswordValid || !passwordsMatch}>
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
