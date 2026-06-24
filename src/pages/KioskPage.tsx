import { useState } from "react";
import { useQueueMutations } from "@/hooks/useQueueMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function KioskPage() {
  const mutations = useQueueMutations();
  const [name, setName] = useState("");
  const [assignedToken, setAssignedToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      const snapshot = await mutations.addPatient.mutateAsync({ name: name.trim() });
      
      // Find the most recently joined patient with this name
      const latestPatient = [...snapshot.patients]
        .filter(p => p.name === name.trim())
        .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())[0];
      
      if (latestPatient) {
        setAssignedToken(latestPatient.token);
        
        setTimeout(() => {
          setAssignedToken(null);
          setName("");
        }, 6000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (assignedToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 bg-[radial-gradient(circle_at_50%_50%,rgba(11,87,208,0.06),transparent_50%)]">
        <Card className="w-full max-w-md text-center border-primary/50 shadow-panel">
          <CardHeader className="pt-8">
            <CardTitle className="text-3xl text-primary">You're in the queue!</CardTitle>
            <CardDescription className="text-base mt-2">Please take a seat in the waiting area. Watch the screen for your token.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-10">
            <div className="text-sm font-medium uppercase tracking-widest text-muted-foreground mt-4">
              Your Token Number
            </div>
            <div className="text-8xl font-black text-foreground tracking-tighter my-6">
              {assignedToken}
            </div>
            <p className="text-sm text-muted-foreground animate-pulse mt-8">
              This screen will reset shortly for the next patient...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 bg-[radial-gradient(circle_at_20%_20%,rgba(11,87,208,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(196,219,255,0.2),transparent_40%)]">
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-panel text-primary border border-primary/10">
          <Activity className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Q-Cure Kiosk</h1>
        <p className="mt-2 text-lg text-muted-foreground">Self check-in for patients</p>
      </div>

      <Card className="w-full max-w-md shadow-panel border-white/50 backdrop-blur-sm bg-white/90 dark:bg-slate-950/90 dark:border-white/10">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Enter your full name to join the queue automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Patient Full Name</span>
              <Input
                placeholder="e.g. Rahul Menon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="h-14 text-lg bg-white dark:bg-slate-900"
              />
            </label>
            <Button 
              type="submit" 
              className="w-full h-14 text-lg rounded-xl" 
              disabled={!name.trim() || mutations.addPatient.isPending}
            >
              {mutations.addPatient.isPending ? "Adding to Queue..." : "Check In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
