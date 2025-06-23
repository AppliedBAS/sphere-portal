"use client";

import openAIClient from "@/lib/openai";
import { useState, useEffect, FormEvent } from "react";
import EmployeeSelect from "@/components/EmployeeSelect";
import { Employee } from "@/models/Employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEmployees } from "@/hooks/useEmployees";
import { ServiceReport, serviceReportConverter } from "@/models/ServiceReport";
import {
  addDoc,
  arrayUnion,
  DocumentData,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
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
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { reserveDocid } from "@/services/reportService";
import {
  ServiceReportPDFMessage,
  ServiceReportMessage,
} from "@/models/ServiceReport";
import { getEmployeeByEmail } from "@/services/employeeService";

interface ServiceReportFormProps {
  serviceReport?: ServiceReport;
}

interface ServiceNoteInput {
  date: Date;
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
  const {
    technicians,
    loading: loadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useEmployees();

  const { user, firebaseUser } = useAuth();
  const [rephraseDialogOpen, setRephraseDialogOpen] = useState(false);
  const [currentRephraseIndex, setCurrentRephraseIndex] = useState<number | null>(null);
  const [rephrase, setRephrase] = useState<string | null>(null);
  const [isRephrasing, setIsRephrasing] = useState<boolean>(false);
  const [isNewReport, setIsNewReport] = useState<boolean>(!serviceReport);
  const [isWarranty, setIsWarranty] = useState<boolean>(
    serviceReport?.warranty || false
  );
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [authorTechnician, setAuthorTechnician] = useState<Employee | null>(
    firebaseUser
  );
  const [assignedTechnician, setAssignedTechnician] = useState<Employee | null>(
    null
  );

  const [docId, setDocId] = useState<number | null>(
    serviceReport?.docId || 0
  );
  // The chosen client (from ClientSelect)
  const [client, setClient] = useState<ClientHit | null>(null);

  // The chosen building (we’ll identify by serviceAddress1)
  const [building, setBuilding] = useState<Building | null>(null);

  const [materialNotes, setMaterialNotes] = useState<string>(
    serviceReport?.materialNotes || ""
  );

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

  // Controlled list of service‐note entries
  const [serviceNotesInputs, setServiceNotesInputs] = useState<
    ServiceNoteInput[]
  >(
    serviceReport?.serviceNotes.map((sn) => ({
      date: sn.date.toDate(),
      technicianTime: sn.technicianTime,
      technicianOvertime: sn.technicianOvertime,
      helperTime: sn.helperTime,
      helperOvertime: sn.helperOvertime,
      remoteWork: sn.remoteWork,
      notes: sn.serviceNotes,
    })) || [
      {
        date: new Date(),
        technicianTime: "0.0",
        technicianOvertime: "0.0",
        helperTime: "0.0",
        helperOvertime: "0.0",
        remoteWork: "N",
        notes: "",
      },
    ]
  );
  // If editing an existing report, load its author technician (and any pre‐saved client fields)
  useEffect(() => {
    async function initForm() {
      if (!serviceReport) return;

      // Populate authorTechnician from a DocumentReference, if present
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
          } as Employee);
        }
      }

      if (serviceReport.assignedTechnicianRef) {
        const empSnap = await getDoc(serviceReport.assignedTechnicianRef);
        if (empSnap.exists()) {
          const data = empSnap.data();
          setAssignedTechnician({
            id: empSnap.id,
            clientId: data["client-id"],
            clientSecret: data["client-secret"],
            createdAt: data["created-at"],
            updatedAt: data["updated-at"],
            ...data,
          } as Employee);
        }
      }
      // Populate client from serviceReport.clientName if available
      if (serviceReport.clientName) {
        // Find client by clientName in Firestore and set as ClientHit
        const q = query(
          collection(firestore, "clients"),
          where("name", "==", serviceReport.clientName)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data();
          const clientHit: ClientHit = {
            objectID: docSnap.id,
            clientName: data["name"],
            buildings: Array.isArray(data.buildings)
              ? data.buildings.map((bld: DocumentData) => ({
                  serviceAddress1: bld["service-address1"],
                  serviceAddress2: bld["service-address2"],
                  cityStateZip: bld["city-state-zip"],
                  contactName: bld["contact-name"],
                  contactEmail: bld["contact-email"],
                  contactPhone: bld["contact-phone"],
                }))
              : [],
          };
          setClient(clientHit);
          // Set building if possible
          const foundBuilding = clientHit.buildings.find(
            (bld) => bld.serviceAddress1 === serviceReport.serviceAddress1
          );
          setBuilding(foundBuilding ?? null);
        }
      }

      setMaterialNotes(serviceReport.materialNotes || "");

      // Populate service notes
      if (serviceReport.serviceNotes && serviceReport.serviceNotes.length > 0) {
        setServiceNotesInputs(
          serviceReport.serviceNotes.map((sn) => ({
            date: sn.date.toDate(),
            technicianTime: sn.technicianTime,
            technicianOvertime: sn.technicianOvertime,
            helperTime: sn.helperTime,
            helperOvertime: sn.helperOvertime,
            remoteWork: sn.remoteWork,
            notes: sn.serviceNotes,
          }))
        );
      } else {
        setServiceNotesInputs([
          {
            date: new Date(),
            technicianTime: "0.0",
            technicianOvertime: "0.0",
            helperTime: "0.0",
            helperOvertime: "0.0",
            remoteWork: "N",
            notes: "",
          },
        ]);
      }
    }
    initForm();
  }, [serviceReport]);

  // Track original contact info for change detection
  const [originalContact, setOriginalContact] = useState({
    contactName: serviceReport?.contactName || "",
    contactEmail: serviceReport?.contactEmail || "",
    contactPhone: serviceReport?.contactPhone || "",
  });

  // Detect if contact info has changed
  const contactChanged =
    building?.contactName !== originalContact.contactName ||
    building?.contactEmail !== originalContact.contactEmail ||
    building?.contactPhone !== originalContact.contactPhone;

  // Handler for saving contact info to Firestore (Building)
  const handleSaveContact = async () => {
    if (!client || !building) return;
    try {
      // Find the building in the client's buildings array and update its contact info
      const clientRef = doc(firestore, "clients", client.objectID);
      const updatedBuildings = client.buildings.map((bld) => {
        if (
          bld.serviceAddress1 === building.serviceAddress1 &&
          bld.serviceAddress2 === building.serviceAddress2
        ) {
          return {
            "service-address1": building.serviceAddress1,
            "service-address2": building.serviceAddress2,
            "city-state-zip": building.cityStateZip,
            "contact-name": building.contactName,
            "contact-email": building.contactEmail,
            "contact-phone": building.contactPhone,
          };
        }
        return {
          "service-address1": bld.serviceAddress1,
          "service-address2": bld.serviceAddress2,
          "city-state-zip": bld.cityStateZip,
          "contact-name": bld.contactName,
          "contact-email": bld.contactEmail,
          "contact-phone": bld.contactPhone,
        };
      });
      await updateDoc(clientRef, { buildings: updatedBuildings });
      setOriginalContact({
        contactName: building.contactName,
        contactEmail: building.contactEmail,
        contactPhone: building.contactPhone,
      });
      toast.success(
        <span className="text-lg md:text-sm">Contact information saved!</span>
      );
    } catch {
      toast.error(
        <span className="text-lg md:text-sm">Failed to save contact info.</span>
      );
    }
  };

  const handleRephrase = async (index: number) => {
    if (!user || !authorTechnician) {
      toast.error(
        <span className="text-lg md:text-sm">
          You must be logged in to rephrase service notes.
        </span>
      );
      return;
    }

    setSubmitting(true);
    setIsRephrasing(true);
    try {
      setCurrentRephraseIndex(index);
      setRephraseDialogOpen(true);
      const noteToRephrase = serviceNotesInputs[index].notes;
      if (!noteToRephrase) {
        toast.error(
          <span className="text-lg md:text-sm">
            No service note text to rephrase.
          </span>
        );
        setSubmitting(false);
        return;
      }
      const response = await openAIClient.responses.create({
        model: "gpt-4",
        instructions: "Rephrase the service note for clarity and professionalism.",
        input: noteToRephrase,
      });

      setRephrase(response.output_text ?? null);
    } catch (error) {
      console.error("Error rephrasing service note:", error);
      toast.error(
        <span className="text-lg md:text-sm">
          Failed to rephrase service note. Please try again later.
        </span>
      );
    } finally {
      setSubmitting(false);
      setIsRephrasing(false);
    }
  }

  const handleRephraseConfirm = (index: number) => {
    if (rephrase) {
      setServiceNotesInputs((prev) =>
        prev.map((note, i) =>
          i === index ? { ...note, notes: rephrase } : note
        )
      );
      setRephrase(null);
      toast.success(
        <span className="text-lg md:text-sm">Service note rephrased successfully!</span>
      );
    } else {
      toast.error(
        <span className="text-lg md:text-sm">No rephrased text available.</span>
      );
    }
  }

  const handleSaveDraft = async () => {
    setSubmitting(true);

    if (!user) {
      return;
    }

    if (!authorTechnician) {
      toast.error(
        <span className="text-lg md:text-sm">
          Error loading author technician. Please try again later.
        </span>
      );
      setSubmitting(false);
      return;
    }

    if (!client) {
      toast.error(
        <span className="text-lg md:text-sm">
          Please select a client before saving the draft.
        </span>
      );
      setSubmitting(false);
      return;
    }

    if (!building) {
      toast.error(
        <span className="text-lg md:text-sm">
          Please select a building before saving the draft.
        </span>
      );
      setSubmitting(false);
      return;
    }

    if (serviceNotesInputs.length === 0) {
      toast.error(
        <span className="text-lg md:text-sm">
          Please add at least one service note before saving the draft.
        </span>
      );
      setSubmitting(false);
      return;
    }

    try {
      // Create a new service report object
      if (isNewReport) {
        // get new id
        const docId = await reserveDocid();
        // create new document reference
        const newServiceReport: ServiceReport = {
          id: crypto.randomUUID(),
          docId: docId,
          authorTechnicianRef: doc(
            firestore,
            "employees",
            authorTechnician!.id
          ),
          assignedTechnicianRef: assignedTechnician
            ? doc(firestore, "employees", assignedTechnician.id)
            : null,
          clientName: client.clientName,
          serviceAddress1: building.serviceAddress1,
          serviceAddress2: building.serviceAddress2,
          cityStateZip: building.cityStateZip,
          contactName: building.contactName,
          contactEmail: building.contactEmail,
          contactPhone: building.contactPhone,
          materialNotes,
          serviceNotes: serviceNotesInputs.map((note) => ({
            date: note.date
              ? Timestamp.fromDate(new Date(note.date))
              : Timestamp.now(),
            technicianTime: note.technicianTime,
            technicianOvertime: note.technicianOvertime,
            helperTime: note.helperTime,
            helperOvertime: note.helperOvertime,
            remoteWork: note.remoteWork,
            serviceNotes: note.notes,
          })),
          createdAt: Timestamp.now(),
          dateSigned: null,
          draft: true,
          printedName: "",
          warranty: isWarranty,
        };

        // create new document reference
        const docRef = await addDoc(
          collection(firestore, "reports").withConverter(
            serviceReportConverter
          ),
          newServiceReport
        );
        setDocId(docId);

        window.location.href = `/dashboard/service-reports/${docRef.id}/edit`;
      } else {
        // use existing serviceReport.id
        const serviceReportRef = doc(
          firestore,
          "reports",
          serviceReport!.id
        ).withConverter(serviceReportConverter);
        // update existing document
        const serviceReportData: ServiceReport = {
          id: serviceReport!.id,
          docId: serviceReport!.docId,
          createdAt: serviceReport!.createdAt,
          dateSigned: null,
          draft: true,
          printedName: serviceReport?.printedName || "",
          authorTechnicianRef: serviceReport!.authorTechnicianRef,
          assignedTechnicianRef: assignedTechnician
            ? doc(firestore, "employees", assignedTechnician.id)
            : null,
          clientName: client.clientName,
          serviceAddress1: building.serviceAddress1,
          serviceAddress2: building.serviceAddress2,
          cityStateZip: building.cityStateZip,
          contactName: building.contactName,
          contactEmail: building.contactEmail,
          contactPhone: building.contactPhone,
          materialNotes,
          serviceNotes: serviceNotesInputs.map((note) => ({
            date: note.date
              ? Timestamp.fromDate(new Date(note.date))
              : Timestamp.now(),
            technicianTime: note.technicianTime,
            technicianOvertime: note.technicianOvertime,
            helperTime: note.helperTime,
            helperOvertime: note.helperOvertime,
            remoteWork: note.remoteWork,
            serviceNotes: note.notes,
          })),
          warranty: isWarranty,
        };

        await setDoc(serviceReportRef, serviceReportData);
      }

      setIsNewReport(false);
      setSubmitting(false);

      toast.success(
        <span className="text-lg md:text-sm">Draft saved successfully!</span>
      );
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(
        <span className="text-lg md:text-sm">
          Failed to save draft. Please try again.
        </span>
      );
    }
  };

  // New: cancel unsaved contact edits
  const handleCancelContact = () => {
    setBuilding((prev) =>
      prev
        ? {
            ...prev,
            contactName: originalContact.contactName,
            contactEmail: originalContact.contactEmail,
            contactPhone: originalContact.contactPhone,
          }
        : null
    );
  };

  const handleAddServiceNote = () => {
    setServiceNotesInputs((prev) => [
      ...prev,
      {
        date: new Date(),
        technicianTime: "0.0",
        technicianOvertime: "0.0",
        helperTime: "0.0",
        helperOvertime: "0.0",
        remoteWork: "N",
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

  const handleServiceNoteDateChange = (
    index: number,
    date: Date | undefined
  ) => {
    if (date) {
      setServiceNotesInputs((prev) =>
        prev.map((note, i) =>
          i === index ? { ...note, date: new Date(date) } : note
        )
      );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (contactChanged) {
      toast.error(
        <span className="text-lg md:text-sm">
          Please save the contact information changes before submitting.
        </span>
      );
      setSubmitting(false);
      return;
    }

    if (!user) {
      toast.error(
        <span className="text-lg md:text-sm">
          You must be logged in to submit a service report.
        </span>
      );
      setSubmitting(false);
      return;
    }

    if (!authorTechnician) {
      toast.error(
        <span className="text-lg md:text-sm">
          Error loading author technician. Try again later.
        </span>
      );
      setSubmitting(false);
      return;
    }

    if (!client || !building) {
      toast.error(
        <span className="text-lg md:text-sm">
          Client and building must be selected before sending.
        </span>
      );
      setSubmitting(false);
      return;
    }

    // Reserve or use existing docId
    let currentDocId = docId;
    let id = serviceReport?.id
    if (isNewReport) {
      currentDocId = await reserveDocid();
      setDocId(currentDocId);
      // Create new ServiceReport in Firestore
      const newReport: ServiceReport = {
        id: crypto.randomUUID(),
        docId: currentDocId!,
        authorTechnicianRef: doc(firestore, "employees", authorTechnician!.id),
        assignedTechnicianRef: assignedTechnician
          ? doc(firestore, "employees", assignedTechnician.id)
          : null,
        clientName: client.clientName,
        serviceAddress1: building.serviceAddress1,
        serviceAddress2: building.serviceAddress2,
        cityStateZip: building.cityStateZip,
        contactName: building.contactName,
        contactEmail: building.contactEmail,
        contactPhone: building.contactPhone,
        materialNotes,
        serviceNotes: serviceNotesInputs.map((n) => ({
          date: Timestamp.fromDate(n.date as Date),
          technicianTime: n.technicianTime,
          technicianOvertime: n.technicianOvertime,
          helperTime: n.helperTime,
          helperOvertime: n.helperOvertime,
          remoteWork: n.remoteWork,
          serviceNotes: n.notes,
        })),
        createdAt: Timestamp.now(),
        dateSigned: null,
        draft: false,
        printedName: "",
        warranty: isWarranty,
      };
      const ref = await addDoc(
        collection(firestore, "reports").withConverter(serviceReportConverter),
        newReport
      );
      id = ref.id;
      setIsNewReport(false);
    } else {
      // Update existing report if needed
      const reportRef = doc(
        firestore,
        "reports",
        serviceReport!.id
      ).withConverter(serviceReportConverter);
      id = serviceReport!.id;
      await setDoc(reportRef, {
        ...serviceReport!,
        serviceNotes: serviceNotesInputs.map((n) => ({
          date: Timestamp.fromDate(n.date as Date),
          technicianTime: n.technicianTime,
          technicianOvertime: n.technicianOvertime,
          helperTime: n.helperTime,
          helperOvertime: n.helperOvertime,
          remoteWork: n.remoteWork,
          serviceNotes: n.notes,
        })),
        draft: false,
        warranty: isWarranty,
      });
    }

    const currentEmployee: Employee = await getEmployeeByEmail(user.email!);
    // create base64 encoded bearer token
    const token = btoa(
      `${currentEmployee.clientId}:${currentEmployee.clientSecret}`
    );

    if (!token) {
      toast.error(
        <span className="text-lg md:text-sm">
          Error loading employee data. Please try again later.
        </span>
      );
      return;
    }

    const authorizationHeader = `Bearer ${token}`;
    // Now build and send email via API
    const formatDate = (d: Date) => d.toISOString().substring(0, 10);
    const firstDate = serviceNotesInputs[0].date as Date;
    const lastDate = serviceNotesInputs[serviceNotesInputs.length - 1]
      .date as Date;
    const message: ServiceReportMessage = {
      report_no: currentDocId!,
      date: formatDate(new Date()),
      client_name: client.clientName,
      service_address:
        building.serviceAddress1 +
        (building.serviceAddress2 ? ` ${building.serviceAddress2}` : ""),
      city_state_zip: building.cityStateZip,
      contact_name: isWarranty ? "Warranty Department" : building.contactName,
      contact_phone: building.contactPhone,
      contact_email: building.contactEmail,
      signature: null,
      t_time: serviceNotesInputs.reduce(
        (sum, n) => sum + parseFloat(n.technicianTime),
        0
      ),
      t_ot: serviceNotesInputs.reduce(
        (sum, n) => sum + parseFloat(n.technicianOvertime),
        0
      ),
      h_time: serviceNotesInputs.reduce(
        (sum, n) => sum + parseFloat(n.helperTime),
        0
      ),
      h_ot: serviceNotesInputs.reduce(
        (sum, n) => sum + parseFloat(n.helperOvertime),
        0
      ),
      materials: materialNotes,
      notes: serviceNotesInputs.map((n) => ({
        date: formatDate(n.date as Date),
        t_time: parseFloat(n.technicianTime),
        t_ot: parseFloat(n.technicianOvertime),
        h_time: parseFloat(n.helperTime),
        h_ot: parseFloat(n.helperOvertime),
        remote: n.remoteWork,
        note: n.notes,
      })),
      technician_name: authorTechnician.name,
      technician_phone: authorTechnician.phone,
      technician_email: authorTechnician.email,
      print_name: null,
      sign_date: null,
      to_emails: isWarranty ? [] : [building.contactEmail],
      start_date: formatDate(firstDate),
      end_date: formatDate(lastDate),
    };
    try {
      const res = await fetch("https://api.appliedbas.com/v2/mail/sr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationHeader,
        },
        body: JSON.stringify(message),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error sending report");
      toast.success(
        <span className="text-lg md:text-sm">
          Service report sent successfully!
        </span>
      );
      // Optionally, redirect to the report view page
      window.location.href = `/dashboard/service-reports/${id}`;
    } catch {
      toast.error(
        <span className="text-lg md:text-sm">
          Failed to send service report. Please try again later.
        </span>
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewBuildingChange = (field: string, value: string) => {
    setNewBuilding((prev) => ({ ...prev, [field]: value }));
  };

  // Helper to format US phone numbers as XXX-XXX-XXXX and strip non-digits
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleAddBuilding = async (e: FormEvent) => {
    e.preventDefault();

    // Handle adding the new building
    const newBuildingData: DocumentData = {
      "service-address1": newBuilding.serviceAddress1,
      "service-address2": newBuilding.serviceAddress2,
      "city-state-zip": newBuilding.cityStateZip,
      "contact-name": newBuilding.contactName,
      "contact-email": newBuilding.contactEmail,
      "contact-phone": newBuilding.contactPhone,
    };

    const docRef = doc(firestore, "clients", client!.objectID);
    try {
      await updateDoc(docRef, {
        ["buildings"]: arrayUnion(newBuildingData),
      });
      toast.success(
        <span className="text-lg md:text-sm">Building added successfully!</span>
      );
    } catch (error) {
      console.error("Error adding building:", error);
      toast.error(
        <span className="text-lg md:text-sm">
          Failed to add building. Please try again later.
        </span>
      );
    }

    // Optionally, you could also update the client state to include this new building
    setClient((prev) => {
      if (!prev) return null;
      // Convert newBuildingData (Firestore field names) to Building type
      const newBuildingObj: Building = {
        serviceAddress1: newBuildingData["service-address1"],
        serviceAddress2: newBuildingData["service-address2"],
        cityStateZip: newBuildingData["city-state-zip"],
        contactName: newBuildingData["contact-name"],
        contactEmail: newBuildingData["contact-email"],
        contactPhone: newBuildingData["contact-phone"],
      };
      return {
        ...prev,
        buildings: [...(prev.buildings || []), newBuildingObj],
      };
    });

    // Reset the form
    setAddBuildingOpen(false);
    setNewBuilding({
      serviceAddress1: "",
      serviceAddress2: "",
      cityStateZip: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    });
  };

  // Generate PDF preview via API
  const handleGeneratePDF = async () => {
    if (!user) {
      toast.error(
        <span className="text-lg md:text-sm">
          You must be logged in to generate a PDF
        </span>
      );
      return;
    }
    if (!client || !building) {
      toast.error(
        <span className="text-lg md:text-sm">
          Please select a client and building
        </span>
      );
      return;
    }
    if (!authorTechnician) {
      toast.error(
        <span className="text-lg md:text-sm">
          Error loading author technician. Try again later.
        </span>
      );
      return;
    }
    setSubmitting(true);
    try {
      const currentEmployee: Employee = await getEmployeeByEmail(user.email!);
      // create base64 encoded bearer token
      const token = btoa(
        `${currentEmployee.clientId}:${currentEmployee.clientSecret}`
      );

      if (!token) {
        toast.error(
          <span className="text-lg md:text-sm">
            Error loading employee data. Please try again.
          </span>
        );
        return;
      }

      const authorizationHeader = `Bearer ${token}`;

      const formatDate = (d: Date) => d.toISOString().substring(0, 10);
      const message: ServiceReportPDFMessage = {
        report_no: docId || 0,
        date: formatDate(new Date()),
        client_name: client.clientName,
        service_address:
          building.serviceAddress1 +
          (building.serviceAddress2 ? ` ${building.serviceAddress2}` : ""),
        city_state_zip: building.cityStateZip,
        contact_name: building.contactName,
        contact_phone: building.contactPhone,
        contact_email: building.contactEmail,
        signature: null,
        t_time: serviceNotesInputs.reduce(
          (sum, n) => sum + parseFloat(n.technicianTime),
          0
        ),
        t_ot: serviceNotesInputs.reduce(
          (sum, n) => sum + parseFloat(n.technicianOvertime),
          0
        ),
        h_time: serviceNotesInputs.reduce(
          (sum, n) => sum + parseFloat(n.helperTime),
          0
        ),
        h_ot: serviceNotesInputs.reduce(
          (sum, n) => sum + parseFloat(n.helperOvertime),
          0
        ),
        materials: materialNotes,
        notes: serviceNotesInputs.map((n) => ({
          date: formatDate(n.date as Date),
          t_time: parseFloat(n.technicianTime),
          t_ot: parseFloat(n.technicianOvertime),
          h_time: parseFloat(n.helperTime),
          h_ot: parseFloat(n.helperOvertime),
          remote: n.remoteWork,
          note: n.notes,
        })),
        technician_name: authorTechnician.name,
        technician_phone: authorTechnician.phone,
        print_name: null,
        sign_date: null,
      };

      const res = await fetch("https://api.appliedbas.com/v1/pdf/sr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationHeader,
        },
        body: JSON.stringify(message),
      });

      const data: { message: string; url: string; code: number } =
        await res.json();
      if (!res.ok) {
        throw new Error(data.message || "PDF API error");
      }
      window.open(data.url, "_blank");

      toast.success(
        <span className="text-lg md:text-sm">PDF generated and downloaded</span>
      );
    } catch {
      toast.error(
        <span className="text-lg md:text-sm">Error generating PDF. Please try again.</span>
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* AI Rephrase Dialog */}
      <Dialog open={rephraseDialogOpen} onOpenChange={setRephraseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Rephrase</DialogTitle>
          </DialogHeader>
          { isRephrasing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              <span className="ml-2">Rephrasing...</span>
            </div>
            ) : (
              <Textarea value={rephrase ?? ''} readOnly rows={4} />
            )}
          <DialogFooter>
            <Button
              onClick={() => {
                if (currentRephraseIndex !== null) handleRephraseConfirm(currentRephraseIndex);
                setRephraseDialogOpen(false);
              }}
              disabled={!rephrase}
            >
              Confirm
            </Button>
            <Button variant="outline" onClick={() => setRephraseDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit}>
        <div className="mt-4 flex flex-col gap-6">
          {/* === DocId === */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="docId" className="text-lg md:text-sm">
              Report No.
            </Label>
            <Input
              id="docId"
              type="text"
              value={docId !== null ? docId.toString() : ""}
              readOnly
              className="w-full md:max-w-96"
            />
          </div>
          {/* === Assigned Technician === */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="authorTechnician" className="text-lg md:text-sm">
              Assigned Technician
            </Label>
            <EmployeeSelect
              employees={technicians}
              loading={loadingEmployees}
              error={employeesError}
              refetch={refetchEmployees}
              selectedEmployee={assignedTechnician}
              setSelectedEmployee={setAssignedTechnician}
              placeholder="Select Technician..."
            />
            <p className="text-base md:text-sm text-muted-foreground mt-1">
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
              }}
            />
          </div>

          {/* === Building Select (ShadCN) – only if client chosen === */}
          {client && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="buildingSelect">Building Select</Label>
              {client.buildings && client.buildings.length > 0 ? (
                <div className="flex flex-col gap-2 md:max-w-96">
                  <Select
                    value={building ? building.serviceAddress1 : ""}
                    onValueChange={(val) => {
                      if (val === "") {
                        setBuilding(null);
                        return;
                      }

                      const found = client.buildings.find(
                        (bld) => bld.serviceAddress1 === val
                      );

                      if (found) {
                        setBuilding(found);
                        // Set as original contact
                        setOriginalContact({
                          contactName: found.contactName ?? "",
                          contactEmail: found.contactEmail ?? "",
                          contactPhone: found.contactPhone ?? "",
                        });
                      }
                    }}
                  >
                    <SelectTrigger
                      id="buildingSelect"
                      className="w-full"
                    >
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
              <Dialog open={addBuildingOpen} onOpenChange={setAddBuildingOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="secondary" className="w-fit">
                    + Add Building
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Building</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddBuilding} className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="new_serviceAddress1">
                        Service Address 1
                      </Label>
                      <Input
                        id="new_serviceAddress1"
                        value={newBuilding.serviceAddress1}
                        onChange={(e) =>
                          handleNewBuildingChange(
                            "serviceAddress1",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="new_serviceAddress2">
                        Service Address 2
                      </Label>
                      <Input
                        id="new_serviceAddress2"
                        value={newBuilding.serviceAddress2}
                        onChange={(e) =>
                          handleNewBuildingChange(
                            "serviceAddress2",
                            e.target.value
                          )
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
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          handleNewBuildingChange("contactPhone", formatted);
                        }}
                        type="tel"
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                        maxLength={12}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" variant="default">
                        Add Building
                      </Button>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* === Contact & Address Fields (always editable, visually separated) === */}
          {building && (
            <div className="flex flex-col gap-4 p-4 mt-4 mb-2 border rounded-lg bg-muted/30">
              <span className="font-semibold text-lg md:text-sm mb-2">
                Contact Information
              </span>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={building.contactName}
                  onChange={(e) =>
                    setBuilding((prev) =>
                      prev
                        ? {
                            ...prev,
                            contactName: e.target.value,
                          }
                        : null
                    )
                  }
                  placeholder="Contact Name"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  value={building.contactEmail}
                  onChange={(e) =>
                    setBuilding((prev) =>
                      prev
                        ? {
                            ...prev,
                            contactEmail: e.target.value,
                          }
                        : null
                    )
                  }
                  placeholder="Contact Email"
                  type="email"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={building.contactPhone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setBuilding((prev) =>
                      prev ? { ...prev, contactPhone: formatted } : null
                    );
                  }}
                  type="tel"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  maxLength={12}
                  placeholder="Contact Phone"
                />
              </div>
              {/* Save/Cancel Contact Buttons */}
              {contactChanged && (
                <div className="flex gap-2 self-end mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelContact}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSaveContact}
                  >
                    Save Contact Information
                  </Button>
                </div>
              )}
            </div>
          )}
          {/* === Warranty Checkbox === */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="warrantySwitch" className="text-lg md:text-sm">
              Warranty Service
            </Label>
            <Switch
              id="warrantySwitch"
              checked={isWarranty}
              onCheckedChange={(checked: boolean) => setIsWarranty(checked)}
            />
            <span className="text-lg md:text-sm">
              {isWarranty ? "Yes" : "No"}
            </span>
          </div>
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
            <span className="text-lg md:text-sm">Service Notes</span>
            {serviceNotesInputs.map((note, idx) => (
              <div key={idx} className="mt-4 border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg md:text-sm font-semibold">
                    Entry #{idx + 1}
                  </span>
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
                          "w-full max-w-[400px] justify-start text-left font-normal flex items-center " +
                          (!note.date ? "text-muted-foreground" : "")
                        }
                      >
                        <span className="flex-1 text-left">
                          {note.date.toDateString()}
                        </span>
                        <CalendarIcon className="ml-2 w-4 h-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={note.date}
                        onSelect={(date) => {
                          handleServiceNoteDateChange(idx, date);
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
                    className="cursor-pointer"
                    checked={note.remoteWork === "Y"}
                    onCheckedChange={(checked: boolean) =>
                      handleServiceNoteChange(
                        idx,
                        "remoteWork",
                        checked ? "Y" : "N"
                      )
                    }
                  />
                  <span className="ml-2 text-lg md:text-sm">
                    {note.remoteWork === "Y" ? "Yes" : "No"}
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
                  <div className="flex justify-end mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                         const wordCount = note.notes.trim().split(/\s+/).filter(w => w).length;
                         if (wordCount < 6) {
                          toast.error(
                            <span className="text-lg md:text-sm">
                              Please enter at least 6 words before rephrasing.
                            </span>
                          );
                          return;
                        }
                        setCurrentRephraseIndex(idx);
                        setRephrase(null);
                        setRephraseDialogOpen(true);
                        handleRephrase(idx);
                      }}
                    >
                      AI Rephrase
                    </Button>
                  </div>
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

          {/* === Preview/Save/Submit Buttons === */}
          <div className="mt-8 flex gap-4 mb-8">
            <Button
              type="button"
              variant="outline"
              disabled={submitting || !client || !building}
              onClick={handleGeneratePDF}
            >
              Preview
            </Button>
            <Button
              type="button"
              disabled={submitting || !client || !building}
              variant="outline"
              onClick={handleSaveDraft}
            >
              Save
            </Button>
            <Button
              type="submit"
              disabled={submitting || !client || !building}
              variant="default"
            >
              Submit
            </Button>
            {submitting && (
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
