import { DocumentData, DocumentSnapshot, FirestoreDataConverter, Timestamp } from "firebase/firestore";

export interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string;
    active: boolean;
    clientId: string;
    clientSecret: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    policy: string[];
    role?: string; // Optional role field
}

export const employeeConverter: FirestoreDataConverter<Employee> = {
    toFirestore(employee: Employee): DocumentData {
        return {
            "name": employee.name,
            "email": employee.email,
            "phone": employee.phone,
            "active": employee.active,
            "client-id": employee.clientId,
            "client-secret": employee.clientSecret,
            "created-at": employee.createdAt,
            "updated-at": employee.updatedAt,
            "policy": employee.policy,
            "role": employee.role, // Optional field
        };
    },
    fromFirestore(snapshot: DocumentSnapshot): Employee {
        const data = snapshot.data()!;
        return {
            id: snapshot.id,
            name: data["name"],
            email: data["email"],
            phone: data["phone"],
            active: data["active"],
            clientId: data["client-id"],
            clientSecret: data["client-secret"],
            createdAt: data["created-at"],
            updatedAt: data["updated-at"],
            policy: data["policy"] || [],
            role: data["role"], // Optional field
        };
    }
}