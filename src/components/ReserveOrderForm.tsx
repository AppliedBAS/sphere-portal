"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { firestore } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  Firestore,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { PurchaseOrder, purchaseOrderConverter } from "@/models/PurchaseOrder";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { reservePO } from "@/services/orderService";
import VendorSelect from "./VendorSelect";
import { VendorHit } from "@/models/Vendor";

export default function ReserveOrderForm() {
  const [vendor, setVendor] = useState<VendorHit | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { firebaseUser } = useAuth();

  const handleReserve = async () => {
    if (!vendor) {
      return;
    }
    if (!firebaseUser) {
      return;
    }

    setLoading(true);

    try {
      const docId: number = await reservePO();
      const data: PurchaseOrder = {
        vendor: vendor.name,
        createdAt: Timestamp.now(),
        status: "OPEN",
        amount: 0,
        description: "",
        docId: docId,
        id: crypto.randomUUID(), // Generate a unique ID
        otherCategory: null,
        projectDocId: null,
        serviceReportDocId: null,
        technicianRef: doc(firestore, "employees", firebaseUser.id),
      };
      const collectionRef = collection(firestore, "orders").withConverter(
        purchaseOrderConverter
      );
      const docRef = await addDoc(collectionRef, data);
      // Redirect to edit page for the new PO
      router.push(`/dashboard/purchase-orders/${docRef.id}/edit`);
    } catch (e) {
      toast.error("Failed to reserve purchase order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleReserve();
      }}
      className="space-y-6 max-w-md"
    >
      <div className="grid gap-2">
        <label htmlFor="vendor" className="font-medium">
          Vendor
        </label>
        <VendorSelect selectedVendor={vendor} setSelectedVendor={setVendor} />
      </div>
      <div className="">
        <Button type="submit" disabled={loading || !vendor} className="w-full">
          {loading ? "Reserving..." : "Reserve PO"}
        </Button>
      </div>
    </form>
  );
}
