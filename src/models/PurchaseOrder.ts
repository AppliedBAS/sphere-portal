import { DocumentReference, Timestamp } from 'firebase/firestore';

export interface PurchaseOrder {
    amount: number;
    createdAt: Timestamp;
    description: string;
    docId: number;
    id: string;
    otherCategory?: string;
    projectDocId?: number;
    serviceReportDocId?: number;
    status: string;
    technicianRef: DocumentReference;
    vendor: string;
}