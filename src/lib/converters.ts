import { ProjectReport } from "@/models/ProjectReport";
import { DocumentData, FirestoreDataConverter } from "firebase/firestore";

// Firestore object converters
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