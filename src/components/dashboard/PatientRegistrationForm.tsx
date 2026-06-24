import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().trim().min(2, "Patient name must be at least 2 characters"),
});

type FormValues = z.infer<typeof schema>;

export function PatientRegistrationForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (values: FormValues) => void;
  isPending: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add patient</CardTitle>
        <CardDescription>Issue a digital token in a single action.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4 sm:flex-row"
          onSubmit={form.handleSubmit((values) => {
            onSubmit(values);
            form.reset();
          })}
        >
          <div className="flex-1">
            <Input placeholder="Patient name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="mt-2 text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <Button className="sm:min-w-44" disabled={isPending} type="submit">
            <UserPlus className="h-4 w-4" />
            {isPending ? "Assigning..." : "Assign Token"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
