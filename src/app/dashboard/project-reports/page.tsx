"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, Timestamp, DocumentReference } from "firebase/firestore";
import { ProjectReport } from "@/models/ProjectReport";

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

export default function ProjectReports() {
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Table state ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<"clientName" | "location" | "createdAt">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const querySnapshot = await getDocs(collection(firestore, "project reports"));
      const data = querySnapshot.docs.map((doc) => {
        const raw = doc.data();
        return {
          // Use Firestore document ID as `id`
          id: doc.id,
          docId: raw["doc-id"] as number,
          projectDocId: raw["project-doc-id"] as number,
          clientName: raw["client-name"] as string,
          location: raw.location as string,
          description: raw.description as string,
          notes: raw.notes as string,
          materials: raw.materials as string,
          draft: raw.draft as boolean,
          createdAt: raw["created-at"] as Timestamp,
          authorTechnicianRef: raw["author-technician-ref"] as DocumentReference,
          leadTechnicianRef: raw["lead-technician-ref"] as DocumentReference | undefined,
          assignedTechniciansRef: raw["assigned-technicians-ref"] as DocumentReference[] | undefined,
        } as ProjectReport;
      });

      setReports(data);
      setLoading(false);
    }

    fetchReports();
  }, []);

  // 1) Filter by searchTerm (clientName or location)
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter((r) => {
      return (
        r.clientName.toLowerCase().includes(term) ||
        r.location.toLowerCase().includes(term)
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
      } else if (sortColumn === "location") {
        aVal = a.location.toLowerCase();
        bVal = b.location.toLowerCase();
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

  // 4) Paginate
  const pageCount = Math.ceil(withStatusOrder.length / pageSize);
  const paginated = useMemo(() => {
    const start = pageIndex * pageSize;
    return withStatusOrder.slice(start, start + pageSize);
  }, [withStatusOrder, pageIndex]);

  // Helper to format Firestore Timestamp
  const formatDate = (ts: Timestamp) => ts.toDate().toLocaleString();

  const toggleSort = (column: "clientName" | "location" | "createdAt") => {
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
      <h1 className="text-2xl font-bold">Project Reports</h1>

      {/* Search Input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by client or location…"
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
          {/* Wrap all <TableHead> in a single <TableRow> */}
          <TableRow>
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
              onClick={() => toggleSort("location")}
            >
              <div className="flex items-center">
                Location
                {sortColumn === "location" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  ))}
              </div>
            </TableHead>

            <TableHead>Description</TableHead>

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
            // Use report.id (the Firestore doc ID) as the key
            <TableRow key={report.id}>
              <TableCell>{report.clientName}</TableCell>
              <TableCell>{report.location}</TableCell>
              <TableCell className="max-w-xs truncate">
                {report.description}
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
                    Published
                  </Badge>
                )}
              </TableCell>

              {/* Actions: Edit+View if draft; only View otherwise */}
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
                        <Link href={`/dashboard/project-reports/${report.id}/edit`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/project-reports/${report.id}`}>
                        View
                      </Link>
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
    </div>
  );
}
