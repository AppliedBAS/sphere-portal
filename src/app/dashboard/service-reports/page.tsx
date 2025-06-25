"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { firestore } from "@/lib/firebase";
import {
  collection,
  getDocs,
  Timestamp,
  DocumentReference,
} from "firebase/firestore";
import { ServiceReport } from "@/models/ServiceReport";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/useMobile";
import { DashboardCard } from "@/components/DashboardCard";
import { ClipboardList } from "lucide-react";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
// import { useAuth } from "@/contexts/AuthContext";

export default function ServiceReports() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [loading, setLoading] = useState(true);
  // const { firebaseUser } = useAuth();

  // --- Table state ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<
    "clientName" | "serviceAddress" | "createdAt" | "docId"
  >("docId");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const querySnapshot = await getDocs(
        collection(firestore, "reports")
      );
      const data = querySnapshot.docs.map((doc) => {
        const raw = doc.data();

        // NOTE: Adjust the field‐access strings (like "client-name", "service-address-1", etc.)
        // to match exactly your Firestore keys. Below is a typical mapping assuming kebab‐case keys.
        const serviceAddress1: string = raw["service-address1"] as string;
        const serviceAddress2: string = raw["service-address2"] as string;

        return {
          id: doc.id,
          authorTechnicianRef: raw["author-technician-ref"] as DocumentReference,
          cityStateZip: raw["city-state-zip"] as string,
          clientName: raw["client-name"] as string,
          contactEmail: raw["contact-email"] as string,
          contactPhone: raw["contact-phone"] as string,
          contactName: raw["contact-name"] as string,
          createdAt: raw["created-at"] as Timestamp,
          docId: raw["doc-id"] as number,
          dateSigned: raw["date-signed"] as Timestamp | undefined,
          draft: raw["draft"] as boolean,
          materialNotes: raw["material-notes"] as string,
          printedName: raw["printed-name"] as string,
          serviceAddress1: serviceAddress1,
          serviceAddress2: serviceAddress2,
          serviceNotes: (raw["service-notes"] as Array<{
            date: Timestamp;
            "helper-overtime": string;
            "helper-time": string;
            "remote-work": string;
            "service-notes": string;
            "technician-overtime": string;
            "technician-time": string;
          }>).map((note) => ({
            date: note.date as Timestamp,
            helperOvertime: note["helper-overtime"] as string,
            helperTime: note["helper-time"] as string,
            remoteWork: note["remote-work"] as string,
            serviceNotes: note["service-notes"] as string,
            technicianOvertime: note["technician-overtime"] as string,
            technicianTime: note["technician-time"] as string,
          })),
        } as ServiceReport;
      });

      setReports(data);
      setLoading(false);
    }

    fetchReports();
  }, []);

  // 1) Filter by searchTerm (clientName or serviceAddress1)
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter((r) => {
      return (
        r.clientName.toLowerCase().includes(term) ||
        r.serviceAddress1.toLowerCase().includes(term) ||
        r.cityStateZip.toLowerCase().includes(term)
      );
    });
  }, [reports, searchTerm]);

  // 2) Sort by selected column & direction
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortColumn === "clientName") {
        aVal = a.clientName.toLowerCase();
        bVal = b.clientName.toLowerCase();
      } else if (sortColumn === "serviceAddress") {
        aVal = a.serviceAddress1.toLowerCase();
        bVal = b.serviceAddress1.toLowerCase();
      } else if (sortColumn === "docId") {
        aVal = a.docId;
        bVal = b.docId;
      } else {
        // createdAt
        aVal = a.createdAt.toMillis();
        bVal = b.createdAt.toMillis();
      }

      if (aVal < bVal) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filtered, sortColumn, sortDirection]);

  // 3) Split into drafts first, then published
  const withStatusOrder = useMemo(() => {
    const drafts = sorted.filter((r) => r.draft);
    const published = sorted.filter((r) => !r.draft);
    return [...drafts, ...published];
  }, [sorted]);

  // const canEdit = (report: ServiceReport) => {
  //   if (report.docId === 379) {
  //     console.log(firebaseUser?.id, report.assignedTechnicianRef);
  //   }
  //   return report.draft && firebaseUser?.id === report.assignedTechnicianRef?.id
  // }

  // 4) Paginate
  const pageCount = Math.ceil(withStatusOrder.length / pageSize);
  const paginated = useMemo(() => {
    const start = pageIndex * pageSize;
    return withStatusOrder.slice(start, start + pageSize);
  }, [withStatusOrder, pageIndex]);

  // Sort for mobile: docId greatest to lowest
  const mobileReports = useMemo(
    () => [...reports].sort((a, b) => b.docId - a.docId),
    [reports]
  );

  // Helper to format Firestore Timestamp
  const formatDate = (ts: Timestamp) => ts.toDate().toLocaleString();

  const toggleSort = (column: "clientName" | "serviceAddress" | "createdAt" | "docId") => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPageIndex(0); // reset to first page when sorting changes
  };

  if (loading) {
    return <div>Loading...</div>;
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
      <h1 className="text-3xl font-bold">Service Reports</h1>

      {isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {mobileReports.map((report) => (
            <DashboardCard
              key={report.id}
              icon={<ClipboardList />}
              title={report.clientName}
              subtitle={`SR ${report.docId}`}
              date={report.createdAt.toDate().toLocaleDateString()}
              onOpen={() => router.push(`/dashboard/service-reports/${report.id}`)}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Search Input */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by client or service address…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.currentTarget.value);
                setPageIndex(0);
              }}
              className="max-w-sm"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setPageIndex(0);
              }}
            >
              Clear
            </Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-20 cursor-pointer"
                  onClick={() => toggleSort("docId")}
                >
                  <div className="flex items-center">
                    Doc&nbsp;ID
                    {sortColumn === "docId" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("clientName")}
                >
                  <div className="flex items-center">
                    Client
                    {sortColumn === "clientName" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("serviceAddress")}
                >
                  <div className="flex items-center">
                    Service Address
                    {sortColumn === "serviceAddress" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Created At
                    {sortColumn === "createdAt" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.docId}</TableCell>
                  <TableCell>{report.clientName}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {report.serviceAddress1}
                    {report.serviceAddress2 ? `, ${report.serviceAddress2}` : ""}
                    <br />
                    <span className="text-sm text-muted-foreground">{report.cityStateZip}</span>
                  </TableCell>
                  <TableCell>
                    {report.contactName}
                    <br />
                    <span className="text-sm text-muted-foreground">{report.contactPhone}</span>
                  </TableCell>
                  <TableCell>{formatDate(report.createdAt)}</TableCell>
                  <TableCell>
                    {report.draft ? (
                      <Badge
                        variant="outline"
                        className="text-yellow-800 border-yellow-300 bg-yellow-50"
                      >
                        Draft
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-green-800 border-green-300 bg-green-50"
                      >
                        Submitted
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {report.draft && (
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/service-reports/${report.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/service-reports/${report.id}`}>View</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-gray-600">
              Page {pageIndex + 1} of {pageCount}
            </div>
            <div className="space-x-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={pageIndex === 0}
                onClick={() => setPageIndex((i) => Math.max(i - 1, 0))}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={pageIndex + 1 >= pageCount}
                onClick={() => setPageIndex((i) => Math.min(i + 1, pageCount - 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
