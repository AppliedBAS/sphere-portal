import Link from "next/link";
import { Timestamp } from "firebase/firestore";
import { PurchaseOrderHit } from "@/models/PurchaseOrder";
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

interface PurchaseOrdersTableProps {
  orders: PurchaseOrderHit[];
}

export function PurchaseOrdersTable({
  orders,
}: PurchaseOrdersTableProps) {
  const formatDate = (ts: Timestamp) => ts?.toDate().toLocaleString();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Doc ID</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.objectID}>
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
            <TableCell>{formatDate(Timestamp.fromMillis(order.createdAt))}</TableCell>
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
                    <Link href={`/dashboard/purchase-orders/${order.objectID}`}>
                      View
                    </Link>
                  </DropdownMenuItem>
                  {order.status?.toUpperCase() === "OPEN" && (
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/purchase-orders/${order.objectID}/edit`}>
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