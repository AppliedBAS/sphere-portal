"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, FormEvent } from "react";
import EmployeeSelect from "@/components/EmployeeSelect";
import { Employee as EmployeeModel } from "@/models/Employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEmployees } from "@/hooks/useEmployees";
import { ServiceReport, ServiceNote } from "@/models/ServiceReport";
import { getEmployeeByEmail, sendServiceReportEmail } from "@/lib/services";
import { toast } from "sonner";
import { getDoc, Timestamp } from "firebase/firestore";
import ClientSelect from "./ClientSelect";

interface ServiceReportFormProps {
  serviceReport?: ServiceReport;
}

interface ServiceNoteInput {
  date: string;
  technicianTime: string;
  technicianOvertime: string;
  helperTime: string;
  helperOvertime: string;
  remoteWork: string;
  notes: string;
}

export default function ServiceReportForm({ serviceReport }: ServiceReportFormProps) {
  const { user } = useAuth();

  const {
    technicians,
    loading: loadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useEmployees();

  const [submitting, setSubmitting] = useState<boolean>(false);

  // If editing, prefill the author technician
  const [authorTechnician, setAuthorTechnician] = useState<EmployeeModel | null>(null);

  // Controlled inputs for basic service-report fields:
  const [clientName, setClientName] = useState<string>(serviceReport?.clientName || "");
  const [contactName, setContactName] = useState<string>(serviceReport?.contactName || "");
  const [contactEmail, setContactEmail] = useState<string>(serviceReport?.contactEmail || "");
  const [contactPhone, setContactPhone] = useState<string>(serviceReport?.contactPhone || "");
  const [serviceAddress1, setServiceAddress1] = useState<string>(serviceReport?.serviceAddress1 || "");
  const [serviceAddress2, setServiceAddress2] = useState<string>(serviceReport?.serviceAddress2 || "");
  const [cityStateZip, setCityStateZip] = useState<string>(serviceReport?.cityStateZip || "");
  const [printedName, setPrintedName] = useState<string>(serviceReport?.printedName || "");
  const [materialNotes, setMaterialNotes] = useState<string>(serviceReport?.materialNotes || "");
  const [dateSigned, setDateSigned] = useState<string>(
    serviceReport?.dateSigned ? serviceReport.dateSigned.toDate().toISOString().substring(0, 10) : ""
  );
  const [draft, setDraft] = useState<boolean>(serviceReport?.draft ?? true);

  // Controlled state for a list of service-note entries
  const [serviceNotesInputs, setServiceNotesInputs] = useState<ServiceNoteInput[]>(
    serviceReport?.serviceNotes.map((sn) => ({
      date: sn.date.toDate().toISOString().substring(0, 10),
      technicianTime: sn.technicianTime,
      technicianOvertime: sn.technicianOvertime,
      helperTime: sn.helperTime,
      helperOvertime: sn.helperOvertime,
      remoteWork: sn.remoteWork,
      notes: sn.serviceNotes,
    })) || [
      {
        date: "",
        technicianTime: "",
        technicianOvertime: "",
        helperTime: "",
        helperOvertime: "",
        remoteWork: "",
        notes: "",
      },
    ]
  );

  // If editing an existing report, load its author technician
  useEffect(() => {
    async function initForm() {
      if (!serviceReport) return;

      if (serviceReport.authorTechnicianRef) {
        const empSnap = await getDoc(serviceReport.authorTechnicianRef);
        if (empSnap.exists()) {
          const data = empSnap.data();
          setAuthorTechnician({
            id: empSnap.id,
            clientId: data["client-id"],
            clientSecret: data["client-secret"],
            createdAt: data["created-at"],
            updatedAt: data["updated-at"],
            ...data,
          } as EmployeeModel);
        }
      }
    }
    initForm();
  }, [serviceReport]);

  const handleAddServiceNote = () => {
    setServiceNotesInputs((prev) => [
      ...prev,
      {
        date: "",
        technicianTime: "",
        technicianOvertime: "",
        helperTime: "",
        helperOvertime: "",
        remoteWork: "",
        notes: "",
      },
    ]);
  };

  const handleRemoveServiceNote = (index: number) => {
    setServiceNotesInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleServiceNoteChange = (
    index: number,
    field: keyof ServiceNoteInput,
    value: string
  ) => {
    setServiceNotesInputs((prev) =>
      prev.map((note, i) =>
        i === index
          ? {
              ...note,
              [field]: value,
            }
          : note
      )
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Determine the author technician
      let technician: EmployeeModel;
      if (authorTechnician) {
        technician = authorTechnician;
      } else {
        technician = await getEmployeeByEmail(user!.email!);
      }

      // Build the ServiceNote[] from inputs
      const serviceNotes: ServiceNote[] = serviceNotesInputs.map((input) => ({
        date: input.date ? Timestamp.fromDate(new Date(input.date)) : Timestamp.now(),
        technicianTime: input.technicianTime,
        technicianOvertime: input.technicianOvertime,
        helperTime: input.helperTime,
        helperOvertime: input.helperOvertime,
        remoteWork: input.remoteWork,
        serviceNotes: input.notes,
      }));

      const newServiceReport: ServiceReport = {
        id: serviceReport?.id || "",
        authorTechnicianRef: technician.docRef, // assume EmployeeModel has docRef
        clientName,
        contactName,
        contactEmail,
        contactPhone,
        serviceAddress1,
        serviceAddress2,
        cityStateZip,
        printedName,
        materialNotes,
        createdAt: serviceReport?.createdAt || Timestamp.now(),
        dateSigned: dateSigned ? Timestamp.fromDate(new Date(dateSigned)) : undefined,
        draft,
        serviceNotes,
      };

      // Send or save the service report
      const response: Response = await sendServiceReportEmail(newServiceReport, technician);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send/save service report: ${errorText}`);
      }

      // Reset form if creating new
      if (!serviceReport) {
        setAuthorTechnician(null);
        setClientName("");
        setContactName("");
        setContactEmail("");
        setContactPhone("");
        setServiceAddress1("");
        setServiceAddress2("");
        setCityStateZip("");
        setPrintedName("");
        setMaterialNotes("");
        setDateSigned("");
        setDraft(true);
        setServiceNotesInputs([
          {
            date: "",
            technicianTime: "",
            technicianOvertime: "",
            helperTime: "",
            helperOvertime: "",
            remoteWork: "",
            notes: "",
          },
        ]);
      }

      toast.success("Service report submitted successfully!");
    } catch (error) {
      console.error("Error generating service report:", error);
      toast.error(`${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-4 flex flex-col gap-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="authorTechnician">Assigned Technician</Label>
          <EmployeeSelect
            employees={technicians}
            loading={loadingEmployees}
            error={employeesError}
            refetch={refetchEmployees}
            selectedEmployee={authorTechnician}
            setSelectedEmployee={setAuthorTechnician}
            placeholder="Select Technician..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave blank if you are the assigned technician.
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="clientName">Client Select</Label>
          <ClientSelect
            selectedClient={clientName ? { clientName } : null}
            
            />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="serviceAddress1">Service Address 1</Label>
          <Input
            id="serviceAddress1"
            value={serviceAddress1}
            onChange={(e) => setServiceAddress1(e.target.value)}
            placeholder="Address line 1"
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="serviceAddress2">Service Address 2</Label>
          <Input
            id="serviceAddress2"
            value={serviceAddress2}
            onChange={(e) => setServiceAddress2(e.target.value)}
            placeholder="Address line 2 (optional)"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="cityStateZip">City, State, ZIP</Label>
          <Input
            id="cityStateZip"
            value={cityStateZip}
            onChange={(e) => setCityStateZip(e.target.value)}
            placeholder="e.g., Dallas, TX 75054"
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="additionalMaterialNotes">Additional Materials</Label>
          <Textarea
            id="materialNotes"
            value={materialNotes}
            onChange={(e) => setMaterialNotes(e.target.value)}
            placeholder="Optional materials used not already in POs"
            rows={3}
          />
        </div>

        <div className="mt-6">
          <span className="text-sm font-medium">Service Notes</span>
          {serviceNotesInputs.map((note, idx) => (
            <div key={idx} className="mt-4 border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Entry #{idx + 1}</span>
                {serviceNotesInputs.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveServiceNote(idx)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor={`noteDate_${idx}`}>Date</Label>
                <Input
                  id={`noteDate_${idx}`}
                  type="date"
                  value={note.date}
                  onChange={(e) => handleServiceNoteChange(idx, "date", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor={`technicianTime_${idx}`}>Technician Time</Label>
                <Input
                  id={`technicianTime_${idx}`}
                  value={note.technicianTime}
                  onChange={(e) =>
                    handleServiceNoteChange(idx, "technicianTime", e.target.value)
                  }
                  placeholder="e.g., 3.0"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`technicianOvertime_${idx}`}>Technician Overtime</Label>
                <Input
                  id={`technicianOvertime_${idx}`}
                  value={note.technicianOvertime}
                  onChange={(e) =>
                    handleServiceNoteChange(idx, "technicianOvertime", e.target.value)
                  }
                  placeholder="e.g., 1.0"
                />
              </div>

              <div>
                <Label htmlFor={`helperTime_${idx}`}>Helper Time</Label>
                <Input
                  id={`helperTime_${idx}`}
                  value={note.helperTime}
                  onChange={(e) => handleServiceNoteChange(idx, "helperTime", e.target.value)}
                  placeholder="e.g., 2.0"
                />
              </div>

              <div>
                <Label htmlFor={`helperOvertime_${idx}`}>Helper Overtime</Label>
                <Input
                  id={`helperOvertime_${idx}`}
                  value={note.helperOvertime}
                  onChange={(e) =>
                    handleServiceNoteChange(idx, "helperOvertime", e.target.value)
                  }
                  placeholder="e.g., 0.5"
                />
              </div>

              <div>
                <Label htmlFor={`remoteWork_${idx}`}>Remote Work</Label>
                <Input
                  id={`remoteWork_${idx}`}
                  value={note.remoteWork}
                  onChange={(e) => handleServiceNoteChange(idx, "remoteWork", e.target.value)}
                  placeholder="e.g., Remote diagnostics"
                />
              </div>

              <div>
                <Label htmlFor={`notes_${idx}`}>Service Notes</Label>
                <Textarea
                  id={`notes_${idx}`}
                  value={note.notes}
                  onChange={(e) => handleServiceNoteChange(idx, "notes", e.target.value)}
                  rows={3}
                  placeholder="Describe work performed"
                  required
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="secondary" className="mt-4" onClick={handleAddServiceNote}>
            Add a Service Note
          </Button>
        </div>

        <Button
          type="submit"
          disabled={submitting || loadingEmployees || !clientName || !contactName || !serviceAddress1}
          variant="default"
          className="mt-8 w-full"
        >
          {submitting
            ? "Submitting..."
            : serviceReport
            ? "Update Service Report"
            : "Submit Service Report"}
        </Button>
      </div>
    </form>
  );
}
