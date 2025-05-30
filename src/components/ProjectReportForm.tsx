"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ProjectSelect from "./ProjectSelect";
import { ProjectHit } from "@/models/ProjectHit";
import { useAuth } from "@/contexts/AuthContext";
import { getEmployeeByEmail } from "@/lib/services";
import { generateProjectReportPdf } from "@/lib/services";
import { toast } from "sonner";
import EmployeeSelect from "./EmployeeSelect";
import { Employee } from "@/models/Employee";

// ————————————
// Zod schema
// ————————————
const projectReportSchema = z.object({
  notes: z.string().optional(),
  materialNotes: z.string().optional(),
});

type ProjectReportFormValues = z.infer<typeof projectReportSchema>;

// ————————————
// Component
// ————————————
export default function ProjectReportForm() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<ProjectHit | null>(
    null
  );
  const [selectedLeadEmployee, setSelectedLeadEmployee] = useState<Employee | null>(null);
  
  const [employeeInfo, setEmployeeInfo] = useState<null | {
    name: string;
    phone: string;
    clientId: string;
    clientSecret: string;
  }>(null);

  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProjectReportFormValues>({
    resolver: zodResolver(projectReportSchema),
    defaultValues: { notes: "", materialNotes: "" },
  });

  // ————————————
  // Load employee data once the user is known
  // ————————————
  useEffect(() => {
    if (!user?.email) return;

    (async () => {
      try {
        const info = await getEmployeeByEmail(user.email!);
        setEmployeeInfo(info);
      } catch (err) {
        console.error(err);
        toast.error("Could not load your profile data.");
      }
    })();
  }, [user?.email]);

  // ————————————
  // Form submission handler
  // ————————————
  const onSubmit = useCallback(
    async (values: ProjectReportFormValues) => {
      if (!selectedProject) {
        toast.warning("Please select a project first.");
        return;
      }
      if (!employeeInfo) {
        toast.warning("Waiting on your profile data. Try again in a moment.");
        return;
      }

      setSubmitting(true);
      try {
        await generateProjectReportPdf({
          project: selectedProject,
          values,
          employee: employeeInfo,
        }).then((data) => {
          const url = data.url;
          toast.success("PDF generated successfully!", {
            description: "Click to download your report.",
            action: {
              label: "Download",
              onClick: () => {
                window.open(url, "_blank");
              },
            },
          });
        });

        form.reset();
      } catch (err) {
        console.error(err);
        toast.error("Failed to generate PDF. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [selectedProject, employeeInfo, form]
  );

  return (
    <>
      <ProjectSelect
        selectedProject={selectedProject}
        setSelectedProject={(proj) => {
          setSelectedProject(proj);
        }}
      />
      <EmployeeSelect
        selectedEmployee={selectedLeadEmployee}
        setSelectedEmployee={(employee) => {
          setSelectedLeadEmployee(employee);
        }}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="What did you observe?"
                  />
                </FormControl>
                <FormDescription>
                  General observations or invoice notes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="materialNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Materials used or required."
                  />
                </FormControl>
                <FormDescription>Details about materials.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!selectedProject || submitting || !form.formState.isValid}
          >
            {submitting ? "Generating…" : "Submit Report"}
          </Button>
        </form>
      </Form>
    </>
  );
}
