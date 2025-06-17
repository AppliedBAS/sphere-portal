import { z } from "zod";

export const ServiceNoteSchema = z.object({
  date: z.string().optional(),
  technicianTime: z.string(),
  technicianOvertime: z.string(),
  helperTime: z.string(),
  helperOvertime: z.string(),
  remoteWork: z.enum(["Y", "N"]),
  notes: z.string().optional(),
});

export const ServiceReportSchema = z.object({
  assignedTechnician: z.string().optional(),
  client: z.string().min(1),
  building: z.string().optional(),
  contact: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().regex(/^\d{10}$/),
  }),
  materialNotes: z.string().optional(),
  serviceNotes: z.array(ServiceNoteSchema).min(1),
});

export type ServiceReportFormValues = z.infer<typeof ServiceReportSchema>;