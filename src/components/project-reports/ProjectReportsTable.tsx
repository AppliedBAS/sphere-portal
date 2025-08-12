import Link from "next/link";
import { ProjectReportHit } from "@/models/ProjectReport";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ProjectReportsTableProps {
  reports: ProjectReportHit[];
}

export function ProjectReportsTable({ reports }: ProjectReportsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project Doc ID</TableHead>
          <TableHead>Doc ID</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.objectID}>
            <TableCell>{report.projectDocId}</TableCell>
            <TableCell>{report.docId}</TableCell>
            <TableCell>{report.clientName}</TableCell>
            <TableCell className="max-w-xs truncate">{report.location}</TableCell>
            <TableCell className="max-w-xs truncate">{report.description}</TableCell>
            <TableCell>{new Date(report.createdAt).toLocaleString()}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  report.draft
                    ? "text-orange-800 border-orange-300 bg-orange-50"
                    : "text-green-800 border-green-300 bg-green-50"
                }
              >
                {report.draft ? "Draft" : "Completed"}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/project-reports/${report.objectID}`}>
                      View
                    </Link>
                  </DropdownMenuItem>
                  {!report.draft && (
                    <DropdownMenuItem asChild>
                      <a
                        href={`https://storage.googleapis.com/appliedbas-service-report-gen.appspot.com/reports/project/Project%20Report%20${report.projectDocId}%20-%20${report.docId}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View PDF
                      </a>
                    </DropdownMenuItem>
                  )}
                  {report.draft && (
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/project-reports/${report.objectID}/edit`}>
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
