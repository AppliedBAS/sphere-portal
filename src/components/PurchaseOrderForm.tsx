"use client";
import React, { useEffect, useState } from "react";
import { PurchaseOrder, PurchaseOrderMessage } from "@/models/PurchaseOrder";
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
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { toast } from "sonner";
import VendorSelect from "./VendorSelect";
import { Vendor, VendorHit } from "@/models/Vendor";
import { fetchVendorByName } from "@/services/orderService";
import { Employee, employeeConverter } from "@/models/Employee";
import { Switch } from "@/components/ui/switch";
import { getEmployeeByEmail } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";

interface PurchaseOrderFormProps {
  purchaseOrder: PurchaseOrder;
}

export default function PurchaseOrderForm({
  purchaseOrder,
}: PurchaseOrderFormProps) {
  const { user } = useAuth();
  const [technician, setTechnician] = useState<Employee | null>(null);
  const [description, setDescription] = useState(
    purchaseOrder.description || ""
  );
  const [amount, setAmount] = useState(purchaseOrder.amount || 0);
  const [vendor, setVendor] = useState<VendorHit | null>(null);
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
  const [categoryType, setCategoryType] = useState<"other" | "project" | "service" | null>(null);

  useEffect(() => {
    async function initForm() {
      if (!purchaseOrder) return;

      if (purchaseOrder.vendor) {
        const vendorData: Vendor | null = await fetchVendorByName(purchaseOrder.vendor);
        if (vendorData) {
          setVendor({
            objectID: vendorData.id,
            name: vendorData.name,
            active: vendorData.active,
            id: vendorData.id,
          });
        }
      }

      if (purchaseOrder.technicianRef) {
        const empSnap = await getDoc(
          purchaseOrder.technicianRef.withConverter(employeeConverter)
        );
        if (empSnap.exists()) {
          const emp = empSnap.data() as Employee;
          setTechnician(emp);
        }
      }
    }
    initForm();
  }, [])

  // Only show the input for the selected category, set others to null
  useEffect(() => {
    if (categoryType === "other") {
      setProjectDocId("");
      setServiceReportDocId("");
    } else if (categoryType === "project") {
      setOtherCategory("");
      setServiceReportDocId("");
    } else if (categoryType === "service") {
      setOtherCategory("");
      setProjectDocId("");
    }
  }, [categoryType]);

  // Save as draft
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const orderRef = doc(firestore, "orders", purchaseOrder.id);
      const data: PurchaseOrder = {
        amount: amount,
        createdAt: purchaseOrder.createdAt,
        description: description,
        docId: purchaseOrder.docId,
        id: purchaseOrder.id,
        otherCategory: otherCategory || null,
        projectDocId: projectDocId ? Number(projectDocId) : null,
        serviceReportDocId: serviceReportDocId ? Number(serviceReportDocId) : null,
        status: "OPEN",
        technicianRef: purchaseOrder.technicianRef,
        vendor: vendor ? vendor.name : "",
      };
      await setDoc(orderRef, data, { merge: true });

      toast.success("Draft saved successfully!");
    } catch (error) {
      toast.error("Failed to save draft. Try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit (finalize)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit a purchase order.");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentEmployee = await getEmployeeByEmail(user.email!);
      const token = btoa(
        `${currentEmployee.clientId}:${currentEmployee.clientSecret}`
      );
      const authorizationHeader = `Bearer ${token}`;
      const message: PurchaseOrderMessage = {
        amount: amount,
        attachment_content: [],
        attachment_name: [],
        materials: description,
        purchase_order_num: purchaseOrder.docId,
        project_info: projectDocId ? `${projectDocId}` : null,
        service_report_info: serviceReportDocId ? `${serviceReportDocId}` : null,
        other: otherCategory || null,
        vendor: vendor ? vendor.name : "",
        technician_name: technician ? technician.name : "",
        technician_phone: technician ? technician.phone : "",
        technician_email: technician ? technician.email : "",
      };

      // check that only 1 of the 3 category fields is set
      if (
        (categoryType === "project" && !projectDocId) ||
        (categoryType === "service" && !serviceReportDocId) ||
        (categoryType === "other" && !otherCategory)
      ) {
        toast.error("Please fill in the required fields for the selected category.");
        return;
      } 
      
      const res = await fetch("https://api.appliedbas.com/v1/mail/po", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationHeader,
        },
        body: JSON.stringify(message),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error sending report");

      const orderRef = doc(firestore, "orders", purchaseOrder.id);
      const data: PurchaseOrder = {
        amount: amount,
        createdAt: purchaseOrder.createdAt,
        description: description,
        docId: purchaseOrder.docId,
        id: purchaseOrder.id,
        otherCategory: otherCategory || null,
        projectDocId: projectDocId ? Number(projectDocId) : null,
        serviceReportDocId: serviceReportDocId ? Number(serviceReportDocId) : null,
        status: "CLOSED",
        technicianRef: purchaseOrder.technicianRef,
        vendor: vendor ? vendor.name : "",
      };
      await setDoc(orderRef, data, { merge: true });
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
          <Label htmlFor="vendor">Vendor</Label>
          <VendorSelect
            selectedVendor={vendor}
            setSelectedVendor={setVendor}
            placeholder="Select a vendor"
          />
        </div>
        <div className="grid gap-2">
          <Label>Category</Label>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={categoryType === "other"}
                onCheckedChange={checked => checked ? setCategoryType("other") : setCategoryType(null)}
                id="switch-other"
              />
              <Label htmlFor="switch-other">Other</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={categoryType === "project"}
                onCheckedChange={checked => checked ? setCategoryType("project") : setCategoryType(null)}
                id="switch-project"
              />
              <Label htmlFor="switch-project">Project Doc ID</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={categoryType === "service"}
                onCheckedChange={checked => checked ? setCategoryType("service") : setCategoryType(null)}
                id="switch-service"
              />
              <Label htmlFor="switch-service">Service Report Doc ID</Label>
            </div>
          </div>
        </div>
        {categoryType === "other" && (
          <div className="grid gap-2">
            <Label htmlFor="otherCategory">Other Category</Label>
            <Input
              id="otherCategory"
              value={otherCategory}
              onChange={(e) => setOtherCategory(e.target.value)}
            />
          </div>
        )}
        {categoryType === "project" && (
          <div className="grid gap-2">
            <Label htmlFor="projectDocId">Project Doc ID</Label>
            <Input
              id="projectDocId"
              type="number"
              value={projectDocId}
              onChange={(e) => setProjectDocId(Number(e.target.value))}
            />
          </div>
        )}
        {categoryType === "service" && (
          <div className="grid gap-2">
            <Label htmlFor="serviceReportDocId">Service Report Doc ID</Label>
            <Input
              id="serviceReportDocId"
              type="number"
              value={serviceReportDocId}
              onChange={(e) => setServiceReportDocId(Number(e.target.value))}
            />
          </div>
        )}
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
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
