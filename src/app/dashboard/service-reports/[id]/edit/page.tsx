"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { ServiceReport, serviceReportConverter } from "@/models/ServiceReport";
import ServiceReportForm from "@/components/ServiceReportForm";

const EditServiceReportPage = () => {
  const { id } = useParams();
  const [serviceReport, setServiceReport] = useState<ServiceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      setLoading(true);
      const ref = doc(firestore, "reports", id as string).withConverter(serviceReportConverter);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data: ServiceReport = snap.data();
        setServiceReport(data);
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