import { DocumentReference, Timestamp } from "firebase/firestore";

export interface Project {
    active: boolean;
    balance: number;
    client: string;
    createdAt: Timestamp;
    description: string;
    docId: number;
    id: string;
    location: string;
    parentRef: DocumentReference;
    updatedAt: Timestamp;
}

export interface ProjectHit {
  objectID: string;
  docId: number;
  client: string;
  description: string;
  location: string;
}