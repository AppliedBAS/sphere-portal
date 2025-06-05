import { DocumentReference, Timestamp } from "firebase/firestore";


export interface ServiceReport {
    id: string;
    authorTechnicianRef: DocumentReference;
    cityStateZip: string;
    clientName: string;
    contactEmail: string;
    contactPhone: string;
    contactName: string;
    createdAt: Timestamp;
    dateSigned?: Timestamp;
    draft: boolean;
    materialNotes: string;
    printedName: string;
    serviceAddress1: string;
    serviceAddress2: string;
    serviceNotes: ServiceNote[];
}

export interface ServiceNote {
    date: Timestamp;
    helperOvertime: string;
    helperTime: string;
    remoteWork: string;
    serviceNotes: string;
    technicianOvertime: string;
    technicianTime: string;
}