import { Timestamp } from "firebase/firestore";

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