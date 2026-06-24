import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { QueueEvent } from "@/types/queue";

export function QueueTimeline({ events }: { events: QueueEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue activity</CardTitle>
        <CardDescription>Live event feed across patient registration and movement.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length ? (
          events.slice(0, 6).map((event) => (
            <div key={event.id} className="flex gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {event.eventType.replaceAll("_", " ")}
                  {event.token ? ` · ${event.token}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No queue activity yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
