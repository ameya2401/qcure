import { Activity, MoonStar, Stethoscope, SunMedium, TimerReset } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { queueService } from "@/services/queue/queueService";

const links = [
  { to: "/reception", label: "Reception", icon: Activity },
  { to: "/waiting-room", label: "Waiting Room", icon: TimerReset },
  { to: "/doctor", label: "Doctor", icon: Stethoscope },
];

export function AppShell() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(11,87,208,0.08),transparent_20%),radial-gradient(circle_at_80%_10%,rgba(196,219,255,0.25),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.08),transparent_25%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 pb-6 pt-4 md:px-6">
        <header className="sticky top-4 z-20 mb-6 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate-950/70 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Q-Cure Logo" className="h-10 w-10" />
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Q-Cure
              </h1>
            </div>
            <p className="font-body text-sm font-medium text-muted-foreground sm:text-base">
              Zero-Wait Digital Triage & Real-Time Queue Orchestration.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-panel"
                          : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
              onClick={() => setIsDark((value) => !value)}
              type="button"
            >
              {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </button>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
