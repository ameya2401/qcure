import { ArrowUpRight, MonitorPlay, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQueueSnapshot } from "@/hooks/useQueueSnapshot";
import { useRealtimeQueue } from "@/hooks/useRealtimeQueue";
import { formatMinutes } from "@/utils/format";

export function WaitingRoomPage() {
  useRealtimeQueue();
  const snapshotQuery = useQueueSnapshot();

  if (!snapshotQuery.data) {
    return null;
  }

  const { metrics } = snapshotQuery.data;
  const upcoming = metrics.nextTokens;

  return (
    <div className="space-y-6">
      <section className="rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,rgba(8,145,178,0.94),rgba(15,23,42,0.92))] p-6 text-white shadow-panel sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-100/80">
              Waiting Room Display
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
              Now serving
            </h2>
          </div>
          <Badge tone="info">
            <MonitorPlay className="mr-2 h-3.5 w-3.5" />
            Realtime
          </Badge>
        </div>
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-display text-7xl font-semibold leading-none sm:text-9xl">
              {metrics.currentToken ?? "----"}
            </p>
            <p className="mt-4 max-w-xl text-lg text-cyan-50/80">
              Patients see changes instantly as the receptionist advances the queue.
            </p>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-3 lg:max-w-2xl">
            <Card className="border-white/10 bg-white/10 text-white">
              <CardContent className="p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-cyan-100/70">Ahead of you</p>
                <p className="mt-3 text-4xl font-semibold">{metrics.waitingPatients}</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/10 text-white">
              <CardContent className="p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-cyan-100/70">Estimated wait</p>
                <p className="mt-3 text-4xl font-semibold">
                  {formatMinutes(metrics.estimatedQueueTime)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/10 text-white">
              <CardContent className="p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-cyan-100/70">Waiting total</p>
                <p className="mt-3 text-4xl font-semibold">{metrics.totalWaitingPatients}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-display text-2xl font-semibold">Queue summary</h3>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl bg-muted/70 p-5">
                <p className="text-sm text-muted-foreground">Current queue length</p>
                <p className="mt-2 text-3xl font-semibold">{metrics.queueLength}</p>
              </div>
              <div className="rounded-3xl bg-muted/70 p-5">
                <p className="text-sm text-muted-foreground">Average consultation</p>
                <p className="mt-2 text-3xl font-semibold">
                  {formatMinutes(metrics.averageConsultationDuration)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                  Upcoming queue
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold">Next 10 tokens</h3>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {upcoming.length ? (
                upcoming.map((patient) => (
                  <div
                    key={patient.id}
                    className="rounded-3xl border border-border/70 bg-background/80 p-5"
                  >
                    <p className="font-mono text-sm uppercase tracking-[0.18em] text-primary">
                      {patient.token}
                    </p>
                    <p className="mt-2 text-xl font-semibold">{patient.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Wait {formatMinutes(patient.estimatedWait)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
                  The queue is clear right now. New patients appear here instantly.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
