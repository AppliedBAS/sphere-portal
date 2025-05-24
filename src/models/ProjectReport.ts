import { DocumentReference, Timestamp } from "firebase/firestore";

export interface ProjectReport {
  id: string;
  docId: number;
  projectDocId: number;
  clientName: string;
  location: string;
  description: string;
  notes: string;
  materialNotes: string;
  draft: boolean;
  createdAt: Timestamp;
  authorTechnicianRef: DocumentReference;
  leadTechnicianRef: DocumentReference;
  assignedTechniciansRef: DocumentReference[];
}
