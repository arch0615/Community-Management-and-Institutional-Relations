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
  Sparkles,
  Globe,
  Send,
  TrendingUp,
  UserPlus,
  Target,
  ChevronRight,
  Play,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Gestion de Contactos",
    description:
      "Administra todos tus contactos en un solo lugar. Registra datos demograficos, intereses, etiquetas y un historial completo de interacciones.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: Filter,
    title: "Segmentacion Inteligente",
    description:
      "Crea segmentos dinamicos basados en filtros personalizados para dirigir tus campanas y acciones a la audiencia correcta.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    icon: MessageSquare,
    title: "Mensajeria Multicanal",
    description:
      "Conecta con tu comunidad a traves de WhatsApp, Instagram, Facebook Messenger, Email y SMS desde una sola plataforma.",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    icon: BarChart3,
    title: "Reportes y Analitica",
    description:
      "Visualiza el crecimiento de tu comunidad, la distribucion demografica y la efectividad de tus campanas con dashboards interactivos.",
    gradient: "from-orange-500 to-amber-400",
  },
  {
    icon: Shield,
    title: "Multi-organizacion",
    description:
      "Cada organizacion tiene su propio espacio aislado con usuarios, contactos, segmentos y campanas independientes.",
    gradient: "from-rose-500 to-pink-400",
  },
  {
    icon: Zap,
    title: "Campanas Automatizadas",
    description:
      "Disena, programa y envia campanas masivas a segmentos especificos. Monitorea el estado de envio en tiempo real.",
    gradient: "from-indigo-500 to-blue-400",
  },
];

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crea tu organizacion",
    description:
      "Registrate y configura tu espacio de trabajo en menos de 2 minutos.",
  },
  {
    number: "02",
    icon: Users,
    title: "Importa tus contactos",
    description:
      "Sube tu base de datos via CSV o agrega contactos manualmente.",
  },
  {
    number: "03",
    icon: Target,
    title: "Segmenta tu audiencia",
    description:
      "Crea segmentos inteligentes para dirigir tus acciones estrategicamente.",
  },
  {
    number: "04",
    icon: Send,
    title: "Lanza tus campanas",
    description:
      "Envia mensajes personalizados por el canal preferido de tu comunidad.",
  },
];

const channels = [
  { name: "WhatsApp Business", color: "bg-green-500" },
  { name: "Instagram DM", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { name: "Facebook Messenger", color: "bg-blue-600" },
  { name: "Correo Electronico", color: "bg-amber-500" },
  { name: "Mensajes SMS", color: "bg-cyan-500" },
];

const stats = [
  { value: "5", label: "Canales integrados", icon: Globe },
  { value: "100%", label: "Datos aislados por org", icon: Shield },
  { value: "4", label: "Roles de usuario", icon: Users },
  { value: "24/7", label: "Disponibilidad", icon: TrendingUp },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Navbar ────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-110">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              CRM <span className="text-primary">Comunitario</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
            >
              Iniciar Sesion
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
            >
              Comenzar Gratis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 -z-10 bg-grid opacity-50" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,hsl(221,83%,53%,0.15),transparent)]" />
        <div className="absolute top-20 left-10 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 -z-10 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl animate-pulse-glow delay-500" />

        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Text */}
            <div className="text-center lg:text-left">
              <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Plataforma de Gestion Comunitaria
              </div>
              <h1 className="animate-fade-in-up delay-100 mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                Gestiona tu comunidad con{" "}
                <span className="text-gradient">inteligencia</span> y{" "}
                <span className="text-gradient">proposito</span>
              </h1>
              <p className="animate-fade-in-up delay-200 mt-6 text-lg leading-relaxed text-muted-foreground max-w-xl mx-auto lg:mx-0">
                CRM modular disenado para organizaciones sociales, fundaciones y
                redes comunitarias. Centraliza contactos, automatiza campanas y
                fortalece tus relaciones institucionales.
              </p>
              <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start justify-center">
                <Link
                  href="/register"
                  className="group inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Comenzar Gratis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border-2 bg-background px-8 text-base font-semibold transition-all hover:bg-accent hover:border-primary/30"
                >
                  <Play className="h-4 w-4 text-primary" />
                  Ya tengo cuenta
                </Link>
              </div>
              {/* Social proof */}
              <div className="animate-fade-in-up delay-400 mt-10 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-2">
                  {["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500"].map(
                    (color, i) => (
                      <div
                        key={i}
                        className={`h-8 w-8 rounded-full ${color} border-2 border-background flex items-center justify-center text-[10px] font-bold text-white`}
                      >
                        {["JR", "ML", "AS", "KP"][i]}
                      </div>
                    )
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">+50 organizaciones</span>{" "}
                  ya confian en nosotros
                </div>
              </div>
            </div>

            {/* Right: Dashboard preview */}
            <div className="animate-slide-in-right delay-300 relative hidden lg:block">
              <div className="animate-float">
                {/* Main dashboard card */}
                <div className="rounded-2xl border bg-card shadow-2xl shadow-primary/5 p-6 space-y-4">
                  {/* Mini navbar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                        <Zap className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-semibold">Dashboard</span>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                  </div>
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Contactos", value: "1,247", trend: "+12%" },
                      { label: "Campanas", value: "24", trend: "+3" },
                      { label: "Mensajes", value: "8,591", trend: "+28%" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg bg-muted/50 p-3 text-center"
                      >
                        <div className="text-lg font-bold">{item.value}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.label}
                        </div>
                        <div className="text-[10px] font-medium text-emerald-500 mt-0.5">
                          {item.trend}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Mini chart representation */}
                  <div className="rounded-lg bg-muted/30 p-4">
                    <div className="text-xs font-medium text-muted-foreground mb-3">
                      Crecimiento de contactos
                    </div>
                    <div className="flex items-end gap-1.5 h-16">
                      {[35, 45, 30, 55, 65, 50, 70, 85, 75, 90, 80, 95].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t transition-all hover:opacity-80"
                            style={{
                              height: `${h}%`,
                              backgroundColor: `hsl(var(--primary) / ${0.3 + (h / 95) * 0.7})`,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>
                  {/* Recent contacts */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Contactos recientes
                    </div>
                    {[
                      { name: "Maria Lopez", tag: "VIP", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300" },
                      { name: "Carlos Ruiz", tag: "Nuevo", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" },
                      { name: "Ana Santos", tag: "Activo", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" },
                    ].map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {c.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="text-sm font-medium">{c.name}</span>
                        </div>
                        <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${c.color}`}>
                          {c.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating notification card */}
                <div className="absolute -left-8 top-16 rounded-xl border bg-card shadow-lg p-3 w-52 animate-fade-in delay-700">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">Campana enviada</div>
                      <div className="text-[10px] text-muted-foreground">
                        250 mensajes entregados
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stats card */}
                <div className="absolute -right-6 bottom-20 rounded-xl border bg-card shadow-lg p-3 w-44 animate-fade-in delay-600">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">+28% crecimiento</div>
                      <div className="text-[10px] text-muted-foreground">
                        Este mes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────── */}
      <section className="border-y bg-muted/20">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-14 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`animate-count-up delay-${(i + 1) * 100} flex flex-col items-center gap-2 text-center`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-extrabold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────── */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            Funcionalidades
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Todo lo que necesitas para{" "}
            <span className="text-gradient">gestionar tu comunidad</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Herramientas disenadas para organizaciones que trabajan con
            comunidades, aliados institucionales y redes de apoyo.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="feature-card group rounded-2xl border bg-card p-7"
            >
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg shadow-black/5`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Saber mas <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────── */}
      <section className="border-y bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground mb-4">
              <Zap className="h-4 w-4 text-primary" />
              Rapido y sencillo
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Comienza en <span className="text-gradient">4 simples pasos</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Configura tu plataforma y empieza a gestionar tu comunidad en
              minutos, no en dias.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center group">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
                )}
                <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-card border-2 border-border transition-all group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                  <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Channels ──────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground mb-4">
              <MessageSquare className="h-4 w-4 text-primary" />
              Comunicacion multicanal
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Conecta por el canal que{" "}
              <span className="text-gradient">tu comunidad prefiere</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Integra multiples canales de comunicacion y gestiona todas las
              conversaciones desde un solo lugar.
            </p>
            <ul className="mt-8 space-y-4">
              {channels.map((channel) => (
                <li
                  key={channel.name}
                  className="flex items-center gap-3 group"
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${channel.color} transition-transform group-hover:scale-150`}
                  />
                  <span className="font-medium">{channel.name}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              Configurar integraciones
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Mensajes Enviados",
                value: "250+",
                sub: "Ultimo mes",
                icon: Send,
                color: "text-blue-500",
              },
              {
                label: "Tasa de Entrega",
                value: "98.5%",
                sub: "Promedio global",
                icon: CheckCircle2,
                color: "text-emerald-500",
              },
              {
                label: "Contactos Activos",
                value: "60+",
                sub: "En la plataforma",
                icon: Users,
                color: "text-violet-500",
              },
              {
                label: "Tiempo de Respuesta",
                value: "<2h",
                sub: "Promedio",
                icon: Zap,
                color: "text-amber-500",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="feature-card rounded-2xl border bg-card p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="text-2xl font-extrabold">{item.value}</div>
                <div className="mt-1 text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold tracking-tight">
                CRM <span className="text-primary">Comunitario</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Modular CRM para Gestion de Comunidades y Relaciones
              Institucionales
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Iniciar Sesion
              </Link>
              <Link
                href="/register"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CRM Comunitario. Todos los
              derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
