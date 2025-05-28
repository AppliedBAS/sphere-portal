"use client";

import React from "react";
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

// Zod schema for just notes and materialNotes
const projectReportSchema = z.object({
  notes: z.string().optional(),
  materialNotes: z.string().optional(),
});

type ProjectReportFormValues = z.infer<typeof projectReportSchema>;

export default function ProjectReportForm() {
  const form = useForm<ProjectReportFormValues>({
    resolver: zodResolver(projectReportSchema),
    defaultValues: {},
  });

  function onSubmit(values: ProjectReportFormValues) {
    console.log("Submitting report for project:", values);
    // Attach selected project and Firebase refs before sending to Firestore
  }

  return (
    <>
      <ProjectSelect />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormDescription>General observations or notes.</FormDescription>
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
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormDescription>Notes about materials used or required.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit Report</Button>
        </form>
      </Form>
    </>
  );
}
