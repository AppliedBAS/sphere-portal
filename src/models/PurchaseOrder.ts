import { DocumentData, DocumentReference, DocumentSnapshot, FirestoreDataConverter, Timestamp } from 'firebase/firestore';

export interface PurchaseOrder {
    amount: number;
    createdAt: Timestamp;
    description: string;
    docId: number;
    id: string;
    otherCategory: string | null;
    projectDocId: number | null;
    serviceReportDocId: number | null;
    status: string;
    technicianRef: DocumentReference;
    vendor: string;
}

export interface PurchaseOrderMessage {
    technician_name: string;
    technician_phone: string;
    technician_email: string;
    materials: string;
    purchase_order_num: number;
    project_info: string | null;
    service_report_info: string | null;
    other: string | null;
    vendor: string;
    amount: number;
    attachments: Attachment[];
}

export interface Attachment {
    content: string;
    type: string;
}

export const purchaseOrderConverter: FirestoreDataConverter<PurchaseOrder> = {
    toFirestore(purchaseOrder: PurchaseOrder): DocumentData {
        return {
            "amount": purchaseOrder.amount,
            "created-at": purchaseOrder.createdAt,
            "description": purchaseOrder.description,
            "doc-id": purchaseOrder.docId,
            "other-category": purchaseOrder.otherCategory,
            "project-doc-id": purchaseOrder.projectDocId,
            "service-report-doc-id": purchaseOrder.serviceReportDocId,
            "status": purchaseOrder.status,
            "technician-ref": purchaseOrder.technicianRef,
            "vendor": purchaseOrder.vendor,
        };
    },
    fromFirestore(snapshot: DocumentSnapshot): PurchaseOrder {
        const data = snapshot.data()!;
        return {
            id: snapshot.id,
            amount: data["amount"],
            createdAt: data["created-at"],
            description: data["description"],
            docId: data["doc-id"],
            otherCategory: data["other-category"],
            projectDocId: data["project-doc-id"],
            serviceReportDocId: data["service-report-doc-id"],
            status: data["status"],
            technicianRef: data["technician-ref"],
            vendor: data["vendor"],
        };
    }
};