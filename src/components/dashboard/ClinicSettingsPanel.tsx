import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ClinicSettingsPanel({
  defaultConsultationTime,
  usingHistoricalAverage,
  onSave,
  isPending,
}: {
  defaultConsultationTime: number;
  usingHistoricalAverage: boolean;
  onSave: (value: number) => void;
  isPending: boolean;
}) {
  const [value, setValue] = useState(defaultConsultationTime);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic settings</CardTitle>
        <CardDescription>
          Fallback duration used before enough consultation history accumulates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-3xl bg-muted/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Duration strategy
          </p>
          <p className="mt-2 text-sm text-foreground">
            {usingHistoricalAverage
              ? "Historical consultation data is active."
              : "Using the clinic fallback duration until real averages exist."}
          </p>
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Default consultation duration (minutes)</span>
          <Input
            min={1}
            step={1}
            type="number"
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
          />
        </label>
        <Button
          disabled={isPending}
          variant="secondary"
          onClick={() => onSave(value)}
          type="button"
        >
          {isPending ? "Saving..." : "Save settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
