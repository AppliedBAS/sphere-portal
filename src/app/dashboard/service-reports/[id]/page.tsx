"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { firestore } from "@/lib/firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import { ServiceReport, serviceReportConverter } from "@/models/ServiceReport";
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
import { employeeConverter, Employee } from "@/models/Employee";

const ServiceReportViewPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState<ServiceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorTechnician, setAuthorTechnician] = useState<Employee | null>(null);
  const [assignedTechnician, setAssignedTechnician] = useState<Employee | null>(null);

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      setLoading(true);
      const collectionRef = collection(firestore, "reports").withConverter(serviceReportConverter);
      const docRef = doc(collectionRef, id as string);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data: ServiceReport = snap.data();
        setReport(data);
        
        const authorTechnicianRef = data.authorTechnicianRef.withConverter(employeeConverter);
        const authorTechnicianSnap = await getDoc(authorTechnicianRef);
        
        setAuthorTechnician(authorTechnicianSnap.exists()
          ? authorTechnicianSnap.data()
          : null);
        
        if (!data.assignedTechnicianRef) {
          setLoading(false);
          return;
        }
        const assignedTechnicianRef = data.assignedTechnicianRef.withConverter(employeeConverter);
        const assignedTechnicianSnap = await getDoc(assignedTechnicianRef);
        setAssignedTechnician(assignedTechnicianSnap.exists()
          ? assignedTechnicianSnap.data()
          : null);
      }
      
      setLoading(false);
    }
    fetchReport();
  }, [id]);

  if (loading) return <div>Loading…</div>;
  if (!report) return <div>Service Report not found.</div>;

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
            <BreadcrumbPage>{id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-2">Service Report {report.docId}</h1>
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

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Left: Main Info */}
        <Card className="p-4 space-y-4 relative text-lg md:text-base">
          <h2 className="text-xl font-semibold mb-4">Report Details</h2>
          {/* Edit icon for main info */}
          {report.draft && (
            <div className="absolute top-4 right-4 z-10">
              {report.draft  && (
                <Link href={`/dashboard/service-reports/${id}/edit`} className="block">
                  <button
                    type="button"
                    className="p-2 rounded hover:bg-muted transition"
                    aria-label="Edit main info"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </Link>
              )}
            </div>
          )}
          <div>
            <div className="font-semibold">Client</div>
            <div>{report.clientName}</div>
          </div>
          <div>
            <div className="font-semibold">Service Address</div>
            <div>
              {report.serviceAddress1}
              {report.serviceAddress2 ? `, ${report.serviceAddress2}` : ""}
            </div>
          </div>
          <div>
            <div className="font-semibold">City/State/ZIP</div>
            <div>{report.cityStateZip}</div>
          </div>
          {/* Contact Info */}
          <div>
            <div className="font-semibold">Contact</div>
              {report.contactName && <div>{report.contactName}</div>}
              {report.contactPhone && <div>{report.contactPhone}</div>}
              {report.contactEmail && <div>{report.contactEmail}</div>}
          </div>
          {/* Author Technician */}
          <div>
            <div className="font-semibold">Author Technician</div>
            {authorTechnician ? (
              <>
                {authorTechnician?.name && <div>{authorTechnician.name}</div>}
                {authorTechnician?.phone && <div>{authorTechnician.phone}</div>}
                {authorTechnician?.email && <div>{authorTechnician.email}</div>}
              </>
            ) : (
              <div className="text-muted-foreground">None</div>
            )}
          </div>
          {/* Assigned Technician */}
          <div>
            <div className="font-semibold">Assigned Technician</div>
            {assignedTechnician ? (
              <>
                {assignedTechnician?.name && <div>{assignedTechnician.name}</div>}
                {assignedTechnician?.phone && <div>{assignedTechnician.phone}</div>}
                {assignedTechnician?.email && <div>{assignedTechnician.email}</div>}
              </>
            ) : (
              <div className="text-muted-foreground">None</div>
            )}
          </div>
          <div>
            <div className="font-semibold">Material Notes</div>
            <div>
              {report.materialNotes || (
                <span className="text-muted-foreground">None</span>
              )}
            </div>
          </div>
          <div>
            <div className="font-semibold">Created At</div>
            <div>
              {report.createdAt && "toDate" in report.createdAt
                ? report.createdAt.toDate().toLocaleTimeString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Unable to parse date"}
            </div>
          </div>
        </Card>

        {/* Right: Service Notes */}
        <Card className="p-4 relative text-lg md:text-base">
          <h2 className="text-xl font-semibold mb-2">Service Notes</h2>
          {/* Edit icon for service notes */}
          {report.draft && (
            <div className="absolute top-4 right-4 z-10">
              {report.draft && (
                <Link href={`/dashboard/service-reports/${id}/edit`} className="block">
                  <button
                    type="button"
                    className="p-2 rounded hover:bg-muted transition"
                    aria-label="Edit service notes"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </Link>
              )}
            </div>
          )}
          <div className="space-y-6">
            {report.serviceNotes && report.serviceNotes.length > 0 ? (
              report.serviceNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="mb-6 pb-4 border-b last:border-b-0 last:pb-0"
                >
                  <div className="font-semibold text-muted-foreground mb-2">
                    {note.date && "toDate" in note.date
                      ? note.date.toDate().toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="font-semibold">Technician Time</div>
                      <div>{note.technicianTime} hr</div>
                    </div>
                    <div>
                      <div className="font-semibold">Technician OT</div>
                      <div>{note.technicianOvertime} hr</div>
                    </div>
                    <div>
                      <div className="font-semibold">Helper Time</div>
                      <div>{note.helperTime} hr</div>
                    </div>
                    <div>
                      <div className="font-semibold">Helper OT</div>
                      <div>{note.helperOvertime} hr</div>
                    </div>
                    <div>
                      <div className="font-semibold">Remote Work</div>
                      <div>
                        {note.remoteWork || (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">Notes</div>
                      {note.serviceNotes || <span className="text-muted-foreground">None</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No service notes.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServiceReportViewPage;
