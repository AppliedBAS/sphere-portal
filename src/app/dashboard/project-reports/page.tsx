"use client";

import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DashboardCard } from "@/components/DashboardCard";
import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProjectReports } from "@/hooks/useProjectReports";
import { ProjectReportsTable } from "@/components/project-reports/ProjectReportsTable";
import { ProjectReportsSearchFilters } from "@/components/project-reports/SearchFilters";
import { Pagination } from "@/components/Pagination";
import ReportsSkeleton from "@/components/ReportsSkeleton";


export default function ProjectReports() {
  const router = useRouter();
  const {
    reports,
    loading,
    reportsCount,
    totalCount,
    totalPages,
    qSearch,
    qDraft,
    qPage,
    qPageSize
  } = useProjectReports();

  // Reset filters
  const handleFilterReset = () => {
    window.location.search = "";
  };
  const handleProjectDocIdChange = (val: number | null) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("projectDocId", val.toString()); else params.delete("projectDocId");
    window.location.search = params.toString();
  };
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
    return <ReportsSkeleton tableColumns={7} filterInputs={3} />;
  }

  // Mobile card layout is now always shown by default
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
            <BreadcrumbPage>Project Reports</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold">Project Reports</h1>


      {/* Mobile card layout (default) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {reports.map((report) => (
          <DashboardCard
            key={report.objectID}
            icon={<ClipboardList />}
            title={report.clientName}
            subtitle={`PR ${report.projectDocId} - ${report.docId} - ${report.location} - ${report.description}`}
            date={new Date(report.createdAt).toLocaleDateString()}
            onOpen={() => router.push(`/dashboard/project-reports/${report.objectID}`)}
          />
        ))}
      </div>

      {/* Desktop/table layout for md+ screens */}
      <div className="hidden md:block">
        <ProjectReportsSearchFilters
          qSearch={qSearch}
          qDraft={qDraft}
          onSearchChange={handleSearchChange}
          onDraftChange={handleDraftChange}
          onProjectDocIdChange={handleProjectDocIdChange}
          onFilterReset={handleFilterReset}
        />
        <ProjectReportsTable reports={reports} />
        <Pagination
          qPage={qPage}
          qPageSize={qPageSize}
          totalPages={totalPages} 
          ordersCount={reportsCount} 
          totalCount={totalCount} 
          onPageChange={handlePageChange} 
          onPageSizeChange={handlePageSizeChange}        
        />
      </div>
    </div>
  );
}
