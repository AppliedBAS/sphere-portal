import { DocumentReference, Timestamp } from "firebase/firestore";

export interface ProjectReport {
  id: string;
  docId: number;
  projectDocId: number;
  clientName: string;
  location: string;
  description: string;
  notes: string;
  materials: string;
  draft: boolean;
  createdAt: Timestamp;
  authorTechnicianRef: DocumentReference;
  leadTechnicianRef?: DocumentReference;
  assignedTechniciansRef?: DocumentReference[];
}

export interface ProjectReportMessage {
  technician_name: string;
  technician_phone: string;
  technician_email: string;
  location: string;
  description: string;
  project_id: number;
  doc_id: number;
  project_subtitle: string;
  date: string;
  client_name: string;
  materials: string;
  notes: string;
}
