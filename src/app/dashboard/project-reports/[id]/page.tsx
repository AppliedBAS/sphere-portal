"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { projectReportConverter, type ProjectReport } from "@/models/ProjectReport";
import { employeeConverter, Employee } from "@/models/Employee";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";

const ProjectReportPage = () => {
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const [report, setReport] = useState<ProjectReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorTechnician, setAuthorTechnician] = useState<Employee | null>(null);
  const [leadTechnician, setLeadTechnician] = useState<Employee | null>(null);
  const [assignedTechnicians, setAssignedTechnicians] = useState<Employee[]>([]);

  useEffect(() => {
    async function fetchReport() {
      if (!idParam) return;
      setLoading(true);
      const docRef = doc(firestore, "project reports", idParam).withConverter(projectReportConverter);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as ProjectReport;
        setReport(data);

        // Fetch author technician
        const authorSnap = await getDoc(data.authorTechnicianRef.withConverter(employeeConverter));
        setAuthorTechnician(authorSnap.exists() ? authorSnap.data() : null);

        // Fetch lead technician
        if (data.leadTechnicianRef) {
          const leadSnap = await getDoc(data.leadTechnicianRef.withConverter(employeeConverter));
          setLeadTechnician(leadSnap.exists() ? leadSnap.data() : null);
        }

        // Fetch assigned technicians
        if (data.assignedTechniciansRef && data.assignedTechniciansRef.length > 0) {
          const snaps = await Promise.all(
            data.assignedTechniciansRef.map((ref) =>
              getDoc(ref.withConverter(employeeConverter))
            )
          );
          setAssignedTechnicians(
            snaps.filter((s) => s.exists()).map((s) => s.data() as Employee)
          );
        }
      }
      setLoading(false);
    }
    fetchReport();
  }, [idParam]);

  if (loading) return <div>Loading…</div>;
  if (!report) return <div>Project Report not found.</div>;

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
              <Link href="/dashboard/project-reports">Project Reports</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{report.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-2">PR {report.projectDocId} - {report.docId}</h1>
      <div className="mb-6">
        <Badge
          variant={report.draft ? "outline" : "default"}
          className={
            report.draft
              ? "text-yellow-800 border-yellow-300 bg-yellow-50"
              : "text-green-800 border-green-300 bg-green-50"
          }
        >
          {report.draft ? "Draft" : "Submitted"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Details */}
        <Card className="p-4 space-y-4 relative text-lg md:text-base">
          <h2 className="text-xl font-semibold mb-4">Report Details</h2>
          {report.draft && (
            <div className="absolute top-4 right-4 z-10">
              <Link href={`/dashboard/project-reports/${idParam}/edit`} className="block">
                <button
                  type="button"
                  className="p-2 rounded hover:bg-muted transition"
                  aria-label="Edit report"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </Link>
            </div>
          )}
          <div>
            <div className="font-semibold">Client</div>
            <div>{report.clientName}</div>
          </div>
          <div>
            <div className="font-semibold">Location</div>
            <div>{report.location}</div>
          </div>
          <div>
            <div className="font-semibold">Project ID</div>
            <div>{report.projectDocId}</div>
          </div>
          <div>
            <div className="font-semibold">Document ID</div>
            <div>{report.docId}</div>
          </div>
          <div>
            <div className="font-semibold">Created At</div>
            <div>
              {report.createdAt?.toDate
                ? report.createdAt.toDate().toLocaleString()
                : ""}
            </div>
          </div>
          {/* Technicians */}
          <div>
            <div className="font-semibold">Author Technician</div>
            {authorTechnician ? (
              <div>{authorTechnician.name}</div>
            ) : (
              <div className="text-muted-foreground">None</div>
            )}
          </div>
          <div>
            <div className="font-semibold">Lead Technician</div>
            {leadTechnician ? (
              <div>{leadTechnician.name}</div>
            ) : (
              <div className="text-muted-foreground">None</div>
            )}
          </div>
          <div>
            <div className="font-semibold">Assigned Technicians</div>
            {assignedTechnicians.length > 0 ? (
              assignedTechnicians.map((tech, idx) => <div key={idx}>{tech.name}</div>)
            ) : (
              <div className="text-muted-foreground">None</div>
            )}
          </div>
        </Card>

        {/* Materials & Notes */}
        <Card className="p-4 relative text-lg md:text-base">
          <h2 className="text-xl font-semibold mb-2">Materials & Notes</h2>
          {report.draft && (
            <div className="absolute top-4 right-4 z-10">
              <Link href={`/dashboard/project-reports/${idParam}/edit`} className="block">
                <button
                  type="button"
                  className="p-2 rounded hover:bg-muted transition"
                  aria-label="Edit materials & notes"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </Link>
            </div>
          )}
          <div>
            <div className="font-semibold">Materials</div>
            <div style={{ whiteSpace: "pre-line" }}>
              {report.materials || <span className="text-muted-foreground">None</span>}
            </div>
          </div>
          <div>
            <div className="font-semibold">Notes</div>
            <div style={{ whiteSpace: "pre-line" }}>
              {report.notes || <span className="text-muted-foreground">None</span>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectReportPage;