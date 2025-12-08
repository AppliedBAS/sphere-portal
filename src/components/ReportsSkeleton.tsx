import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface ReportsSkeletonProps {
  /** Number of table columns (excluding Actions column) */
  tableColumns?: number;
  /** Number of filter inputs to show */
  filterInputs?: number;
}

export default function ReportsSkeleton({ 
  tableColumns = 7,
  filterInputs = 4 
}: ReportsSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Title skeleton */}
      <Skeleton className="h-8 w-48" />

      {/* Mobile view cards skeleton */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="relative flex flex-col justify-center min-h-[70px] p-4">
            <div className="flex items-center h-full">
              <Skeleton className="h-8 w-8 mr-4 rounded" />
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-32 mb-1" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop/table layout for md+ screens */}
      <div className="hidden md:block">
        {/* Search filters skeleton */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-10 w-10 rounded" />
          {[...Array(Math.max(0, filterInputs - 1))].map((_, i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Table skeleton */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(tableColumns)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
                <TableRow key={i}>
                  {[...Array(tableColumns)].map((_, j) => (
                    <TableCell key={j}>
                      {j === 0 ? (
                        <Skeleton className="h-4 w-16" />
                      ) : j === 1 ? (
                        <Skeleton className="h-4 w-28" />
                      ) : j === 2 ? (
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      ) : j === tableColumns - 1 ? (
                        <Skeleton className="h-6 w-20 rounded-full" />
                      ) : (
                        <Skeleton className="h-4 w-24" />
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

