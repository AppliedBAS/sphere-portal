"use client";
import React, { useEffect, useState } from "react";
import { getStorage, ref, uploadBytes, UploadResult } from "firebase/storage";
import {
  Attachment,
  PurchaseOrder,
  purchaseOrderConverter,
  PurchaseOrderMessage,
} from "@/models/PurchaseOrder";
import { Input } from "@/components/ui/input";
import { Project, projectConverter, ProjectHit } from "@/models/Project";
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
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { toast } from "sonner";
import VendorSelect from "./VendorSelect";
import { Vendor, VendorHit } from "@/models/Vendor";
import { fetchVendorByName } from "@/services/orderService";
import { Employee, employeeConverter } from "@/models/Employee";
import { Switch } from "@/components/ui/switch";
import { getEmployeeByEmail } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";
import { ServiceReport } from "@/models/ServiceReport";
import { fetchDraftServiceReports } from "@/services/reportService";
import { Textarea } from "./ui/textarea";
import ServiceReportSelect from "./ServiceReportSelect";
import { FileSelectButton } from "./FileselectButton";
import ProjectSelect from "./ProjectSelect";

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
  const [amount, setAmount] = useState<string>(
    purchaseOrder.amount?.toString() || ""
  );
  const [vendor, setVendor] = useState<VendorHit | null>(null);
  const [otherCategory, setOtherCategory] = useState(
    purchaseOrder.otherCategory || ""
  );
  const [serviceReports, setServiceReports] = useState<ServiceReport[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectHit | null>(
    null
  );
  const [selectedServiceReport, setSelectedServiceReport] =
    useState<ServiceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [categoryType, setCategoryType] = useState<
    "other" | "project" | "service" | null
  >(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const getAmountAsNumber = (): number => {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  };

  const canSubmit: boolean =
    !!description &&
    !!amount &&
    !isNaN(parseFloat(amount)) &&
    parseFloat(amount) > 0 &&
    !!vendor &&
    ((categoryType === "project" && !!selectedProject) ||
      (categoryType === "service" && !!selectedServiceReport) ||
      (categoryType === "other" && !!otherCategory)) &&
    uploadErrors.length === 0;

  // Upload receipt file to Firebase Storage
  const uploadReceipts = async (files: File[]): Promise<UploadResult[]> => {
    const storage = getStorage();
    const folder = `po-${purchaseOrder.docId!}`;
    const uploadPromises = files.map((file, index) => {
      // Try to get extension from file type first, fallback to filename
      let ext = "file";
      if (file.type && file.type.includes("/")) {
        ext = file.type.split("/")[1];
      } else if (file.name && file.name.includes(".")) {
        ext = file.name.split(".").pop() || "file";
      }
      const fileName = `attachment_${index}.${ext}`;
      const storageRef = ref(storage, `receipts/${folder}/${fileName}`);
      return uploadBytes(storageRef, file);
    });
    // Use allSettled to handle partial failures gracefully
    const results = await Promise.allSettled(uploadPromises);
    const successful: UploadResult[] = [];
    const errors: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push(result.value);
      } else {
        const fileName = files[index].name;
        const errorMessage = `Failed to upload ${fileName}`;
        errors.push(errorMessage);
        console.error(`Failed to upload file ${fileName}:`, result.reason);
        toast.error(`Failed to upload attachment: ${fileName}. Please try again or remove it.`);
      }
    });
    setUploadErrors(errors);
    return successful;
  }

  const buildAttachments = async (files: File[]): Promise<Attachment[]> => {
    const promises = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
              // Remove the data:*;base64, prefix, leave only the base64 value
              const base64 = result.split(",")[1] ?? "";
              resolve(base64);
            } else {
              reject(new Error("FileReader result is not a string"));
            }
          };
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        })
    );
    const results = await Promise.allSettled(promises);
    const attachments: Attachment[] = [];
    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        attachments.push({
          type: files[idx].type,
          content: result.value, // base64 only, no data: prefix
        });
      }
    });
    return attachments;
  };

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

      const draftSR = await fetchDraftServiceReports();

      if (purchaseOrder.projectDocId) {
        // Fetch the project by docId
        const q = query(
          collection(firestore, "projects").withConverter(projectConverter),
          where("doc-id", "==", purchaseOrder.projectDocId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const proj = snap.docs[0].data() as Project;
          setSelectedProject({
            objectID: snap.docs[0].id,
            docId: proj.docId,
            client: proj.client,
            description: proj.description,
            location: proj.location,
            active: proj.active,
            balance: proj.balance ?? 0,
            createdAt: proj.createdAt ? proj.createdAt.toDate().toISOString() : "",
          });
        }
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
      setServiceReports(draftSR);
      setLoading(false);
    }
    initForm();
  }, [purchaseOrder]);

  // Only show the input for the selected category, set others to null
  useEffect(() => {
    if (categoryType === "other") {
      setSelectedProject(null);
      setSelectedServiceReport(null);
    } else if (categoryType === "project") {
      setOtherCategory("");
      setSelectedServiceReport(null);
    } else if (categoryType === "service") {
      setOtherCategory("");
      setSelectedProject(null);
    }
  }, [purchaseOrder, categoryType]);

  // Warn user if they try to navigate away during upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = "Receipts are still uploading. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isUploading]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "image/heic",
      "image/heif",
      "image/tiff",
      "image/bmp",
      "image/gif",
    ];
    const newFilesArr = Array.from(files);
    const filteredFiles = newFilesArr.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type not allowed: ${file.name}`);
        return false;
      }
      return true;
    });
    setSelectedFiles((prev) => {
      const prevArr = prev || [];
      const uniqueFiles = filteredFiles.filter(
        (file) =>
          !prevArr.some((f) => f.name === file.name && f.size === file.size)
      );
      return [...prevArr, ...uniqueFiles];
    });
    // Clear upload errors when new files are selected
    setUploadErrors([]);
  };

  // Save as draft
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const orderRef = doc(firestore, "orders", purchaseOrder.id).withConverter(
        purchaseOrderConverter
      );
      const data: PurchaseOrder = {
        amount: getAmountAsNumber(),
        createdAt: purchaseOrder.createdAt,
        description: description,
        docId: purchaseOrder.docId,
        id: purchaseOrder.id,
        otherCategory: otherCategory || null,
        projectDocId: selectedProject ? selectedProject.docId : null,
        serviceReportDocId: selectedServiceReport
          ? Number(selectedServiceReport.docId)
          : null,
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
    
    // Prevent submission if any operation is already in progress
    if (isSaving || isSubmitting || isUploading) {
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to submit a purchase order.");
      return;
    }

    if (selectedFiles.length == 0) {
      toast.error("Please attach at least one receipt.");
      return;
    }

    // Validate category BEFORE uploading files to avoid orphaned uploads
    if (
      (categoryType === "project" && !selectedProject) ||
      (categoryType === "service" && !selectedServiceReport) ||
      (categoryType === "other" && !otherCategory)
    ) {
      toast.error(
        "Please fill in the required fields for the selected category."
      );
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadErrors([]); // Clear any previous upload errors
    setUploadProgress(`Uploading ${selectedFiles.length} receipt${selectedFiles.length > 1 ? 's' : ''}...`);

    try {
      const currentEmployee = await getEmployeeByEmail(user.email!);
      const token = btoa(
        `${currentEmployee.clientId}:${currentEmployee.clientSecret}`
      );
      const authorizationHeader = `Bearer ${token}`;

      // Upload receipts and wait for completion
      const uploadPaths: UploadResult[] = await uploadReceipts(selectedFiles);
      
      // Verify all uploads completed successfully
      if (uploadPaths.length < selectedFiles.length || uploadErrors.length > 0) {
        const failedCount = selectedFiles.length - uploadPaths.length;
        setIsUploading(false);
        setIsSubmitting(false);
        setUploadProgress("");
        toast.error(
          `Failed to upload ${failedCount} receipt${failedCount > 1 ? 's' : ''}. Please remove the failed attachments and try again.`
        );
        return;
      }

      setUploadProgress("Receipts uploaded successfully. Processing submission...");
      // Convert files to base64 for attachments (keep data: prefix)
      const attachments =
        selectedFiles.length > 0 ? await buildAttachments(selectedFiles) : [];

      const message: PurchaseOrderMessage = {
        amount: getAmountAsNumber(),
        materials: description,
        purchase_order_num: purchaseOrder.docId,
        project_info: selectedProject
          ? `${selectedProject.docId} - ${selectedProject.client} - ${selectedProject.location}`
          : null,
        service_report_info: selectedServiceReport
          ? `${selectedServiceReport.docId}`
          : null,
        other: otherCategory || null,
        vendor: vendor ? vendor.name : "",
        technician_name: technician ? technician.name : "",
        technician_phone: technician ? technician.phone : "",
        technician_email: technician ? technician.email : "",
        attachments: attachments,
      };

      const res = await fetch("https://api.appliedbas.com/v2/mail/po", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationHeader,
        },
        body: JSON.stringify(message),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error sending report");

      const orderRef = doc(firestore, "orders", purchaseOrder.id).withConverter(
        purchaseOrderConverter
      );
      const data: PurchaseOrder = {
        amount: getAmountAsNumber(),
        createdAt: purchaseOrder.createdAt,
        description: description,
        docId: purchaseOrder.docId,
        id: purchaseOrder.id,
        otherCategory: otherCategory || null,
        projectDocId: selectedProject ? selectedProject.docId : null,
        serviceReportDocId: selectedServiceReport
          ? Number(selectedServiceReport.docId)
          : null,
        status: "CLOSED",
        technicianRef: purchaseOrder.technicianRef,
        vendor: vendor ? vendor.name : "",
      };

      await setDoc(orderRef, data, { merge: true });

      setIsUploading(false);
      setUploadProgress("");
      setUploadErrors([]); // Clear upload errors on successful submission
      setSubmittedOrderId(purchaseOrder.id);
      setSubmitDialogOpen(true);

      toast.success("Purchase order submitted successfully!");
    } catch (error) {
      setIsUploading(false);
      setUploadProgress("");
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
          <div className="py-4">Your purchase order was sent successfully.</div>
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
        <div className="grid gap-4">
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
              <Label htmlFor="switch-project">Project</Label>
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
            <ProjectSelect
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
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
            type="text"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty string, or valid number format (with optional negative, digits, and single decimal point)
              if (
                value === "" ||
                value === "-" ||
                value === "." ||
                /^-?\d*\.?\d*$/.test(value)
              ) {
                setAmount(value);
              }
            }}
            onBlur={() => {
              // Validate and clean up on blur
              const parsed = parseFloat(amount);
              if (isNaN(parsed) || parsed <= 0) {
                // Keep the current value if it's invalid, user can fix it
                // Or clear it if empty
                if (amount.trim() === "") {
                  setAmount("");
                }
              } else {
                // Format to remove leading zeros and unnecessary decimals
                setAmount(parsed.toString());
              }
            }}
            className="w-full md:max-w-96"
            placeholder="0.00"
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="receipts">Receipts *</Label>
          <FileSelectButton
            onFilesSelected={handleFiles}
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.heic,.heif,.tiff,.bmp,.gif"
            label="Upload Files"
          />
          {selectedFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center bg-muted text-foreground px-3 py-1 rounded-full text-sm shadow border border-border max-w-xs truncate"
                  title={file.name}
                >
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    type="button"
                    className="ml-2 text-muted-foreground hover:text-destructive focus:outline-none"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => {
                      setSelectedFiles((prev) =>
                        prev.filter((_, i) => i !== idx)
                      );
                      // Clear upload errors when file is removed
                      setUploadErrors([]);
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          {uploadErrors.length > 0 && (
            <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm font-medium text-destructive mb-1">
                Upload Errors ({uploadErrors.length})
              </p>
              <ul className="text-sm text-destructive/80 list-disc list-inside space-y-1">
                {uploadErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Please remove the failed attachments before submitting.
              </p>
            </div>
          )}
        </div>
        {(isUploading || uploadProgress) && (
          <div className="flex items-center gap-2 p-4 bg-muted rounded-md border">
            <Loader2 className="animate-spin text-primary h-5 w-5" />
            <span className="text-sm font-medium">{uploadProgress || "Uploading receipts..."}</span>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || isSubmitting || isUploading}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isSubmitting || isUploading || !canSubmit}
          >
            {isUploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          {(isSubmitting || isSaving || isUploading) && (
            <div className="my-auto">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </form>
    </>
  );
}
