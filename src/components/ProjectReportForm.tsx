"use client";

import { useState, useEffect, FormEvent } from "react";
import EmployeeSelect from "./EmployeeSelect";
import { Employee as EmployeeModel, employeeConverter } from "@/models/Employee";
import ProjectSelect from "@/components/ProjectSelect";
import { Button } from "./ui/button";
import { useEmployees } from "@/hooks/useEmployees";

import { ProjectReport, ProjectReportPDFMessage } from "@/models/ProjectReport";
import { toast } from "sonner";
import { Project, ProjectHit, projectConverter } from "@/models/Project";
import { getDoc, getDocs, query, where } from "firebase/firestore";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "./ui/input";
import { firestore } from "@/lib/firebase";
import { addDoc, setDoc, Timestamp, doc, collection } from "firebase/firestore";
import { reserveDocid } from "@/services/reportService";
import { getEmployeeByEmail } from "@/services/employeeService";
import { Loader2 } from "lucide-react";
import openAIClient from "@/lib/openai";
import { ProjectReportMessage } from "@/models/ProjectReport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { PurchaseOrder, purchaseOrderConverter } from "@/models/PurchaseOrder";

interface ProjectReportFormProps {
  projectReport?: ProjectReport;
}

export default function ProjectReportForm({
  projectReport,
}: ProjectReportFormProps) {
  const {
    technicians,
    loading: loadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useEmployees();
  const { user, firebaseUser } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [leadEmployee, setLeadEmployee] = useState<EmployeeModel | null>(null);
  const [assignedTechnicians, setAssignedTechnicians] = useState<
    EmployeeModel[]
  >([]);

  // Controlled state for the two textareas:
  const [notes, setNotes] = useState<string>(projectReport?.notes || "");
  const [additionalMaterials, setAdditionalMaterials] = useState<string>(
    projectReport?.materials || ""
  );

  const [authorTechnician, setAuthorTechnician] = useState<EmployeeModel | null>(null);
  const [isNewReport, setIsNewReport] = useState<boolean>(!projectReport);
  const [docId, setDocId] = useState<number>(projectReport?.docId || 0);
  const [project, setProject] = useState<ProjectHit | null>(null);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rephraseDialogOpen, setRephraseDialogOpen] = useState<boolean>(false);
  const [rephrase, setRephrase] = useState<string | null>(null);
  const [isRephrasing, setIsRephrasing] = useState<boolean>(false);
  const [linkPurchaseOrders, setLinkPurchaseOrders] = useState<boolean>(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loadingPurchaseOrders, setLoadingPurchaseOrders] = useState<boolean>(false);

  // If editing an existing report, load its values into state:
  useEffect(() => {
    async function initForm() {
      if (!projectReport) return;

      if (projectReport.projectDocId) {
        const projQ = query(
          collection(firestore, "projects").withConverter(projectConverter),
          where("doc-id", "==", projectReport.projectDocId)
        );
        const projSnap = await getDocs(projQ);
        if (!projSnap.empty) {
          const docSnap = projSnap.docs[0];
          const data = docSnap.data() as Project;
          setProject({
            objectID: docSnap.id,
            docId: data.docId,
            client: data.client,
            description: data.description,
            location: data.location,
          });
        }
      };

      // Load author technician from projectReport
      if (projectReport.authorTechnicianRef) {
        const empSnap = await getDoc(projectReport.authorTechnicianRef.withConverter(employeeConverter));
        if (empSnap.exists()) {
          const emp = empSnap.data() as EmployeeModel;
          setAuthorTechnician({
            ...emp,
            id: empSnap.id,
          });
        }
      }

      if (projectReport.leadTechnicianRef) {
        const employeeSnap = await getDoc(projectReport.leadTechnicianRef.withConverter(employeeConverter));
        if (employeeSnap.exists()) {
          const emp = employeeSnap.data() as EmployeeModel;
          setLeadEmployee({
            ...emp,
            id: employeeSnap.id,
          });
        }
      }

      if (projectReport.assignedTechniciansRef) {
        const assignedEmps: EmployeeModel[] = [];
        for (const ref of projectReport.assignedTechniciansRef) {
          const empDoc = await getDoc(ref);
          if (empDoc.exists()) {
            const d = empDoc.data();
            assignedEmps.push({
              id: empDoc.id,
              clientId: d["client-id"],
              clientSecret: d["client-secret"],
              createdAt: d["created-at"],
              updatedAt: d["updated-at"],
              ...d,
            } as EmployeeModel);
          }
        }
        setAssignedTechnicians(assignedEmps);
      }

      // Pre-fill controlled inputs if editing:
      setNotes(projectReport.notes || "");
      setAdditionalMaterials(projectReport.materials || "");

      // set report identifiers
      setDocId(projectReport.docId);
      setIsNewReport(false);
    }

    initForm();
  }, [projectReport]);

  useEffect(() => {
    if (firebaseUser) {
      setAuthorTechnician(firebaseUser);
    }
  }, [firebaseUser]);

  const handleAddTechnician = (emp: EmployeeModel) => {
    if (!assignedTechnicians.some((existing) => existing.id === emp.id)) {
      setAssignedTechnicians((prev) => [...prev, emp]);
    }
  };

  const handleRemoveTechnician = (empId: string) => {
    setAssignedTechnicians((prev) => prev.filter((e) => e.id !== empId));
  };

  // Fetch purchase orders if switch is enabled and project is selected
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      if (!linkPurchaseOrders || !project) {
        setPurchaseOrders([]);
        return;
      }
      setLoadingPurchaseOrders(true);

      try {
        const q = query(
          collection(firestore, "orders").withConverter(purchaseOrderConverter),
          where("project-doc-id", "==", project.docId)
        );
        const snap = await getDocs(q);
        const orders: PurchaseOrder[] = [];
        snap.forEach((doc) => orders.push(doc.data()));
        setPurchaseOrders(orders);
      } catch (err) {
        toast.error("Failed to fetch purchase orders");
      } finally {
        setLoadingPurchaseOrders(false);
      }
    };

    fetchPurchaseOrders();
  }, [linkPurchaseOrders, project]);

  // Helper to combine materials and purchase order descriptions
  function combineMaterials(materials: string, purchaseOrders: PurchaseOrder[], link: boolean): string {
    let poMaterials = "";
    if (link && purchaseOrders.length > 0) {
      poMaterials = purchaseOrders
        .map((po) => po.description?.trim())
        .filter(Boolean)
        .join("; ");
    }
    const allMaterials = [materials?.trim(), poMaterials].filter(Boolean).join("; ");
    return allMaterials.length > 0 ? allMaterials : "None";
  }

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setIsSubmitting(true);
    if (!user || !authorTechnician || !project) {
      toast.error("All fields are required");
      setIsSaving(false);
      setIsSubmitting(false);
      return;
    }
    try {
      let currentDoc = docId;
      if (isNewReport) {
        currentDoc = await reserveDocid();
        setDocId(currentDoc);
        setIsNewReport(false);
      }
      const data = {
        "project-doc-id": project.docId,
        "doc-id": currentDoc,
        "client-name": project.client,
        location: project.location,
        description: project.description,
        notes,
        materials: combineMaterials(additionalMaterials, purchaseOrders, linkPurchaseOrders),
        draft: true,
        "created-at": Timestamp.now(),
        "author-technician-ref": doc(firestore, "employees", authorTechnician.id),
        "lead-technician-ref": leadEmployee
          ? doc(firestore, "employees", leadEmployee.id)
          : null,
        "assigned-technicians-ref": assignedTechnicians.map((e) =>
          doc(firestore, "employees", e.id)
        ),
      };
      if (isNewReport) {
        await addDoc(collection(firestore, "project reports"), data);
      } else {
        await setDoc(
          doc(firestore, "project reports", projectReport!.id),
          data
        );
      }
      toast.success("Saved as draft");
      window.location.href = `/dashboard/project-reports/${projectReport?.id}/edit`;
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Error saving draft");
    } finally {
      setIsSaving(false);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!user || !authorTechnician || !project) {
      toast.error("All fields are required");
      setIsSubmitting(false);
      return;
    }
    try {
      let currentDoc = docId;
      if (isNewReport) {
        currentDoc = await reserveDocid();
        setDocId(currentDoc);
        setIsNewReport(false);
      }
      const data: ProjectReportMessage = {
        project_id: project.docId,
        doc_id: currentDoc,
        client_name: project.client,
        location: project.location,
        description: project.description,
        notes: notes,
        materials: combineMaterials(additionalMaterials, purchaseOrders, linkPurchaseOrders),
        date: new Date().toISOString(),
        project_subtitle: `PR ${project.docId} - ${currentDoc} - ${project.location}`,
        technician_email: authorTechnician.email!,
        technician_name: authorTechnician.name!,
        technician_phone: authorTechnician.phone!,
      };

      // Send report to API (v2)
      try {
        const currentEmployee = await getEmployeeByEmail(user.email!);
        const token = btoa(`${currentEmployee.clientId}:${currentEmployee.clientSecret}`);
        const authorizationHeader = `Bearer ${token}`;
        const res = await fetch("https://api.appliedbas.com/v2/mail/pr", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: authorizationHeader,
          },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Error sending report');
        toast.success("Report submitted successfully!");
        window.location.href = `/dashboard/project-reports/${projectReport?.id}`;
      } catch (error) {
        console.error("Error sending report:", error);
        toast.error("Error sending report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Error submitting report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRephrase = async () => {
    if (!notes) return;
    setIsRephrasing(true);
    setRephraseDialogOpen(true);
    try {
      const response = await openAIClient.responses.create({
        model: "gpt-4",
        instructions: "Rephrase the project report notes for clarity and professionalism.",
        input: notes,
      });
      setRephrase(response.output_text ?? "");
    } catch (error) {
      console.error("Error rephrasing notes:", error);
      toast.error("Failed to rephrase notes.");
    } finally {
      setIsRephrasing(false);
    }
  };

  const handleRephraseConfirm = () => {
    if (rephrase) {
      setNotes(rephrase);
      toast.success("Notes rephrased successfully!");
    }
    setRephrase(null);
    setRephraseDialogOpen(false);
  };

  // show loader until auth user loaded
  if (!user || !authorTechnician || (!project && projectReport)) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Preview handler: generate PDF preview
  const handlePreview = async () => {
    setIsPreviewing(true);
    if (!user || !authorTechnician || !project) {
      toast.error("All fields are required for preview");
      setIsPreviewing(false);
      return;
    }
    try {
      const currentEmployee = await getEmployeeByEmail(user.email!);
      const token = btoa(`${currentEmployee.clientId}:${currentEmployee.clientSecret}`);
      const authorizationHeader = `Bearer ${token}`;
      const dateStr = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
      const message: ProjectReportPDFMessage = {
        project_no: project.docId,
        doc_id: docId,
        project_subtitle: `PR ${project.docId} - ${docId} - ${project.location}`,
        date: dateStr,
        client_name: project.client,
        location: project.location,
        materials: combineMaterials(additionalMaterials, purchaseOrders, linkPurchaseOrders),
        notes: notes || 'None',
        technician_name: authorTechnician.name,
        technician_phone: authorTechnician.phone,
      };
      const res = await fetch("https://api.appliedbas.com/v1/pdf/pr", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorizationHeader,
        },
        body: JSON.stringify(message),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error generating preview');
      window.open(data.url, '_blank');
      toast.success("Preview generated successfully");
    } catch (error) {
      console.error('Preview error:', error);
      toast.error("Failed to generate preview");
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <>
      {/* AI Rephrase Dialog */}
      <Dialog open={rephraseDialogOpen} onOpenChange={setRephraseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rephrase</DialogTitle>
          </DialogHeader>
          {isRephrasing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              <span className="ml-2">Rephrasing...</span>
            </div>
          ) : (
            <Textarea value={rephrase ?? ""} readOnly rows={4} />
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                handleRephraseConfirm();
                setRephraseDialogOpen(false);
              }}
              disabled={!rephrase}
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              onClick={() => setRephraseDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <form onSubmit={handleSubmit}>
        <div className="mt-4 flex flex-col gap-2 mb-8">
          <Label htmlFor="project">
            Project *
          </Label>
          <ProjectSelect selectedProject={project} setSelectedProject={setProject} />

          {docId !== null && docId !== 0 && (
            <div className="flex flex-col space-y-2">
              <Label htmlFor="docId">
                Report No.
              </Label>
              <Input id="docId" type="text" className="w-full md:max-w-96" value={docId.toString()} readOnly />
            </div>
          )}

          <Label htmlFor="leadTechnician">
            Lead Technician
          </Label>
          <EmployeeSelect
            employees={technicians}
            loading={loadingEmployees}
            error={employeesError}
            refetch={refetchEmployees}
            selectedEmployee={leadEmployee}
            setSelectedEmployee={setLeadEmployee}
            placeholder="Select Lead Technician..."
          />
          <p className="text-base sm:text-sm text-muted-foreground mb-1">
            Leave blank if you are the lead technician.
          </p>

          <Label htmlFor="assignedTechnicians">
            Assigned Technicians
          </Label>
          <div className="flex flex-wrap gap-2">
            {assignedTechnicians.map((emp) => (
              <span
                key={emp.id}
                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {emp.name}
                <button
                  type="button"
                  onClick={() => handleRemoveTechnician(emp.id)}
                  className="ml-1 text-blue-500 hover:text-blue-800"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <EmployeeSelect
            employees={technicians}
            loading={loadingEmployees}
            error={employeesError}
            refetch={refetchEmployees}
            selectedEmployee={null}
            setSelectedEmployee={(empl) => {
              handleAddTechnician(empl as EmployeeModel);
            }}
            placeholder="Add Technician..."
          />

          <Label htmlFor="notes">
            Notes
          </Label>
          <Textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="block w-full border rounded px-2 py-1"
            placeholder="Enter notes here"
          />
          <div className="flex items-center justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isRephrasing || !notes}
              onClick={handleRephrase}
            >
              {isRephrasing ? "Rephrasing..." : "Rephrase"}
            </Button>
          </div>

          {/* Purchase Orders Switch and List (moved below Notes) */}
          <div className="flex items-center gap-2 mt-2">
            <Label htmlFor="linkPurchaseOrders">Link Purchase Orders</Label>
            <Switch
              id="linkPurchaseOrders"
              checked={linkPurchaseOrders}
              onCheckedChange={setLinkPurchaseOrders}
              disabled={!project}
            />
            {loadingPurchaseOrders && <Loader2 className="animate-spin h-4 w-4 ml-2 text-muted-foreground" />}
          </div>
          {linkPurchaseOrders && (
            <div className="mt-2 mb-2">
              {purchaseOrders.length === 0 && !loadingPurchaseOrders ? (
                <div className="text-muted-foreground text-sm">No linked purchase orders found.</div>
              ) : (
                <div className="rounded border bg-muted p-3 text-sm space-y-2">
                  {purchaseOrders.map((po) => (
                    <div key={po.id} className="flex flex-col">
                      <span className="font-medium text-blue-900">PO #{po.docId}</span>
                      <span className={po.description ? "" : "italic text-muted-foreground"}>
                        {po.description || "No description"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Label htmlFor="additionalMaterials">
            Additional Materials
          </Label>
          <Textarea
            id="additionalMaterials"
            name="additionalMaterials"
            value={additionalMaterials}
            onChange={(e) => setAdditionalMaterials(e.target.value)}
            rows={2}
            className="block w-full border rounded px-2 py-1 mt-1"
            placeholder="Optional materials used"
          />
          <div className="mt-8 flex gap-4 mb-8 justify-baseline items-center">
            <Button
              type="button"
              disabled={isSaving || isPreviewing || isSubmitting || !project}
              variant="outline"
              onClick={handleSaveDraft}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>

            <Button
              type="button"
              disabled={isPreviewing || isSubmitting || !project}
              variant="outline"
              onClick={handlePreview}
            >
              {isPreviewing ? 'Previewing...' : 'Preview'}
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !project}
              variant="default"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            {(isSubmitting || isSaving || isPreviewing) && (
              <div className="my-auto">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
