"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { purchaseOrderConverter, PurchaseOrder } from "@/models/PurchaseOrder";

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

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Table state ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<
    "docId" | "vendor" | "description" | "status" | "createdAt"
  >("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const querySnapshot = await getDocs(
        collection(firestore, "orders").withConverter(purchaseOrderConverter)
      );
      const data = querySnapshot.docs.map((doc) => doc.data() as PurchaseOrder);
      setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  // 1) Filter by searchTerm (vendor, description, status)
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((o) => {
      return (
        o.vendor.toLowerCase().includes(term) ||
        o.description.toLowerCase().includes(term) ||
        (o.status || "").toLowerCase().includes(term)
      );
    });
  }, [orders, searchTerm]);

  // 2) Sort by selected column & direction
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      if (sortColumn === "vendor") {
        aVal = a.vendor.toLowerCase();
        bVal = b.vendor.toLowerCase();
      } else if (sortColumn === "description") {
        aVal = a.description.toLowerCase();
        bVal = b.description.toLowerCase();
      } else if (sortColumn === "status") {
        aVal = (a.status || "").toLowerCase();
        bVal = (b.status || "").toLowerCase();
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

  // 3) Paginate
  const pageCount = Math.ceil(sorted.length / pageSize);
  const paginated = useMemo(() => {
    const start = pageIndex * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageIndex]);

  // Helper to format Firestore Timestamp
  const formatDate = (ts: Timestamp) => ts?.toDate().toLocaleString();

  const toggleSort = (
    column: "docId" | "vendor" | "description" | "status" | "createdAt"
  ) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPageIndex(0);
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
            <BreadcrumbPage>Purchase Orders</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <h1 className="text-3xl font-bold">Purchase Orders</h1>

      {/* Search Input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by vendor, description, or status…"
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
              className="cursor-pointer"
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
              onClick={() => toggleSort("vendor")}
            >
              <div className="flex items-center">
                Vendor
                {sortColumn === "vendor" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  ))}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => toggleSort("description")}
            >
              <div className="flex items-center">
                Description
                {sortColumn === "description" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  ))}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => toggleSort("status")}
            >
              <div className="flex items-center">
                Status
                {sortColumn === "status" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  ))}
              </div>
            </TableHead>
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
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.docId}</TableCell>
              <TableCell>{order.vendor}</TableCell>
              <TableCell className="max-w-xs truncate">{order.description}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    order.status === "approved"
                      ? "text-green-800 border-green-300 bg-green-50"
                      : order.status === "pending"
                      ? "text-yellow-800 border-yellow-300 bg-yellow-50"
                      : order.status === "rejected"
                      ? "text-red-800 border-red-300 bg-red-50"
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
                      <Link href={`/dashboard/purchase-orders/${order.id}`}>View</Link>
                    </DropdownMenuItem>
                    {order.status && order.status.toUpperCase() === "OPEN" && (
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/purchase-orders/${order.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                    )}
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
