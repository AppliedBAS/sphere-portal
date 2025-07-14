"use client";
import React, { useState } from "react";
import { PurchaseOrder } from "@/models/PurchaseOrder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Loader2 } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { toast } from "sonner";

interface PurchaseOrderFormProps {
  purchaseOrder: PurchaseOrder;
}

export default function PurchaseOrderForm({
  purchaseOrder,
}: PurchaseOrderFormProps) {
  const [description, setDescription] = useState(
    purchaseOrder.description || ""
  );
  const [amount, setAmount] = useState(purchaseOrder.amount || 0);
  const [vendor, setVendor] = useState(purchaseOrder.vendor || "");
  const [status, setStatus] = useState(purchaseOrder.status || "");
  const [otherCategory, setOtherCategory] = useState(
    purchaseOrder.otherCategory || ""
  );
  const [projectDocId, setProjectDocId] = useState(
    purchaseOrder.projectDocId || ""
  );
  const [serviceReportDocId, setServiceReportDocId] = useState(
    purchaseOrder.serviceReportDocId || ""
  );
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save as draft
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const orderRef = doc(firestore, "purchase orders", purchaseOrder.id);
      await setDoc(
        orderRef,
        {
          ...purchaseOrder,
          description,
          amount,
          vendor,
          status,
          otherCategory,
          projectDocId: projectDocId ? Number(projectDocId) : undefined,
          serviceReportDocId: serviceReportDocId
            ? Number(serviceReportDocId)
            : undefined,
          draft: true,
        },
        { merge: true }
      );
      toast.success("Draft saved successfully!");
    } catch (error) {
      toast.error("Failed to save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit (finalize)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const orderRef = doc(firestore, "purchase orders", purchaseOrder.id);
      await setDoc(
        orderRef,
        {
          ...purchaseOrder,
          description,
          amount,
          vendor,
          status,
          otherCategory,
          projectDocId: projectDocId ? Number(projectDocId) : undefined,
          serviceReportDocId: serviceReportDocId
            ? Number(serviceReportDocId)
            : undefined,
          draft: false,
        },
        { merge: true }
      );
      setSubmittedOrderId(purchaseOrder.id);
      setSubmitDialogOpen(true);
      toast.success("Purchase order submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit purchase order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Submit Success Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Submitted</DialogTitle>
          </DialogHeader>
          <div className="py-4">Your purchase order was submitted successfully.</div>
          <DialogFooter>
            <Button
              onClick={() => {
                window.location.href = `/dashboard/purchase-orders/${submittedOrderId}`;
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="vendor">Vendor</Label>
          <Input
            id="vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Input
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="otherCategory">Other Category</Label>
          <Input
            id="otherCategory"
            value={otherCategory}
            onChange={(e) => setOtherCategory(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="projectDocId">Project Doc ID</Label>
          <Input
            id="projectDocId"
            type="number"
            value={projectDocId}
            onChange={(e) => setProjectDocId(Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="serviceReportDocId">Service Report Doc ID</Label>
          <Input
            id="serviceReportDocId"
            type="number"
            value={serviceReportDocId}
            onChange={(e) => setServiceReportDocId(Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="technicianRef">Technician Ref</Label>
          <Input
            id="technicianRef"
            value={purchaseOrder.technicianRef?.id || ""}
            readOnly
            className="bg-muted"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || isSubmitting}
            className="w-1/2"
          >
            {isSaving ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4 inline" />
            ) : null}
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isSubmitting}
            className="w-1/2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4 inline" />
            ) : null}
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </>
  );
}
