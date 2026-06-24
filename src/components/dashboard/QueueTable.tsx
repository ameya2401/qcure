import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QueueStatusPill } from "@/components/dashboard/QueueStatusPill";
import { formatMinutes } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import type { QueueRow } from "@/types/queue";

export function QueueTable({ rows }: { rows: QueueRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live queue</CardTitle>
        <CardDescription>Realtime queue position, status, and expected wait.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Estimated Wait</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono font-semibold">{row.token}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {row.name}
                    {row.isPriority && (
                      <Badge tone="danger">Priority</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <QueueStatusPill status={row.status} />
                </TableCell>
                <TableCell>{row.position ?? "-"}</TableCell>
                <TableCell>{formatMinutes(row.estimatedWait)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
