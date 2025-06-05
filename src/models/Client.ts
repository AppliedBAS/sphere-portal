import { DocumentReference, Timestamp } from 'firebase/firestore';

export interface Building {
    cityStateZip: string;
    contactEmail: string;
    contactPhone: string;
    contactName: string;
    serviceAddress1: string;
    serviceAddress2: string;
}

export interface Client {
    active: boolean;
    buildings: Building[];
    clientName: string;
    name: string;
    updatedAt: Timestamp;
    id: string;
    createdAt: Timestamp;
    projectRef: DocumentReference[];
}

export interface ClientHit {
    objectID: string;
    clientName: string;
    active: boolean;
    buildings: Building[];
}