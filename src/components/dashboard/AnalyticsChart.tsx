import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient } from "@/types/queue";

interface AnalyticsChartProps {
  patients: Patient[];
}

export function AnalyticsChart({ patients }: AnalyticsChartProps) {
  // Group patients by the hour they joined
  const hourlyData = patients.reduce((acc, patient) => {
    const date = new Date(patient.joinedAt);
    const hour = date.getHours();
    
    // Format hour (e.g. 9 AM)
    const formattedHour = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
    
    if (!acc[formattedHour]) {
      acc[formattedHour] = { hour: formattedHour, hourNumber: hour, patients: 0 };
    }
    
    acc[formattedHour].patients += 1;
    return acc;
  }, {} as Record<string, { hour: string; hourNumber: number; patients: number }>);

  // Convert to array and sort by hour
  const data = Object.values(hourlyData).sort((a, b) => a.hourNumber - b.hourNumber);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peak Hours Analytics</CardTitle>
        <CardDescription>Patient arrivals grouped by hour of the day to identify busy periods.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis 
                  dataKey="hour" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="currentColor" 
                  className="text-muted-foreground"
                />
                <YAxis 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="currentColor" 
                  className="text-muted-foreground"
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(14, 165, 233, 0.1)" }} 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    color: 'white'
                  }} 
                />
                <Bar 
                  dataKey="patients" 
                  name="Patients"
                  fill="#0ea5e9" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              Not enough data to display peak hours yet. Add some patients!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
