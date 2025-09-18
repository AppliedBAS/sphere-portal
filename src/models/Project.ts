import { DocumentData, DocumentReference, FirestoreDataConverter, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";

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
  active: boolean;
  balance: number;
  createdAt: string; // ISO string from Firestore
}

export const projectConverter: FirestoreDataConverter<Project> = {
  toFirestore(project: Project): DocumentData {
    return {
      active: project.active,
      balance: project.balance,
      client: project.client,
      "created-at": project.createdAt,
      description: project.description,
      "doc-id": project.docId,
      id: project.id,
      location: project.location,
      "parent-ref": project.parentRef,
      "updated-at": project.updatedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Project {
    const data = snapshot.data();
    return {
      active: data.active,
      balance: data.balance,
      client: data.client,
      createdAt: data["created-at"] as Timestamp,
      description: data.description,
      docId: data["doc-id"] as number,
      id: snapshot.id,
      location: data.location,
      parentRef: data["parent-ref"] as DocumentReference,
      updatedAt: data["updated-at"] as Timestamp,
    };
  },
};