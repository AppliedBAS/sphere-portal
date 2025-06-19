"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { ServiceReport, serviceReportConverter } from "@/models/ServiceReport";
import ServiceReportForm from "@/components/ServiceReportForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

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
    <div className="flex flex-col space-y-6 pb-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/service-reports">Service Reports</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
                <Link href={`/dashboard/service-reports/${id}`}>
                {id}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold">Edit Service Report</h1>
      <ServiceReportForm serviceReport={serviceReport} />
    </div>
  );
};

export default EditServiceReportPage;