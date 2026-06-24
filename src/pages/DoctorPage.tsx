import { Activity, Clock3, Stethoscope, TrendingUp, UserRoundCheck } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QueueTable } from "@/components/dashboard/QueueTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueueSnapshot } from "@/hooks/useQueueSnapshot";
import { useRealtimeQueue } from "@/hooks/useRealtimeQueue";
import { formatMinutes } from "@/utils/format";
import { Badge } from "@/components/ui/badge";

export function DoctorPage() {
  useRealtimeQueue();
  const snapshotQuery = useQueueSnapshot();

  if (!snapshotQuery.data) {
    return null;
  }

  const { metrics, analytics, queueRows } = snapshotQuery.data;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Current patient"
          value={metrics.activePatient?.name ?? "Waiting"}
          caption={metrics.activePatient?.token ?? "No active token"}
          tone="info"
        />
        <MetricCard
          label="Queue length"
          value={String(metrics.queueLength)}
          caption="Includes active and waiting patients."
          tone="warning"
        />
        <MetricCard
          label="Avg consultation"
          value={formatMinutes(metrics.averageConsultationDuration)}
          caption="Live clinical average from completed consultations."
          tone="neutral"
        />
        <MetricCard
          label="Served today"
          value={String(metrics.patientsServedToday)}
          caption="Patients completed in the current clinic day."
          tone="success"
        />
        <MetricCard
          label="Longest wait"
          value={formatMinutes(analytics.longestWaitTime)}
          caption="Longest expected wait among active queue entries."
          tone="danger"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Doctor cockpit</CardTitle>
            <CardDescription>
              Focused operational view designed for consultation flow, not receptionist tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(20,184,166,0.18),rgba(59,130,246,0.08))] p-5">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-5 w-5 text-primary" />
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                  Current patient
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-display text-4xl font-semibold">
                  {metrics.activePatient?.name ?? "No consultation active"}
                </p>
                {metrics.activePatient?.isPriority && (
                  <Badge tone="danger">Priority</Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {metrics.activePatient?.token ?? "Queue will surface here when the next patient is called."}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Activity,
                  label: "Queue health",
                  value: analytics.queueHealth,
                },
                {
                  icon: UserRoundCheck,
                  label: "Reception efficiency",
                  value: `${analytics.receptionEfficiencyScore}/hr`,
                },
                {
                  icon: Clock3,
                  label: "Peak queue length",
                  value: String(analytics.peakQueueLength),
                },
                {
                  icon: TrendingUp,
                  label: "Longest wait",
                  value: formatMinutes(analytics.longestWaitTime),
                },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-muted/70 p-5">
                  <item.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <QueueTable rows={queueRows.filter((patient) => patient.status !== "COMPLETED")} />
      </section>
    </div>
  );
}
