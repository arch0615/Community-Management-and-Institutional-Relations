import Link from "next/link";
import {
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  Filter,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Gestion de Contactos",
    description:
      "Administra todos tus contactos en un solo lugar. Registra datos demograficos, intereses, etiquetas y un historial completo de interacciones.",
  },
  {
    icon: Filter,
    title: "Segmentacion Inteligente",
    description:
      "Crea segmentos dinamicos basados en filtros personalizados para dirigir tus campanas y acciones a la audiencia correcta.",
  },
  {
    icon: MessageSquare,
    title: "Mensajeria Multicanal",
    description:
      "Conecta con tu comunidad a traves de WhatsApp, Instagram, Facebook Messenger, Email y SMS desde una sola plataforma.",
  },
  {
    icon: BarChart3,
    title: "Reportes y Analitica",
    description:
      "Visualiza el crecimiento de tu comunidad, la distribucion demografica y la efectividad de tus campanas con dashboards interactivos.",
  },
  {
    icon: Shield,
    title: "Multi-organizacion",
    description:
      "Cada organizacion tiene su propio espacio aislado con usuarios, contactos, segmentos y campanas independientes.",
  },
  {
    icon: Zap,
    title: "Campanas Automatizadas",
    description:
      "Diseña, programa y envia campanas masivas a segmentos especificos. Monitorea el estado de envio en tiempo real.",
  },
];

const stats = [
  { value: "5", label: "Canales integrados" },
  { value: "100%", label: "Datos aislados por org" },
  { value: "3", label: "Roles de usuario" },
  { value: "24/7", label: "Disponibilidad" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CRM Comunitario</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Iniciar Sesion
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(221,83%,53%,0.12),transparent)]" />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              Plataforma de Gestion Comunitaria
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Gestiona tu comunidad con{" "}
              <span className="text-primary">inteligencia</span> y{" "}
              <span className="text-primary">proposito</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              CRM modular disenado para organizaciones sociales, fundaciones y
              redes comunitarias. Centraliza contactos, automatiza campanas y
              fortalece tus relaciones institucionales.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Comenzar Gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border bg-background px-8 text-base font-medium transition-colors hover:bg-accent"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────── */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Todo lo que necesitas para gestionar tu comunidad
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Herramientas disenadas para organizaciones que trabajan con
            comunidades, aliados institucionales y redes de apoyo.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Channels ──────────────────────────────── */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Conecta por el canal que tu comunidad prefiere
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Integra multiples canales de comunicacion y gestiona todas las
                conversaciones desde un solo lugar.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "WhatsApp Business API",
                  "Instagram Direct Messages",
                  "Facebook Messenger",
                  "Correo Electronico",
                  "Mensajes SMS",
                ].map((channel) => (
                  <li key={channel} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <span>{channel}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Mensajes Enviados", value: "250+", sub: "Ultimo mes" },
                { label: "Tasa de Entrega", value: "98.5%", sub: "Promedio global" },
                { label: "Contactos Activos", value: "60+", sub: "En la plataforma" },
                { label: "Tiempo de Respuesta", value: "<2h", sub: "Promedio" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border bg-card p-5 text-center"
                >
                  <div className="text-2xl font-bold text-primary">{item.value}</div>
                  <div className="mt-1 text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Roles ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Control de acceso por roles
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Asigna permisos diferenciados segun la responsabilidad de cada
            miembro de tu equipo.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {[
            {
              role: "Administrador",
              color: "bg-red-500",
              perms: [
                "Acceso completo al sistema",
                "Gestionar usuarios y roles",
                "Configurar canales e integraciones",
                "Ver todos los reportes",
              ],
            },
            {
              role: "Manager",
              color: "bg-amber-500",
              perms: [
                "Crear y editar contactos",
                "Gestionar segmentos",
                "Enviar mensajes y campanas",
                "Ver reportes del equipo",
              ],
            },
            {
              role: "Miembro",
              color: "bg-green-500",
              perms: [
                "Ver contactos",
                "Registrar interacciones",
                "Crear y editar contactos",
                "Consultar segmentos",
              ],
            },
          ].map((item) => (
            <div key={item.role} className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <h3 className="text-lg font-semibold">{item.role}</h3>
              </div>
              <ul className="mt-5 space-y-3">
                {item.perms.map((perm) => (
                  <li key={perm} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-12 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold">
              Empieza a gestionar tu comunidad hoy
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Crea tu cuenta gratuita y configura tu organizacion en minutos.
              Sin tarjeta de credito requerida.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-background px-8 text-base font-medium text-foreground transition-colors hover:bg-background/90"
              >
                Crear Cuenta Gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-primary-foreground/20 px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                Iniciar Sesion
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">CRM Comunitario</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Modular CRM para Gestion de Comunidades y Relaciones Institucionales
          </p>
        </div>
      </footer>
    </div>
  );
}
