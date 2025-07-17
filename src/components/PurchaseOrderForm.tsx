"use client";
import React, { useEffect, useState } from "react";
import { PurchaseOrder, purchaseOrderConverter, PurchaseOrderMessage } from "@/models/PurchaseOrder";
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
import ProjectReportSelect from "./ProjectReportSelect";
import { ServiceReport } from "@/models/ServiceReport";
import { ProjectReport } from "@/models/ProjectReport";
import { fetchDraftProjectReports, fetchDraftServiceReports } from "@/services/reportService";
import { Textarea } from "./ui/textarea";
import ServiceReportSelect from "./ServiceReportSelect";

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
  const [projectReports, setProjectReports] = useState<ProjectReport[]>([]);
  const [serviceReports, setServiceReports] = useState<ServiceReport[]>([]);
  const [selectedProjectReport, setSelectedProjectReport] = useState<ProjectReport | null>(null);
  const [selectedServiceReport, setSelectedServiceReport] = useState<ServiceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryType, setCategoryType] = useState<
    "other" | "project" | "service" | null
  >(null);

  const canSubmit: boolean = !!description && !!amount && !!vendor && (
    (categoryType === "project" && !!selectedProjectReport) ||
    (categoryType === "service" && !!selectedServiceReport) ||
    (categoryType === "other" && !!otherCategory)
  );

  useEffect(() => {
    async function initForm() {
      if (!purchaseOrder) return;

      setLoading(true);
      if (purchaseOrder.vendor) {
        const vendorData: Vendor | null = await fetchVendorByName(
          purchaseOrder.vendor
        );

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

      const draftPR = await fetchDraftProjectReports();
      const draftSR = await fetchDraftServiceReports();

      if (purchaseOrder.projectDocId) {
        const projectReport = draftPR.find(
          (r) => r.projectDocId === purchaseOrder.projectDocId
        );

        setSelectedProjectReport(projectReport || null);
        setCategoryType("project");
      } else if (purchaseOrder.serviceReportDocId) {
        const serviceReport = draftSR.find(
          (r) => r.docId === purchaseOrder.serviceReportDocId
        );
        setSelectedServiceReport(serviceReport || null);
        setCategoryType("service");
      } else if (purchaseOrder.otherCategory) {
        setOtherCategory(purchaseOrder.otherCategory);
        setCategoryType("other");
      } else {
        setCategoryType("other");
      }

      setProjectReports(draftPR);
      setServiceReports(draftSR);
      setLoading(false);
    }
    initForm();
  }, []);

  // Only show the input for the selected category, set others to null
  useEffect(() => {
    if (categoryType === "other") {
      setSelectedProjectReport(null);
      setSelectedServiceReport(null);
    } else if (categoryType === "project") {
      setOtherCategory("");
      setSelectedServiceReport(null);
    } else if (categoryType === "service") {
      setOtherCategory("");
      setSelectedProjectReport(null);
    }
  }, [purchaseOrder, categoryType]);

  // const handleFiles = (files: FileList | null) => {
  //   if (!files) return;
  //   Array.from(files).forEach((file) => {
  //     console.log('Selected file:', file.name, file.size);
  //   });
  // };

  // Save as draft
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const orderRef = doc(firestore, "orders", purchaseOrder.id).withConverter(
        purchaseOrderConverter
      );
      const data: PurchaseOrder = {
        amount: amount,
        createdAt: purchaseOrder.createdAt,
        description: description,
        docId: purchaseOrder.docId,
        id: purchaseOrder.id,
        otherCategory: otherCategory || null,
        projectDocId: selectedProjectReport ? Number(selectedProjectReport.projectDocId) : null,
        serviceReportDocId: selectedServiceReport ? Number(selectedServiceReport.docId) : null,
        status: "OPEN",
        technicianRef: purchaseOrder.technicianRef,
        vendor: vendor ? vendor.name : "",
      };
      await setDoc(orderRef, data, { merge: true });

      toast.success("Draft saved successfully!");
    } catch (error) {
      toast.error("Failed to save draft. Try again later.");
      console.error("Error saving draft:", error);
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
        project_info: selectedProjectReport
          ? `${selectedProjectReport.projectDocId} - ${selectedProjectReport.docId} - ${selectedProjectReport.clientName} - ${selectedProjectReport.location}`
          : null,
        service_report_info: selectedServiceReport
          ? `${selectedServiceReport.docId}`
          : null,
        other: otherCategory || null,
        vendor: vendor ? vendor.name : "",
        technician_name: technician ? technician.name : "",
        technician_phone: technician ? technician.phone : "",
        technician_email: technician ? technician.email : "",
      };

      // check that only 1 of the 3 category fields is set
      if (
        (categoryType === "project" && !selectedProjectReport) ||
        (categoryType === "service" && !selectedServiceReport) ||
        (categoryType === "other" && !otherCategory)
      ) {
        toast.error(
          "Please fill in the required fields for the selected category."
        );
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

      const orderRef = doc(firestore, "orders", purchaseOrder.id).withConverter(purchaseOrderConverter);
      const data: PurchaseOrder = {
        amount: amount,
        createdAt: purchaseOrder.createdAt,
        description: description,
        docId: purchaseOrder.docId,
        id: purchaseOrder.id,
        otherCategory: otherCategory || null,
        projectDocId: selectedProjectReport ? Number(selectedProjectReport.projectDocId) : null,
        serviceReportDocId: selectedServiceReport ? Number(selectedServiceReport.docId) : null,
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
      console.error("Error submitting purchase order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    try {
      window.location.href = `/dashboard/purchase-orders/${submittedOrderId!}`;
    } catch (error) {
      toast.error("Failed to redirect. Please try again.");
      console.error("Error redirecting:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Submit Success Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Submitted</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Your purchase order was sent successfully.
          </div>
          <DialogFooter>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="docId">PO Number</Label>
          <Input
            id="docId"
            value={purchaseOrder.docId}
            readOnly
            className="w-full md:max-w-96"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="vendor">Vendor *</Label>
          <VendorSelect
            selectedVendor={vendor}
            setSelectedVendor={setVendor}
            placeholder="Select a vendor"
          />
        </div>
        <div className="grid gap-2">
          <Label>Attach To *</Label>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={categoryType === "service"}
                onCheckedChange={(checked) =>
                  checked ? setCategoryType("service") : setCategoryType(null)
                }
                id="switch-service"
              />
              <Label htmlFor="switch-service">Service Report</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={categoryType === "project"}
                onCheckedChange={(checked) =>
                  checked ? setCategoryType("project") : setCategoryType(null)
                }
                id="switch-project"
              />
              <Label htmlFor="switch-project">Project Report</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={categoryType === "other"}
                onCheckedChange={(checked) =>
                  checked ? setCategoryType("other") : setCategoryType(null)
                }
                id="switch-other"
              />
              <Label htmlFor="switch-other">Other</Label>
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
              className="w-full md:max-w-96"
              placeholder="e.g. Truck Stock, Software License"
            />
          </div>
        )}
        {categoryType === "project" && (
          <div className="grid gap-2">
            <Label htmlFor="projectDocId">Project</Label>
            <ProjectReportSelect
              selectedReport={selectedProjectReport}
              setSelectedReport={setSelectedProjectReport}
              reports={projectReports}
            />
          </div>
        )}
        {categoryType === "service" && (
          <div className="grid gap-2">
            <Label htmlFor="serviceReportDocId">Service Report</Label>
            <ServiceReportSelect
              selectedReport={selectedServiceReport}
              setSelectedReport={setSelectedServiceReport}
              reports={serviceReports}
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full md:max-w-96"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[80px]"
          />
        </div>
        {/* <div className="grid gap-2">
          <Label htmlFor="receipts">Receipts</Label>
          <FileSelectButton
            onFilesSelected={handleFiles}
            multiple
            accept=".pdf, image/*"
            label="Upload Files"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          />
        </div> */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || isSubmitting}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isSubmitting || !canSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          {(isSubmitting || isSaving) && (
            <div className="my-auto">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </form>
    </>
  );
}
