"use client";
import { useState, useEffect, FormEvent } from "react";
import { ServiceNote, ServiceReport } from "@/models/ServiceReport";
import { Employee as EmployeeModel } from "@/models/Employee";
import { Building, Client, clientConverter, ClientHit } from "@/models/Client";
import {
  getDoc,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees } from "@/hooks/useEmployees";



export function useServiceReportFormHandlers(serviceReport?: ServiceReport) {
  const { user } = useAuth();
  const {
    technicians,
    loading: loadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useEmployees();

  const [isNewReport, setIsNewReport] = useState<boolean>(!serviceReport);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [docId, setDocId] = useState<number | null>(null);
  const [authorTechnician, setAuthorTechnician] =
    useState<EmployeeModel | null>(null);
  const [assignedTechnician, setAssignedTechnician] =
    useState<EmployeeModel | null>(null);
  const [client, setClient] = useState<Client | null>(null);
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
  const [addBuildingOpen, setAddBuildingOpen] = useState(false);

  const [originalContact, setOriginalContact] = useState({
    contactName: serviceReport?.contactName || "",
    contactEmail: serviceReport?.contactEmail || "",
    contactPhone: serviceReport?.contactPhone || "",
  });

  const [newBuilding, setNewBuilding] = useState({
    serviceAddress1: "",
    serviceAddress2: "",
    cityStateZip: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  useEffect(() => {
    async function initForm() {
      setLoading(true);
      if (!serviceReport) {
        setIsNewReport(true);
        setLoading(false);
        return;
      }
      if (serviceReport.authorTechnicianRef) {
        const authorSnap = await getDoc(serviceReport.authorTechnicianRef);
        if (authorSnap.exists()) {
          const authorData = authorSnap.data();
          setAuthorTechnician({
            id: authorSnap.id,
            clientId: authorData["client-id"],
            clientSecret: authorData["client-secret"],
            createdAt: authorData["created-at"],
            updatedAt: authorData["updated-at"],
            ...authorData,
          } as EmployeeModel);
        }
      }
      if (serviceReport.assignedTechnicianRef) {
        const assignedSnap = await getDoc(serviceReport.assignedTechnicianRef);
        if (assignedSnap.exists()) {
          const assignedData = assignedSnap.data();
          setAssignedTechnician({
            id: assignedSnap.id,
            clientId: assignedData["client-id"],
            clientSecret: assignedData["client-secret"],
            createdAt: assignedData["created-at"],
            updatedAt: assignedData["updated-at"],
            ...assignedData,
          } as EmployeeModel);
        }
      }
      if (serviceReport.clientName) {
        const q = query(
          collection(firestore, "clients").withConverter(clientConverter),
          where("name", "==", serviceReport.clientName)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data: Client = docSnap.data();
          
          setClient(data);
          const foundBuilding = data.buildings.find(
            (bld) => bld.serviceAddress1 === serviceReport.serviceAddress1
          );
          setBuilding(foundBuilding ?? null);
        }
      }

      setContactName(serviceReport.contactName || "");
      setContactEmail(serviceReport.contactEmail || "");
      setContactPhone(serviceReport.contactPhone || "");
      setServiceAddress1(serviceReport.serviceAddress1 || "");
      setServiceAddress2(serviceReport.serviceAddress2 || "");
      setCityStateZip(serviceReport.cityStateZip || "");
      setMaterialNotes(serviceReport.materialNotes || "");
      if (serviceReport.serviceNotes && serviceReport.serviceNotes.length > 0) {
        setServiceNotesInputs(
          serviceReport.serviceNotes.map((sn) => ({
            date: sn.date.toDate().toISOString().substring(0, 10),
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
            date: "",
            technicianTime: "0.0",
            technicianOvertime: "0.0",
            helperTime: "0.0",
            helperOvertime: "0.0",
            remoteWork: "N",
            notes: "",
          },
        ]);
      }
      setLoading(false);
    }
    initForm();
  }, [serviceReport]);

  const handleAddServiceNote = () => {
    setServiceNotesInputs((prev) => [
      ...prev,
      {
        date: "",
        technicianTime: "0.0",
        technicianOvertime: "0.0",
        helperTime: "0.0",
        helperOvertime: "0.0",
        remoteWork: "N",
        notes: "",
      },
    ]);
  };

  const handleFetchClient = async (id: string) => {
    const clientRef = doc(firestore, "clients", id).withConverter(clientConverter);
    const clientSnap = await getDoc(clientRef);
    if (clientSnap.exists()) {
      const clientData: Client = clientSnap.data();
      return clientData;
    }
    throw new Error("Client not found");
  }

  const handleRemoveServiceNote = (index: number) => {
    setServiceNotesInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleServiceNoteChange = (
    index: number,
    field: keyof ServiceNote,
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
    if (!docId) {
      try {
        const reservedDocId = await handleReserveDocId();
        setDocId(reservedDocId);
      } catch {
        toast.error("Failed to reserve document ID");
        setSubmitting(false);
        return;
      }
    }

    // TODO: Complete logic
    setSubmitting(false);
  };

  // Reserve a doc id and get the current report-no from the counter doc
  const handleReserveDocId = async (): Promise<number | null> => {
    const counterRef = doc(firestore, "counter", "s5Lwh7q9cNZvYSJDAc2N");
    const reportNo = await runTransaction(firestore, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        throw new Error("Counter document does not exist");
      }
      const data = counterDoc.data();
      const currentReportNo = data["report-no"] + 1;
      transaction.update(counterRef, { "report-no": currentReportNo });
      return currentReportNo;
    });

    return reportNo;
  };

  const handleUpdateContactInfo = async () => {
    if (!client) {
      toast.error("Please select a client first.");
      return;
    }

    if (!building) {
      toast.error("Please select a building first.");
      return;
    }

    // Validate contact info
    if (!contactName || !contactEmail || !contactPhone) {
      toast.error("Please fill in all contact fields.");
      return;
    }
    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(contactEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(contactPhone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    // Update the original contact info
    setOriginalContact({
      contactName,
      contactEmail,
      contactPhone,
    });

    // Update the client in Firestore
    const clientRef = doc(firestore, "clients", client.objectID);
    try {
      await updateDoc(clientRef, {
        buildings: updatedClient.buildings.map((bld) => ({
          "service-address1": bld.serviceAddress1,
          "service-address2": bld.serviceAddress2,
          "city-state-zip": bld.cityStateZip,
          "contact-name": bld.contactName,
          "contact-email": bld.contactEmail,
          "contact-phone": bld.contactPhone,
        })),
      });
      toast.success("Contact info updated!");
    } catch {
      toast.error("Failed to update contact info");
    }
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);

    try {
      const updatedData = {
        "author-technician-ref": authorTechnician
          ? doc(firestore, "employees", authorTechnician.id)
          : null,
        "assigned-technician-ref": assignedTechnician
          ? doc(firestore, "employees", assignedTechnician.id)
          : null,
        "client-name": client?.clientName || "",
        "doc-id": docId,
        "service-address1": serviceAddress1,
        "service-address2": serviceAddress2,
        "city-state-zip": cityStateZip,
        "contact-name": contactName,
        "contact-phone": contactPhone,
        "contact-email": contactEmail,
        "material-notes": materialNotes,
        draft: true,
        "service-notes": serviceNotesInputs.map((note) => ({
          date: note.date ? new Date(note.date) : new Date(),
          "technician-time": note.technicianTime,
          "technician-overtime": note.technicianOvertime,
          "helper-time": note.helperTime,
          "helper-overtime": note.helperOvertime,
          "remote-work": note.remoteWork,
          "service-notes": note.notes,
        })),
        "updated-at": new Date(),
      };

      // If no service report is provided, reserve a new docId
      if (isNewReport) {
        const reservedDocId = await handleReserveDocId();
        setDocId(reservedDocId);
        updatedData["doc-id"] = reservedDocId;

      } else {
        // Update existing service report
        const serviceReportRef = doc(firestore, "reports", serviceReport!.id);
        await updateDoc(serviceReportRef, updatedData);
      }

      if (!user) {
        toast.error("You must be logged in to save a draft.");
        return;
      }

      toast.success("Draft saved!");
    } catch (error) {
      toast.error("Failed to save draft");
      console.error("Error saving draft:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddBuilding = async (e: FormEvent) => {
    e.preventDefault();
    if (!client) {
      toast.error("Please select a client first.");
      return;
    }

    // Store the new building in the client
    const updatedBuildings = [...(client.buildings || []), newBuilding];
    const updatedClient: ClientHit = {
      ...client,
      buildings: updatedBuildings,
    };
    setClient(updatedClient);

    // convert to firestore format
    const newBuildingData = {
      "service-address1": newBuilding.serviceAddress1,
      "service-address2": newBuilding.serviceAddress2,
      "city-state-zip": newBuilding.cityStateZip,
      "contact-name": newBuilding.contactName,
      "contact-email": newBuilding.contactEmail,
      "contact-phone": newBuilding.contactPhone,
    };

    const clientRef = doc(firestore, "clients", client.objectID);
    try {
      await updateDoc(clientRef, {
        buildings: [
          ...(client.buildings || []).map((bld) => ({
            "service-address1": bld.serviceAddress1,
            "service-address2": bld.serviceAddress2,
            "city-state-zip": bld.cityStateZip,
            "contact-name": bld.contactName,
            "contact-email": bld.contactEmail,
            "contact-phone": bld.contactPhone,
          })),
          newBuildingData,
        ],
      });
      toast.success("Building added to client!");
    } catch {
      toast.error("Failed to add building to client");
    }

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

  return {
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
    handleServiceNoteChange,
    handleUpdateContactInfo,
    handleSubmit,
    handleSaveDraft,
    handleFetchClient,
    technicians,
    loadingEmployees,
    employeesError,
    refetchEmployees,
  };
}
