"use client";

// import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, FormEvent } from "react";
import EmployeeSelect from "@/components/EmployeeSelect";
import { Employee as EmployeeModel } from "@/models/Employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEmployees } from "@/hooks/useEmployees";
import { ServiceReport } from "@/models/ServiceReport";
import { getDoc } from "firebase/firestore";
import ClientSelect from "./ClientSelect";
import { Building, ClientHit } from "@/models/Client";
import { toast } from "sonner";
import TimeSelect from "@/components/TimeSelect";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// ShadCN Select imports:
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

interface ServiceReportFormProps {
  serviceReport?: ServiceReport;
}

interface ServiceNoteInput {
  date: string;
  technicianTime: string;
  technicianOvertime: string;
  helperTime: string;
  helperOvertime: string;
  remoteWork: string; // 'yes' or ''
  notes: string;
}

export default function ServiceReportForm({
  serviceReport,
}: ServiceReportFormProps) {
  // const { user } = useAuth();

  const {
    technicians,
    loading: loadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useEmployees();

  const [submitting, setSubmitting] = useState<boolean>(false);

  // If editing, prefill the assigned technician
  const [assignedTechnician, setAssignedTechnician] =
    useState<EmployeeModel | null>(null);

  // The chosen client (from ClientSelect)
  const [client, setClient] = useState<ClientHit | null>(null);

  // The chosen building (we’ll identify by serviceAddress1)
  const [building, setBuilding] = useState<Building | null>(null);
  const [contactName, setContactName] = useState<string>(
    serviceReport?.contactName || ""
  );
  const [contactEmail, setContactEmail] = useState<string>(
    serviceReport?.contactEmail || ""
  );
  const [contactPhone, setContactPhone] = useState<string>(
    serviceReport?.contactPhone || ""
  );
  const [serviceAddress1, setServiceAddress1] = useState<string>(
    serviceReport?.serviceAddress1 || ""
  );
  const [serviceAddress2, setServiceAddress2] = useState<string>(
    serviceReport?.serviceAddress2 || ""
  );
  const [cityStateZip, setCityStateZip] = useState<string>(
    serviceReport?.cityStateZip || ""
  );
  const [materialNotes, setMaterialNotes] = useState<string>(
    serviceReport?.materialNotes || ""
  );

  // Controlled list of service‐note entries
  const [serviceNotesInputs, setServiceNotesInputs] = useState<
    ServiceNoteInput[]
  >(
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

  // If editing an existing report, load its author technician (and any pre‐saved client fields)
  useEffect(() => {
    async function initForm() {
      if (!serviceReport) return;

      // Populate assignedTechnician from a DocumentReference, if present
      if (serviceReport.authorTechnicianRef) {
        const empSnap = await getDoc(serviceReport.authorTechnicianRef);
        if (empSnap.exists()) {
          const data = empSnap.data();
          setAssignedTechnician({
            id: empSnap.id,
            clientId: data["client-id"],
            clientSecret: data["client-secret"],
            createdAt: data["created-at"],
            updatedAt: data["updated-at"],
            ...data,
          } as EmployeeModel);
        }
      }

      // If there was already a saved client/building on the report, populate those fields:
      // if (serviceReport.clientName) {
      //   setClientName(serviceReport.clientName);
      // }
      if (serviceReport.contactName) {
        setContactName(serviceReport.contactName);
      }
      if (serviceReport.contactEmail) {
        setContactEmail(serviceReport.contactEmail);
      }
      if (serviceReport.contactPhone) {
        setContactPhone(serviceReport.contactPhone);
      }
      if (serviceReport.serviceAddress1) {
        setServiceAddress1(serviceReport.serviceAddress1);
      }
      if (serviceReport.serviceAddress2) {
        setServiceAddress2(serviceReport.serviceAddress2);
      }
      if (serviceReport.cityStateZip) {
        setCityStateZip(serviceReport.cityStateZip);
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
    toast.success("Tested submission");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitting(false);
  };

  // Add state for dialog and new building form
  const [addBuildingOpen, setAddBuildingOpen] = useState(false);
  const [newBuilding, setNewBuilding] = useState({
    serviceAddress1: "",
    serviceAddress2: "",
    cityStateZip: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleNewBuildingChange = (field: string, value: string) => {
    setNewBuilding((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddBuilding = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Replace with actual create logic
    console.log("New building to create:", newBuilding);
    setAddBuildingOpen(false);
    setNewBuilding({
      serviceAddress1: "",
      serviceAddress2: "",
      cityStateZip: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    });
    toast.success("Building creation not implemented");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-4 flex flex-col gap-6">
        {/* === Assigned Technician === */}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="authorTechnician">Assigned Technician</Label>
          <EmployeeSelect
            employees={technicians}
            loading={loadingEmployees}
            error={employeesError}
            refetch={refetchEmployees}
            selectedEmployee={assignedTechnician}
            setSelectedEmployee={setAssignedTechnician}
            placeholder="Select Technician..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave blank if you are the assigned technician.
          </p>
        </div>

        {/* === Client Select === */}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="clientSelect">Client Select *</Label>
          <ClientSelect
            selectedClient={client}
            setSelectedClient={(selected) => {
              setClient(selected || null);

              // Clear any previously selected building and all its dependent fields:
              setBuilding(null);
              setContactName("");
              setContactEmail("");
              setContactPhone("");
              setServiceAddress1("");
              setServiceAddress2("");
              setCityStateZip("");
            }}
          />
        </div>

        {/* === Building Select (ShadCN) – only if client chosen === */}
        {client && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="buildingSelect">Building Select</Label>
            {client.buildings && client.buildings.length > 0 ? (
              <div className="flex flex-col gap-2">
                <Select
                  value={building ? building.serviceAddress1 : ""}
                  onValueChange={(val) => {
                    if (val === "__create__") {
                      toast.info("Create Building dialog not implemented");
                      return;
                    }
                    if (val === "") {
                      setBuilding(null);
                      setContactName("");
                      setContactEmail("");
                      setContactPhone("");
                      setServiceAddress1("");
                      setServiceAddress2("");
                      setCityStateZip("");
                      return;
                    }

                    const found = client.buildings.find(
                      (bld) => bld.serviceAddress1 === val
                    );

                    if (found) {
                      setBuilding(found);
                      setContactName(found.contactName ?? "");
                      setContactEmail(found.contactEmail ?? "");
                      setContactPhone(found.contactPhone ?? "");
                      setServiceAddress1(found.serviceAddress1 ?? "");
                      setServiceAddress2(found.serviceAddress2 ?? "");
                      setCityStateZip(found.cityStateZip ?? "");
                    }
                  }}
                >
                  <SelectTrigger id="buildingSelect">
                    <SelectValue placeholder="Select a building..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Buildings</SelectLabel>
                      {client.buildings.map((bld) => (
                        <SelectItem
                          key={bld.serviceAddress1}
                          value={bld.serviceAddress1}
                          className="py-2"
                        >
                          {bld.serviceAddress1}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-muted-foreground text-sm">
                  No buildings found.
                </div>
              </div>
            )}
            <Dialog open={addBuildingOpen} onOpenChange={setAddBuildingOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-fit"
                >
                  + Add Building
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Building</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddBuilding} className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="new_serviceAddress1">Service Address 1</Label>
                    <Input
                      id="new_serviceAddress1"
                      value={newBuilding.serviceAddress1}
                      onChange={(e) =>
                        handleNewBuildingChange("serviceAddress1", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="new_serviceAddress2">Service Address 2</Label>
                    <Input
                      id="new_serviceAddress2"
                      value={newBuilding.serviceAddress2}
                      onChange={(e) =>
                        handleNewBuildingChange("serviceAddress2", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="new_cityStateZip">City, State, ZIP</Label>
                    <Input
                      id="new_cityStateZip"
                      value={newBuilding.cityStateZip}
                      onChange={(e) =>
                        handleNewBuildingChange("cityStateZip", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="new_contactName">Contact Name</Label>
                    <Input
                      id="new_contactName"
                      value={newBuilding.contactName}
                      onChange={(e) =>
                        handleNewBuildingChange("contactName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="new_contactEmail">Contact Email</Label>
                    <Input
                      id="new_contactEmail"
                      value={newBuilding.contactEmail}
                      onChange={(e) =>
                        handleNewBuildingChange("contactEmail", e.target.value)
                      }
                      type="email"
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="new_contactPhone">Contact Phone</Label>
                    <Input
                      id="new_contactPhone"
                      value={newBuilding.contactPhone}
                      onChange={(e) =>
                        handleNewBuildingChange("contactPhone", e.target.value)
                      }
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" variant="default">Add Building</Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* === Populate Contact & Address as Read‐Only Inputs === */}
        {building && (
          <>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={contactName}
                readOnly
                placeholder="Contact Name"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                value={contactEmail}
                readOnly
                placeholder="Contact Email"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={contactPhone}
                readOnly
                placeholder="Contact Phone"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="serviceAddress1">Service Address 1</Label>
              <Input
                id="serviceAddress1"
                value={serviceAddress1}
                readOnly
                placeholder="Address Line 1"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="serviceAddress2">Service Address 2</Label>
              <Input
                id="serviceAddress2"
                value={serviceAddress2}
                readOnly
                placeholder="Address Line 2"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="cityStateZip">City, State, ZIP</Label>
              <Input
                id="cityStateZip"
                value={cityStateZip}
                readOnly
                placeholder="City, State ZIP"
              />
            </div>
          </>
        )}

        {/* === Material Notes === */}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="materialNotes">Additional Materials</Label>
          <Textarea
            id="materialNotes"
            value={materialNotes}
            onChange={(e) => setMaterialNotes(e.target.value)}
            placeholder="Optional materials used not already in POs"
            rows={3}
          />
        </div>

        {/* === Service Notes === */}
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
                <Label htmlFor={`noteDate_${idx}`} className="mb-2 block">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={note.date ? "outline" : "secondary"}
                      className={
                        "w-full justify-start text-left font-normal " +
                        (!note.date ? "text-muted-foreground" : "")
                      }
                    >
                      {note.date
                        ? format(parseISO(note.date), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={note.date ? parseISO(note.date) : undefined}
                      onSelect={(date) => {
                        handleServiceNoteChange(
                          idx,
                          "date",
                          date ? date.toISOString().substring(0, 10) : ""
                        );
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time fields: Technician and Helper on separate rows */}
              <div className="flex flex-col gap-2 md:gap-4">
                {/* Technician Time */}
                <div className="flex flex-col md:flex-row md:gap-4 space-y-4">
                  <div className="flex flex-col">
                    <Label
                      htmlFor={`technicianTime_${idx}`}
                      className="mb-2 block"
                    >
                      Technician Time
                    </Label>
                    <TimeSelect
                      selectedTime={note.technicianTime}
                      setSelectedTime={(val: string) =>
                        handleServiceNoteChange(idx, "technicianTime", val)
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label
                      htmlFor={`technicianOvertime_${idx}`}
                      className="mb-2 block"
                    >
                      Technician Overtime
                    </Label>
                    <TimeSelect
                      selectedTime={note.technicianOvertime}
                      setSelectedTime={(val: string) =>
                        handleServiceNoteChange(idx, "technicianOvertime", val)
                      }
                    />
                  </div>
                </div>
                {/* Helper Time */}
                <div className="flex flex-col md:flex-row md:gap-4 space-y-4">
                  <div className="flex flex-col">
                    <Label htmlFor={`helperTime_${idx}`} className="mb-2 block">
                      Helper Time
                    </Label>
                    <TimeSelect
                      selectedTime={note.helperTime}
                      setSelectedTime={(val: string) =>
                        handleServiceNoteChange(idx, "helperTime", val)
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label
                      htmlFor={`helperOvertime_${idx}`}
                      className="mb-2 block"
                    >
                      Helper Overtime
                    </Label>
                    <TimeSelect
                      selectedTime={note.helperOvertime}
                      setSelectedTime={(val: string) =>
                        handleServiceNoteChange(idx, "helperOvertime", val)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Remove the old Remote Work input and add a Switch */}
              <div className="flex items-center gap-2">
                <Label htmlFor={`remoteWork_${idx}`} className="mb-1">
                  Remote Work
                </Label>
                <Switch
                  id={`remoteWork_${idx}`}
                  checked={note.remoteWork === "yes"}
                  onCheckedChange={(checked: boolean) =>
                    handleServiceNoteChange(
                      idx,
                      "remoteWork",
                      checked ? "yes" : ""
                    )
                  }
                />
                <span className="ml-2 text-sm">
                  {note.remoteWork === "yes" ? "Yes" : "No"}
                </span>
              </div>

              <div>
                <Label htmlFor={`notes_${idx}`} className="mb-2 block">
                  Service Notes
                </Label>
                <Textarea
                  id={`notes_${idx}`}
                  value={note.notes}
                  onChange={(e) =>
                    handleServiceNoteChange(idx, "notes", e.target.value)
                  }
                  rows={3}
                  placeholder="Describe work performed"
                  required
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={handleAddServiceNote}
          >
            Add a Service Note
          </Button>
        </div>

        {/* === Save/Submit Buttons === */}
        <div className="mt-8 flex gap-4 mb-8">
          <Button
            type="button"
            disabled={submitting}
            variant="outline"
            onClick={() => {
              // Implement save‐draft logic
              toast.info("Saved as draft (not implemented)");
            }}
          >
            Save
          </Button>
          <Button
            type="submit"
            disabled={submitting || !client}
            variant="default"
            onClick={() => {
              toast.info("Submitted service report (not implemented)");
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
}
