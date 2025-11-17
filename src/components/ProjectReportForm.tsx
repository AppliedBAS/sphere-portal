"use client";

import { useState, useEffect, FormEvent } from "react";
import EmployeeSelect from "./EmployeeSelect";
import {
  Employee as EmployeeModel,
  employeeConverter,
} from "@/models/Employee";
import ProjectSelect from "@/components/ProjectSelect";
import { Button } from "./ui/button";
import { useEmployees } from "@/hooks/useEmployees";

import { ProjectReport, projectReportConverter, ProjectReportPDFMessage } from "@/models/ProjectReport";
import { toast } from "sonner";
import { Project, ProjectHit, projectConverter } from "@/models/Project";
import { getDoc, getDocs, query, where } from "firebase/firestore";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "./ui/input";
import { firestore } from "@/lib/firebase";
import {
  addDoc,
  setDoc,
  Timestamp,
  doc,
  collection,
  onSnapshot,
  query as fsQuery,
  where as fsWhere,
} from "firebase/firestore";
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
  const [loadingPurchaseOrders, setLoadingPurchaseOrders] =
    useState<boolean>(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

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
            active: data.active ?? true,
            balance: data.balance ?? 0,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          });
        }
      }

      // Load author technician from projectReport
      if (projectReport.authorTechnicianRef) {
        const empSnap = await getDoc(
          projectReport.authorTechnicianRef.withConverter(employeeConverter)
        );
        if (empSnap.exists()) {
          const emp = empSnap.data() as EmployeeModel;
          setAuthorTechnician({
            ...emp,
            id: empSnap.id,
          });
        }
      }

      if (projectReport.leadTechnicianRef) {
        const employeeSnap = await getDoc(
          projectReport.leadTechnicianRef.withConverter(employeeConverter)
        );
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
        console.error("Error fetching purchase orders:", err);
        toast.error("Failed to fetch purchase orders");
      } finally {
        setLoadingPurchaseOrders(false);
      }
    };

    fetchPurchaseOrders();
  }, [linkPurchaseOrders, project]);

  // Listen for number of project reports for this project and set docId for new reports
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (project && isNewReport) {
      const q = fsQuery(
        collection(firestore, "project reports"),
        fsWhere("project-doc-id", "==", project.docId)
      );
      unsubscribe = onSnapshot(q, (snap) => {
        setDocId(snap.size + 1);
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [project, isNewReport]);

  // Helper to combine materials and purchase order descriptions
  function combineMaterials(
    materials: string,
    purchaseOrders: PurchaseOrder[],
    link: boolean
  ): string {
    let poMaterials = "";
    if (link && purchaseOrders.length > 0) {
      poMaterials = purchaseOrders
        .map((po) => po.description?.trim())
        .filter(Boolean)
        .join("; ");
    }
    const allMaterials = [materials?.trim(), poMaterials]
      .filter(Boolean)
      .join("; ");
    return allMaterials.length > 0 ? allMaterials : "None";
  }

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setIsSubmitting(true);
    if (!user ) {
      toast.error("User is required");
      setIsSaving(false);
      setIsSubmitting(false);
      return;
    }
    if (!authorTechnician) {
      toast.error("Author technician is required");
      setIsSaving(false);
      setIsSubmitting(false);
      return;
    }

    if (!project) {
      toast.error("Project is required");
      setIsSaving(false);
      setIsSubmitting(false);
      return;
    }
    try {
      if (isNewReport) {
        const newReport: ProjectReport = {
          id: crypto.randomUUID(),
          projectDocId: project.docId,
          docId,
          clientName: project.client,
          location: project.location,
          description: project.description,
          notes,
          materials: combineMaterials(
            additionalMaterials,
            purchaseOrders,
            linkPurchaseOrders
          ),
          draft: true,
          createdAt: Timestamp.now(),
          authorTechnicianRef: doc(
            firestore,
            "employees",
            authorTechnician.id
          ),
          leadTechnicianRef: leadEmployee
            ? doc(firestore, "employees", leadEmployee.id)
            : null,
          assignedTechniciansRef: assignedTechnicians.map((e) =>
            doc(firestore, "employees", e.id)
          ),
        };

        const docRef = await addDoc(
          collection(firestore, "project reports").withConverter(projectReportConverter),
          newReport
        );

        window.location.href = `/dashboard/project-reports/${docRef.id}/edit`;
      } else {
        if (!projectReport?.id) {
          throw new Error("Project report ID is missing for update.");
        }
        const docRef = doc(
          firestore,
          "project reports",
          projectReport.id
        ).withConverter(projectReportConverter);

        const updatedReport: ProjectReport = {
          assignedTechniciansRef: assignedTechnicians.map((e) =>
            doc(firestore, "employees", e.id)
          ),
          authorTechnicianRef: doc(
            firestore,
            "employees",
            authorTechnician.id
          ),
          clientName: project.client,
          createdAt: projectReport!.createdAt,
          description: project.description,
          docId: projectReport!.docId,
          draft: true,
          id: projectReport?.id || crypto.randomUUID(),
          leadTechnicianRef: leadEmployee
            ? doc(firestore, "employees", leadEmployee.id)
            : null,
          location: project.location,
          materials: additionalMaterials,
          notes: notes,
          projectDocId: project.docId,
        };
        await setDoc(docRef, updatedReport, { merge: true });
        toast.success(
          <span className="text-lg md:text-sm">Draft saved successfully!</span>
        );
      }
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
      const currentDoc = docId;
      let newReportId = projectReport?.id || null;
      if (isNewReport) {
        const newReport: ProjectReport = {
          id: crypto.randomUUID(),
          projectDocId: project.docId,
          docId: currentDoc,
          clientName: project.client,
          location: project.location,
          description: project.description,
          notes: notes,
          materials: additionalMaterials,
          draft: false, // Set to false for submission
          createdAt: Timestamp.now(),
          authorTechnicianRef: doc(
            firestore,
            "employees",
            authorTechnician.id
          ),
          leadTechnicianRef: leadEmployee
            ? doc(firestore, "employees", leadEmployee.id)
            : null,
          assignedTechniciansRef: assignedTechnicians.map((e) =>
            doc(firestore, "employees", e.id)
          ),
        };
        const ref = await addDoc(
          collection(firestore, "reports").withConverter(projectReportConverter),
          newReport
        );
        newReportId = ref.id;
        setIsNewReport(false);
      } else {
        if (!projectReport?.id) {
          throw new Error("Project report ID is missing for update.");
        }
        const reportRef = doc(
          firestore,
          "project reports",
          projectReport.id
        ).withConverter(projectReportConverter);

        newReportId = projectReport.id;

        const newProjectReport: ProjectReport = {
          assignedTechniciansRef: assignedTechnicians.map((e) =>
            doc(firestore, "employees", e.id)
          ),
          authorTechnicianRef: doc(
            firestore,
            "employees",
            authorTechnician.id
          ),
          clientName: project.client,
          createdAt: projectReport!.createdAt,
          description: project.description,
          docId: currentDoc,
          draft: false, // Set to false for submission
          id: newReportId,
          leadTechnicianRef: leadEmployee
            ? doc(firestore, "employees", leadEmployee.id)
            : null,
          location: project.location,
          materials: additionalMaterials || "None",
          notes: notes,
          projectDocId: project.docId,
        };
        await setDoc(reportRef, newProjectReport!);
      }

      const data: ProjectReportMessage = {
        project_id: project.docId,
        doc_id: currentDoc,
        client_name: project.client,
        location: project.location,
        description: project.description,
        notes: notes,
        materials: combineMaterials(
          additionalMaterials,
          purchaseOrders,
          linkPurchaseOrders
        ),
        date: new Date().toLocaleDateString("en-US"),
        project_subtitle: `PR ${project.docId} - ${currentDoc} - ${project.location}`,
        technician_email: authorTechnician.email!,
        technician_name: authorTechnician.name!,
        technician_phone: authorTechnician.phone!,
      };

      // Send report to API (v2)
      const currentEmployee = await getEmployeeByEmail(user.email!);
      const token = btoa(
        `${currentEmployee.clientId}:${currentEmployee.clientSecret}`
      );
      const authorizationHeader = `Bearer ${token}`;
      const res = await fetch("https://api.appliedbas.com/v2/mail/pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationHeader,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error sending report");
      toast.success("Report submitted successfully!");

      setSubmittedReportId(newReportId);
      setSubmitDialogOpen(true);
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
        model: "gpt-5-mini",
        instructions:
          "Rephrase the project report notes to sound casual yet professional and clear.",
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
      const token = btoa(
        `${currentEmployee.clientId}:${currentEmployee.clientSecret}`
      );
      const authorizationHeader = `Bearer ${token}`;
      const dateStr = new Date().toLocaleDateString("en-US");
      const message: ProjectReportPDFMessage = {
        project_no: project.docId,
        doc_id: docId,
        project_subtitle: `PR ${project.docId} - ${docId} - ${project.location}`,
        date: dateStr,
        client_name: project.client,
        location: project.location,
        materials: combineMaterials(
          additionalMaterials,
          purchaseOrders,
          linkPurchaseOrders
        ),
        notes: notes || "None",
        technician_name: authorTechnician.name,
        technician_phone: authorTechnician.phone,
      };
      const res = await fetch("https://api.appliedbas.com/v1/pdf/pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationHeader,
        },
        body: JSON.stringify(message),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error generating preview");
      window.open(data.url, "_blank");
      toast.success("Preview generated successfully");
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Failed to generate preview");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleCloseDialog = () => {
    window.location.href = `/dashboard/project-reports/${submittedReportId!}`;
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
      {/* Submit Success Dialog */}
      {project && (
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{project.docId} - {docId} Report Submitted</DialogTitle>
            </DialogHeader>
            <div className="py-4">Your project report was submitted successfully.</div>
            <DialogFooter>
              <Button
                onClick={handleCloseDialog}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mt-4 flex flex-col gap-6 mb-8">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="project">Project *</Label>
            <ProjectSelect
              selectedProject={project}
              setSelectedProject={setProject}
            />
          </div>

          {project && docId !== null && docId !== 0 && (
            <div className="flex flex-col space-y-2">
              <Label htmlFor="docId">Report No.</Label>
              <Input
                id="docId"
                type="text"
                className="w-full md:max-w-96"
                value={docId.toString()}
                readOnly
              />
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Label htmlFor="leadTechnician">Lead Technician</Label>
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
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="assignedTechnicians">Assigned Technicians</Label>
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
              employees={technicians.filter(
                (emp) => !assignedTechnicians.some((assigned) => assigned.id === emp.id)
              )}
              loading={loadingEmployees}
              error={employeesError}
              refetch={refetchEmployees}
              selectedEmployee={null}
              setSelectedEmployee={(empl) => {
                handleAddTechnician(empl as EmployeeModel);
              }}
              placeholder="Add Technician..."
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="notes">Notes</Label>
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
          </div>

          {/* Purchase Orders Switch and List (moved below Notes) */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2 mt-2">
              <Label htmlFor="linkPurchaseOrders">Link Purchase Orders</Label>
              <Switch
                id="linkPurchaseOrders"
                checked={linkPurchaseOrders}
                onCheckedChange={setLinkPurchaseOrders}
                disabled={!project}
              />
              <p className="text-base sm:text-sm">
                {linkPurchaseOrders ? "On" : "Off"}
              </p>
              {loadingPurchaseOrders && (
                <Loader2 className="animate-spin h-4 w-4 ml-2 text-muted-foreground" />
              )}
            </div>
            {linkPurchaseOrders && !loadingPurchaseOrders && (
              <div className="mt-2 border rounded-lg p-4 bg-muted/30">
                {purchaseOrders.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    No purchase orders found for this report.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchaseOrders.map((po) => (
                      <div key={po.id} className="flex flex-col space-y-1">
                        <div className="sm:text-sm text-base">
                          PO {po.docId} - {po.description}
                        </div>
                        {/* If you want to show more PO fields, add them here as readOnly or plain text */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="additionalMaterials">Additional Materials</Label>
            <Textarea
              id="additionalMaterials"
              name="additionalMaterials"
              value={additionalMaterials}
              onChange={(e) => setAdditionalMaterials(e.target.value)}
              rows={5}
              className="block w-full border rounded px-2 py-1 mt-1"
              placeholder="Optional materials used"
            />
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex gap-4 mb-8 justify-baseline items-center">
            <Button
              type="button"
              disabled={isSaving || isPreviewing || isSubmitting || !project}
              variant="outline"
              onClick={handleSaveDraft}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>

            <Button
              type="button"
              disabled={isPreviewing || isSubmitting || !project}
              variant="outline"
              onClick={handlePreview}
            >
              {isPreviewing ? "Previewing..." : "Preview"}
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !project}
              variant="default"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
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
