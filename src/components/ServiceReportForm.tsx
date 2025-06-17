"use client";

import EmployeeSelect from "@/components/EmployeeSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ServiceReport } from "@/models/ServiceReport";
import ClientSelect from "./ClientSelect";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

import { useAuth } from "@/contexts/AuthContext";
import ContactInfoFields from "@/components/ContactInfoFields";
import ServiceNotesSection from "@/components/ServiceNotesSection";
import NewBuildingDialog from "@/components/NewBuildingDialog";
import { useServiceReportFormHandlers } from "@/components/useServiceReportFormHandlers";

interface ServiceReportFormProps {
  serviceReport?: ServiceReport;
}

export default function ServiceReportForm({
  serviceReport,
}: ServiceReportFormProps) {
  const { user } = useAuth();
  // Use custom hook for all state and handlers
  const handlers = useServiceReportFormHandlers(serviceReport);
  const {
    isNewReport,
    loading,
    submitting,
    authorTechnician,
    assignedTechnician,
    setAssignedTechnician,
    client,
    setClient,
    building,
    setBuilding,
    contactName,
    setContactName,
    contactEmail,
    setContactEmail,
    contactPhone,
    setContactPhone,
    serviceAddress1,
    setServiceAddress1,
    serviceAddress2,
    setServiceAddress2,
    cityStateZip,
    setCityStateZip,
    materialNotes,
    setMaterialNotes,
    addBuildingOpen,
    setAddBuildingOpen,
    newBuilding,
    setNewBuilding,
    originalContact,
    setOriginalContact,
    handleAddBuilding,
    serviceNotesInputs,
    setServiceNotesInputs,
    handleAddServiceNote,
    handleRemoveServiceNote,
    handleUpdateContactInfo,
    handleServiceNoteChange,
    handleSubmit,
    handleSaveDraft,
    technicians,
    loadingEmployees,
    employeesError,
    refetchEmployees,
  } = handlers;

  const contactInfoChanged =
    contactName !== originalContact.contactName ||
    contactEmail !== originalContact.contactEmail ||
    contactPhone !== originalContact.contactPhone;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

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
                      // Set as original contact
                      setOriginalContact({
                        contactName: found.contactName ?? "",
                        contactEmail: found.contactEmail ?? "",
                        contactPhone: found.contactPhone ?? "",
                      });
                    }
                  }}
                >
                  <SelectTrigger id="buildingSelect" className="max-w-[400px] w-full">
                    <SelectValue placeholder="Select a building..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Buildings</SelectLabel>
                      {client.buildings.map(
                        (bld) =>
                          bld.serviceAddress1 !== "" && (
                            <SelectItem
                              key={
                                bld.serviceAddress1 +
                                (bld.contactEmail || "") +
                                (bld.contactPhone || "")
                              }
                              value={bld.serviceAddress1}
                              className="py-2"
                            >
                              {bld.serviceAddress1}
                            </SelectItem>
                          )
                      )}
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
            <NewBuildingDialog
              open={addBuildingOpen}
              setOpen={setAddBuildingOpen}
              newBuilding={newBuilding}
              setNewBuilding={setNewBuilding}
              handleAddBuilding={handleAddBuilding}
            />
          </div>
        )}

        {/* === Contact & Address Fields (always editable, visually separated) === */}
        <ContactInfoFields
          contactName={contactName}
          setContactName={setContactName}
          contactEmail={contactEmail}
          setContactEmail={setContactEmail}
          contactPhone={contactPhone}
          setContactPhone={setContactPhone}
        />

        {contactInfoChanged && (
          <>
            <div className="text-sm text-yellow-600">
              Contact information has changed. Please review before updating.
            </div>
            <div className="mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleUpdateContactInfo}
              >
                Update Contact Info
              </Button>
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
        <ServiceNotesSection
          serviceNotesInputs={serviceNotesInputs}
          handleAddServiceNote={handleAddServiceNote}
          handleRemoveServiceNote={handleRemoveServiceNote}
          handleServiceNoteChange={handleServiceNoteChange}
        />

        {/* === Save/Submit Buttons === */}
        <div className="mt-8 flex gap-4 mb-8">
          <Button
            type="button"
            disabled={submitting}
            variant="outline"
            onClick={handleSaveDraft}
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
