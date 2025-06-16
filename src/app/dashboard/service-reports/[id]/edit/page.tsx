"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { ServiceReport } from "@/models/ServiceReport";
import ServiceReportForm from "@/components/ServiceReportForm";

const EditServiceReportPage = () => {
  const { id } = useParams();
  const [serviceReport, setServiceReport] = useState<ServiceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      setLoading(true);
      const ref = doc(firestore, "reports", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data: DocumentData = snap.data();
        setServiceReport({
          id: snap.id,
          authorTechnicianRef: data["author-technician-ref"],
          docId: data["doc-id"],
          clientName: data["client-name"],
          serviceAddress1: data["service-address1"],
          serviceAddress2: data["service-address2"],
          cityStateZip: data["city-state-zip"],
          contactName: data["contact-name"],
          contactPhone: data["contact-phone"],
          contactEmail: data["contact-email"],
          materialNotes: data["material-notes"],
          serviceNotes: Array.isArray(data["service-notes"])
            ? data["service-notes"].map((note: unknown): ServiceReport["serviceNotes"][number] => {
                if (
                  typeof note === "object" &&
                  note !== null &&
                  "date" in note &&
                  "helper-overtime" in note &&
                  "helper-time" in note &&
                  "remote-work" in note &&
                  "service-notes" in note &&
                  "technician-overtime" in note &&
                  "technician-time" in note
                ) {
                  const n = note as Record<string, unknown>;
                  return {
                    date: n["date"] as ServiceReport["serviceNotes"][number]["date"],
                    helperOvertime: String(n["helper-overtime"] ?? ""),
                    helperTime: String(n["helper-time"] ?? ""),
                    remoteWork: String(n["remote-work"] ?? ""),
                    serviceNotes: String(n["service-notes"] ?? ""),
                    technicianOvertime: String(n["technician-overtime"] ?? ""),
                    technicianTime: String(n["technician-time"] ?? ""),
                  };
                }
                // fallback: empty ServiceNote with minimal valid Timestamp
                return {
                  date: new Date(0) as unknown as ServiceReport["serviceNotes"][number]["date"],
                  helperOvertime: "",
                  helperTime: "",
                  remoteWork: "",
                  serviceNotes: "",
                  technicianOvertime: "",
                  technicianTime: "",
                };
              })
            : [],
          createdAt: data["created-at"],
          dateSigned: data["date-signed"],
          draft: data["draft"],
          printedName: data["printed-name"],
          ...snap.data(),
        } as ServiceReport);
      }

      
      setLoading(false);
    }
    fetchReport();
  }, [id]);

  if (loading) return <div>Loading…</div>;
  if (!serviceReport) return <div>Service Report not found.</div>;

  return (
    <main>
      <h1>Edit Service Report</h1>
      <ServiceReportForm serviceReport={serviceReport} />
    </main>
  );
};

export default EditServiceReportPage;