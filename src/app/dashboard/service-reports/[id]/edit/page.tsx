"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { ServiceReport, serviceReportConverter } from "@/models/ServiceReport";
import { Employee, employeeConverter } from "@/models/Employee";
import ServiceReportForm from "@/components/ServiceReportForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import EditPageSkeleton from "@/components/EditPageSkeleton";
import { useAuth } from "@/contexts/AuthContext";

const EditServiceReportPage = () => {
  const { id } = useParams();
  const { user, firebaseUser } = useAuth();
  const [serviceReport, setServiceReport] = useState<ServiceReport | null>(null);
  const [authorTechnician, setAuthorTechnician] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      if (!id || !firebaseUser) return;
      
      // If we already have the report, just update authorTechnician if needed
      if (serviceReport) {
        if (!authorTechnician) {
          if (serviceReport.authorTechnicianRef) {
            const empSnap = await getDoc(
              serviceReport.authorTechnicianRef.withConverter(employeeConverter)
            );
            if (empSnap.exists()) {
              setAuthorTechnician(empSnap.data() as Employee);
            } else {
              setAuthorTechnician(firebaseUser);
            }
          } else {
            setAuthorTechnician(firebaseUser);
          }
        }
        return;
      }
      
      setLoading(true);
      
      // Fetch service report
      const ref = doc(firestore, "reports", id as string).withConverter(serviceReportConverter);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      
      const report = snap.data();
      setServiceReport(report);

      // Fetch author technician
      if (report.authorTechnicianRef) {
        const empSnap = await getDoc(
          report.authorTechnicianRef.withConverter(employeeConverter)
        );
        if (empSnap.exists()) {
          setAuthorTechnician(empSnap.data() as Employee);
        } else {
          setAuthorTechnician(firebaseUser);
        }
      } else {
        setAuthorTechnician(firebaseUser);
      }

      setLoading(false);
    }
    fetchReport();
  }, [id, firebaseUser, serviceReport, authorTechnician]);

  if (loading) {
    return <EditPageSkeleton titleWidth="md" />;
  }
  if (!serviceReport) return <div>Service Report not found.</div>;
  if (!user || !authorTechnician) {
    return <EditPageSkeleton titleWidth="md" />;
  }

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
      <ServiceReportForm 
        serviceReport={serviceReport} 
        authorTechnician={authorTechnician}
      />
    </div>
  );
};

export default EditServiceReportPage;