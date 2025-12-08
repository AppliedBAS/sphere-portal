"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardCard } from "@/components/DashboardCard";
import { ClipboardList } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ServiceReportsTable } from "@/components/service-reports/ServiceReportsTable";
import { ServiceReportsSearchFilters } from "@/components/service-reports/SearchFilters";
import { Pagination } from "@/components/Pagination";
import { useServiceReports } from "@/hooks/useServiceReports";
import ReportsSkeleton from "@/components/ReportsSkeleton";

export default function ServiceReports() {
  const router = useRouter();
  const {
    reports,
    loading,
    reportsCount,
    totalCount,
    totalPages,
    qSearch,
    qDraft,
    qRemote,
    qWarranty,
    qPage,
    qPageSize
  } = useServiceReports();

  // Handlers for filters (these should update the URL, which triggers the hook)
  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("q", val); else params.delete("q");
    window.location.search = params.toString();
  };
  const handleDraftChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("draft", val); else params.delete("draft");
    window.location.search = params.toString();
  };
  // const handleRemoteChange = (val: string) => {
  //   const params = new URLSearchParams(window.location.search);
  //   if (val) params.set("remote", val); else params.delete("remote");
  //   window.location.search = params.toString();
  // };
  const handleAmountRangeChange = (range: [number, number]) => {
    const params = new URLSearchParams(window.location.search);
    params.set("minAmount", range[0].toString());
    params.set("maxAmount", range[1].toString());
    window.location.search = params.toString();
  };
  const handleWarrantyChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("warranty", val); else params.delete("warranty");
    window.location.search = params.toString();
  };
  const handleFilterReset = () => {
    window.location.search = "";
  };
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    window.location.search = params.toString();
  };
  const handlePageSizeChange = (size: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("pageSize", size.toString());
    window.location.search = params.toString();
  };


  if (loading) {
    return <ReportsSkeleton tableColumns={6} filterInputs={4} />;
  }

  return (
    <div className="space-y-4">
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
            <BreadcrumbPage>Service Reports</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold">Service Reports</h1>

      {/* Mobile view */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {reports.map((report) => (
          <DashboardCard
            key={report.objectID}
            icon={<ClipboardList />}
            title={report.clientName}
            subtitle={`SR ${report.docId}`}
            date={new Date(report.createdAt).toLocaleDateString()}
            onOpen={() =>
              router.push(`/dashboard/service-reports/${report.objectID}`)
            }
          />
        ))}
      </div>

      {/* Desktop/table layout for md+ screens */}
      <div className="hidden md:block">
        <ServiceReportsSearchFilters
          qSearch={qSearch}
          qAmountRange={[0, 100000]}
          qDraft={qDraft}
          qRemote={qRemote}
          qWarranty={qWarranty}
          onSearchChange={handleSearchChange}
          onAmountRangeChange={handleAmountRangeChange}
          onDraftChange={handleDraftChange}
          onWarrantyChange={handleWarrantyChange}
          onFilterReset={handleFilterReset}
        />

        <ServiceReportsTable
          reports={reports}
        />

        <Pagination
          qPage={qPage}
          qPageSize={qPageSize}
          ordersCount={reportsCount}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
