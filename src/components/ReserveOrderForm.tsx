"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { firestore } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { PurchaseOrder, purchaseOrderConverter } from "@/models/PurchaseOrder";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { reservePO } from "@/services/orderService";
import VendorSelect from "./VendorSelect";
import { VendorHit } from "@/models/Vendor";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export default function ReserveOrderForm() {
  const [vendor, setVendor] = useState<VendorHit | null>(null);
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState<number | null>(null);
  const [poDialogOpen, setPoDialogOpen] = useState(false);
  const [docRef, setDocRef] = useState<string | null>(null);
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
      const poId: number = await reservePO();
      const data: PurchaseOrder = {
        vendor: vendor.name,
        createdAt: Timestamp.now(),
        status: "OPEN",
        amount: 0,
        description: "",
        docId: poId,
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
      setDocId(poId);
      setPoDialogOpen(true);
      setDocRef(docRef.id);
    } catch (error) {
      toast.error("Failed to reserve purchase order. Please try again.");
      console.error("Error reserving purchase order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    try {
      router.push(`/dashboard/purchase-orders/${docRef!}/edit`);
    } catch (error) {
      toast.error("Failed to redirect. Please try again.");
      console.error("Error redirecting:", error);
    }
  };

  return (
    <>
      {/* Dialog for PO docId */}
      {!loading && docId && (
        <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>PO Reserved</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              Your purchase order was reserved successfully.
            </div>
            <DialogFooter>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleReserve();
        }}
        className="space-y-6"
      >
        <div className="grid gap-2">
          <label htmlFor="vendor" className="font-medium">
            Vendor
          </label>
          <VendorSelect selectedVendor={vendor} setSelectedVendor={setVendor} />
        </div>
        <div className="mt-8 flex gap-4 mb-8 justify-baseline items-center">
          <Button
            type="submit"
            disabled={loading || !vendor}
            className="w-full md:max-w-96"
          >
            {loading ? "Reserving..." : "Reserve PO"}
          </Button>
          {loading && (
            <div className="my-auto">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </form>
    </>
  );
}
