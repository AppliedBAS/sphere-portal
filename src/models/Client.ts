import { DocumentData, DocumentReference, FirestoreDataConverter, Timestamp } from 'firebase/firestore';

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
            buildings: client.buildings.map(bld => ({
                "city-state-zip": bld.cityStateZip,
                "contact-email": bld.contactEmail,
                "contact-phone": bld.contactPhone,
                "contact-name": bld.contactName,
                "service-address1": bld.serviceAddress1,
                "service-address2": bld.serviceAddress2
            })),
            "client-name": client.clientName,
            name: client.name,
            "updated-at": client.updatedAt,
            "created-at": client.createdAt,
            "project-ref": client.projectRef
        };
    },
    fromFirestore(snapshot): Client {
        const data = snapshot.data();
        return {
            active: data.active,
            buildings: data.buildings.map((bld: DocumentData) => ({
                cityStateZip: bld["city-state-zip"],
                contactEmail: bld["contact-email"],
                contactPhone: bld["contact-phone"],
                contactName: bld["contact-name"],
                serviceAddress1: bld["service-address1"],
                serviceAddress2: bld["service-address2"]
            })),
            clientName: data["client-name"],
            name: data.name,
            updatedAt: data.updatedAt,
            createdAt: data.createdAt,
            id: snapshot.id,
            projectRef: data.projectRef
        };
    }
};

export interface ClientHit {
    objectID: string;
    clientName: string;
    buildings: Building[];
}