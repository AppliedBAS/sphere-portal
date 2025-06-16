"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { firestore } from "@/lib/firebase";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { ServiceReport } from "@/models/ServiceReport";
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

const ServiceReportViewPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState<ServiceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      setLoading(true);
      const ref = doc(firestore, "reports", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data: DocumentData = snap.data();
        setReport({
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
      <h1 className="text-2xl font-bold mb-2">Service Report {report.docId}</h1>
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
        <Card className="p-4 space-y-4 relative">
          {/* Edit icon for main info */}
          {report.draft && (
            <div className="absolute top-4 right-4 z-10">
              <Link href={`/dashboard/service-reports/${id}/edit`} className="block">
                <button
                  type="button"
                  className="p-2 rounded hover:bg-muted transition"
                  aria-label="Edit main info"
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
          <div>
            <div className="font-semibold">Contact</div>
            <div>
              {report.contactName}{" "}
              {report.contactPhone && `(${report.contactPhone})`}
            </div>
          </div>
          <div>
            <div className="font-semibold">Contact Email</div>
            <div>{report.contactEmail}</div>
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
                ? report.createdAt.toDate().toLocaleString()
                : ""}
            </div>
          </div>
        </Card>

        {/* Right: Service Notes */}
        <Card className="p-4 relative">
          <h2 className="font-semibold mb-2">Service Notes</h2>
          {/* Edit icon for service notes */}
          {report.draft && (
            <div className="absolute top-4 right-4 z-10">
              <Link href={`/dashboard/service-reports/${id}/edit`} className="block">
                <button
                  type="button"
                  className="p-2 rounded hover:bg-muted transition"
                  aria-label="Edit service notes"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </Link>
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
                      ? note.date.toDate().toLocaleDateString()
                      : ""}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="font-semibold">Technician Time</div>
                      <div>{note.technicianTime}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Technician OT</div>
                      <div>{note.technicianOvertime}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Helper Time</div>
                      <div>{note.helperTime}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Helper OT</div>
                      <div>{note.helperOvertime}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Remote Work</div>
                      <div>
                        {note.remoteWork || (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">Notes</div>
                      <div>{note.serviceNotes}</div>
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
