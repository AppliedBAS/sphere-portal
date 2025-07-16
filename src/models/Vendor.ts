import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";

export interface VendorHit {
  objectID: string;
  name: string;
  active: boolean;
  id: string;
}

export interface Vendor {
    active: boolean;
    createdAt: Timestamp;
    id: string;
    name: string;
    updatedAt: Timestamp;
}

export const vendorConverter: FirestoreDataConverter<Vendor> = {
  toFirestore(vendor: Vendor): DocumentData {
    return {
      active: vendor.active,
      "created-at": vendor.createdAt,
      id: vendor.id,
      name: vendor.name,
      "updated-at": vendor.updatedAt,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot
  ): Vendor {
    const data = snapshot.data();
    return {
      active: data.active,
      createdAt: data["created-at"],
      id: data.id,
      name: data.name,
      updatedAt: data["updated-at"],
    };
  },
};