"use client";

import ServiceReportForm from "@/components/ServiceReportForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import EditPageSkeleton from "@/components/EditPageSkeleton";

const CreateServiceReport: React.FC = () => {
  const { user, firebaseUser, loading } = useAuth();

  if (loading || !user || !firebaseUser) {
    return <EditPageSkeleton titleWidth="md" />;
  }

  return (
    <div className="flex flex-col space-y-6 pb-8">
      {/* Breadcrumb */}
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
            <BreadcrumbPage>Create</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Create Service Report</h1>
      </header>
      <ServiceReportForm authorTechnician={firebaseUser} />
    </div>
  );
};

export default CreateServiceReport;
