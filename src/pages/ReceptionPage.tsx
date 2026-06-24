import { AlertTriangle, Clock3, UsersRound, Workflow } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PatientRegistrationForm } from "@/components/dashboard/PatientRegistrationForm";
import { QueueTable } from "@/components/dashboard/QueueTable";
import { ClinicSettingsPanel } from "@/components/dashboard/ClinicSettingsPanel";
import { QueueTimeline } from "@/components/dashboard/QueueTimeline";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { KioskQrDialog } from "@/components/dashboard/KioskQrDialog";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueueSnapshot } from "@/hooks/useQueueSnapshot";
import { useRealtimeQueue } from "@/hooks/useRealtimeQueue";
import { useQueueMutations } from "@/hooks/useQueueMutations";
import { formatMinutes, formatQueueHealth } from "@/utils/format";

export function ReceptionPage() {
  useRealtimeQueue();
  const snapshotQuery = useQueueSnapshot();
  const mutations = useQueueMutations();

  if (snapshotQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (snapshotQuery.isError || !snapshotQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Queue unavailable</CardTitle>
          <CardDescription>
            The dashboard could not load the clinic snapshot. Check Supabase configuration or use
            the built-in demo mode.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const snapshot = snapshotQuery.data;
  const { metrics, analytics } = snapshot;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Current token"
          value={metrics.currentToken ?? "Idle"}
          caption="Displayed on the waiting-room screen instantly."
          tone="info"
        />
        <MetricCard
          label="Waiting patients"
          value={String(metrics.waitingPatients)}
          caption="People currently waiting to be called."
          tone="warning"
        />
        <MetricCard
          label="Served today"
          value={String(metrics.patientsServedToday)}
          caption="Completed consultations since midnight."
          tone="success"
        />
        <MetricCard
          label="Avg consult"
          value={formatMinutes(metrics.averageConsultationDuration)}
          caption="Based on real completed consultation durations."
          tone="neutral"
        />
        <MetricCard
          label="Estimated queue"
          value={formatMinutes(metrics.estimatedQueueTime)}
          caption={`${formatQueueHealth(analytics.queueHealth)} queue health`}
          tone={
            analytics.queueHealth === "GREEN"
              ? "success"
              : analytics.queueHealth === "YELLOW"
                ? "warning"
                : "danger"
          }
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <PatientRegistrationForm
            isPending={mutations.addPatient.isPending}
            onSubmit={(values) => mutations.addPatient.mutate(values)}
          />
          <QueueTable rows={snapshot.queueRows} />
          <AnalyticsChart patients={snapshot.patients} />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Queue controls</CardTitle>
              <CardDescription>
                Atomic queue advancement backed by RPC functions and realtime broadcasts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  className="w-full"
                  disabled={mutations.callNextPatient.isPending}
                  onClick={() => mutations.callNextPatient.mutate()}
                  size="lg"
                  type="button"
                >
                  <Workflow className="h-4 w-4" />
                  {mutations.callNextPatient.isPending ? "Calling..." : "Call Next Patient"}
                </Button>
                <Button
                  className="w-full"
                  disabled={mutations.completeConsultation.isPending}
                  onClick={() => mutations.completeConsultation.mutate()}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  <Clock3 className="h-4 w-4" />
                  {mutations.completeConsultation.isPending
                    ? "Completing..."
                    : "Complete Current"}
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-muted/70 p-4">
                  <UsersRound className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-2xl font-semibold">{metrics.queueLength}</p>
                  <p className="text-sm text-muted-foreground">Current queue length</p>
                </div>
                <div className="rounded-3xl bg-muted/70 p-4">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-2xl font-semibold">{metrics.peakQueueLength}</p>
                  <p className="text-sm text-muted-foreground">Peak queue length</p>
                </div>
                <div className="rounded-3xl bg-muted/70 p-4">
                  <Clock3 className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-2xl font-semibold">
                    {metrics.receptionEfficiencyScore}/hr
                  </p>
                  <p className="text-sm text-muted-foreground">Reception efficiency score</p>
                </div>
              </div>
              <div className="pt-2">
                <KioskQrDialog />
              </div>
            </CardContent>
          </Card>
          <ClinicSettingsPanel
            defaultConsultationTime={snapshot.settings.defaultConsultationTime}
            isPending={mutations.updateClinicSettings.isPending}
            onSave={(value) => mutations.updateClinicSettings.mutate({ defaultConsultationTime: value })}
            usingHistoricalAverage={snapshot.usingHistoricalAverage}
          />
          <QueueTimeline events={snapshot.queueEvents} />
        </div>
      </section>
    </div>
  );
}
