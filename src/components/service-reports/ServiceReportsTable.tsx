import Link from "next/link";
import { ServiceReportHit } from "@/models/ServiceReport";
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

interface ServiceReportsTableProps {
  reports: ServiceReportHit[];
}


export function ServiceReportsTable({ reports }: ServiceReportsTableProps) {

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Doc ID</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Service Address</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.objectID}>
            <TableCell>{report.docId}</TableCell>
            <TableCell>{report.clientName}</TableCell>
            <TableCell className="max-w-xs truncate">
              {report.serviceAddress1}
              {report.serviceAddress2 ? `, ${report.serviceAddress2}` : ""}
              <br />
              <span className="text-sm text-muted-foreground">
                {report.cityStateZip}
              </span>
            </TableCell>
            <TableCell>
              {report.contactName}
              <br />
              <span className="text-sm text-muted-foreground">
                {report.contactPhone}
              </span>
            </TableCell>
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
                    <Link
                      href={`/dashboard/service-reports/${report.objectID}`}
                    >
                      View
                    </Link>
                  </DropdownMenuItem>
                  {!report.draft && (
                    <DropdownMenuItem asChild>
                        <a
                        href={`https://storage.googleapis.com/appliedbas-service-report-gen.appspot.com/reports/service/Service%20Report%20${report.docId}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        View PDF
                        </a>
                    </DropdownMenuItem>
                  )}
                  {report.draft && (
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/service-reports/${report.objectID}/edit`}
                      >
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
