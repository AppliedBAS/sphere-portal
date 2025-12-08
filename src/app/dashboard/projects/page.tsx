"use client";

import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DashboardCard } from "@/components/DashboardCard";
import { FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { ProjectsSearchFilters } from "@/components/projects/SearchFilters";
import { Pagination } from "@/components/Pagination";
import ReportsSkeleton from "@/components/ReportsSkeleton";

export default function Projects() {
  const router = useRouter();
  const {
    projects,
    loading,
    projectsCount,
    totalCount,
    totalPages,
    qSearch,
    qActive,
    qPage,
    qPageSize,
    setProjects
  } = useProjects();

  // Reset filters
  const handleFilterReset = () => {
    window.location.search = "";
  };
  
  const handleDocIdChange = (val: number | null) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("docId", val.toString()); else params.delete("docId");
    window.location.search = params.toString();
  };

  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("q", val); else params.delete("q");
    window.location.search = params.toString();
  };

  const handleActiveChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("active", val); else params.delete("active");
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
    return <ReportsSkeleton tableColumns={7} filterInputs={2} />;
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
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold">Projects</h1>

      {/* Mobile card layout (default) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {projects.map((project) => (
          <DashboardCard
            key={project.objectID}
            icon={<FolderOpen />}
            title={project.client}
            subtitle={`Project ${project.docId} - ${project.location} - ${project.description}`}
            date={new Date(project.createdAt).toLocaleDateString()}
            onOpen={() => router.push(`/dashboard/projects/${project.objectID}`)}
          />
        ))}
      </div>

      {/* Desktop/table layout for md+ screens */}
      <div className="hidden md:block">
        <ProjectsSearchFilters
          qSearch={qSearch}
          qActive={qActive}
          onSearchChange={handleSearchChange}
          onActiveChange={handleActiveChange}
          onDocIdChange={handleDocIdChange}
          onFilterReset={handleFilterReset}
        />
        <ProjectsTable projects={projects} setProjects={setProjects} />
        <Pagination
          qPage={qPage}
          qPageSize={qPageSize}
          totalPages={totalPages}
          ordersCount={projectsCount}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}