import { DocumentData, DocumentReference, FirestoreDataConverter, Timestamp } from "firebase/firestore";

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

export interface ProjectReportPDFMessage {
    project_no: number;
    doc_id: number;
    project_subtitle: string;
    date: string;
    client_name: string;
    location: string;
    materials: string;
    notes: string;
    technician_name: string;
    technician_phone: string;
}

export const projectReportConverter: FirestoreDataConverter<ProjectReport> = {
    toFirestore: (report: ProjectReport): DocumentData => {
        return {
            id: report.id,
            "doc-id": report.docId,
            "project-doc-id": report.projectDocId,
            "client-name": report.clientName,
            location: report.location,
            description: report.description,
            notes: report.notes,
            "material-notes": report.materials,
            draft: report.draft,
            "created-at": report.createdAt,
            "author-technician-ref": report.authorTechnicianRef,
            "lead-technician-ref": report.leadTechnicianRef,
            "assigned-technicians-ref": report.assignedTechniciansRef
        };
    },
    fromFirestore: (snapshot: DocumentData): ProjectReport => {
        const data: DocumentData = snapshot.data();
        return {
            id: data.id,
            docId: data["doc-id"],
            projectDocId: data["project-doc-id"],
            clientName: data["client-name"],
            location: data.location,
            description: data.description,
            notes: data.notes,
            materials: data["material-notes"],
            draft: data.draft,
            createdAt: data["created-at"],
            authorTechnicianRef: data["author-technician-ref"],
            leadTechnicianRef: data["lead-technician-ref"],
            assignedTechniciansRef: data["assigned-technicians-ref"]
        } as ProjectReport;
    }
}
