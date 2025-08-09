import Link from "next/link";
import { Timestamp } from "firebase/firestore";
import { PurchaseOrder } from "@/models/PurchaseOrder";
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
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface PurchaseOrdersTableProps {
  orders: PurchaseOrder[];
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: "docId" | "vendor" | "description" | "status" | "createdAt" | "amount") => void;
}

export function PurchaseOrdersTable({
  orders,
  sortColumn,
  sortDirection,
  onSort
}: PurchaseOrdersTableProps) {
  const formatDate = (ts: Timestamp) => ts?.toDate().toLocaleString();

  const SortableHeader = ({ 
    column, 
    children 
  }: { 
    column: "docId" | "vendor" | "description" | "status" | "createdAt" | "amount";
    children: React.ReactNode;
  }) => (
    <TableHead className="cursor-pointer" onClick={() => onSort(column)}>
      <div className="flex items-center">
        {children}
        {sortColumn === column && (
          sortDirection === "asc" ? 
            <ChevronUp className="h-4 w-4 ml-1" /> : 
            <ChevronDown className="h-4 w-4 ml-1" />
        )}
      </div>
    </TableHead>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader column="docId">Doc ID</SortableHeader>
          <SortableHeader column="vendor">Vendor</SortableHeader>
          <SortableHeader column="description">Description</SortableHeader>
          <SortableHeader column="status">Status</SortableHeader>
          <SortableHeader column="createdAt">Created At</SortableHeader>
          <SortableHeader column="amount">Amount</SortableHeader>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.docId}</TableCell>
            <TableCell>{order.vendor}</TableCell>
            <TableCell className="max-w-xs truncate">
              {order.description}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  order.status?.toLowerCase() === "closed"
                    ? "text-green-800 border-green-300 bg-green-50"
                    : order.status?.toLowerCase() === "open"
                    ? "text-orange-800 border-orange-300 bg-orange-50"
                    : ""
                }
              >
                {order.status || "Unknown"}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell>${order.amount?.toFixed(2)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/purchase-orders/${order.id}`}>
                      View
                    </Link>
                  </DropdownMenuItem>
                  {order.status?.toUpperCase() === "OPEN" && (
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/purchase-orders/${order.id}/edit`}>
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