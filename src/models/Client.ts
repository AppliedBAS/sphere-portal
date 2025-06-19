import { DocumentData, DocumentReference, FirestoreDataConverter, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';

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

export const clientConverter: FirestoreDataConverter<Client> = {
    toFirestore(client: Client): DocumentData {
        return {
            active: client.active,
            buildings: client.buildings.map(building => ({
                "city-state-zip": building.cityStateZip,
                "service-address1": building.serviceAddress1,
                "service-address2": building.serviceAddress2,
                "contact-name": building.contactName,
                "contact-email": building.contactEmail,
                "contact-phone": building.contactPhone,
            })),
            "client-name": client.clientName,
            name: client.name,
            "updated-at": client.updatedAt,
            "created-at": client.createdAt,
            "project-ref": client.projectRef
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): Client {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            active: data.active,
            buildings: data.buildings,
            clientName: data["client-name"],
            name: data.name,
            updatedAt: data["updated-at"],
            createdAt: data["created-at"],
            projectRef: data["project-ref"]
        };
    }
}

export interface ClientHit {
    objectID: string;
    clientName: string;
    active: boolean;
    buildings: Building[];
}