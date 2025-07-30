"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { purchaseOrderConverter, PurchaseOrder } from "@/models/PurchaseOrder";
import { employeeConverter, Employee } from "@/models/Employee";
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

const PurchaseOrderDetailPage = () => {
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [technician, setTechnician] = useState<Employee | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!idParam) return;
      setLoading(true);
      const docRef = doc(firestore, "orders", idParam).withConverter(purchaseOrderConverter);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as PurchaseOrder;
        setOrder(data);
        // Fetch technician
        if (data.technicianRef) {
          const techSnap = await getDoc(data.technicianRef.withConverter(employeeConverter));
          setTechnician(techSnap.exists() ? techSnap.data() : null);
        }
      }
      setLoading(false);
    }
    fetchOrder();
  }, [idParam]);

  if (loading) return <div>Loading…</div>;
  if (!order) return <div>Purchase Order not found.</div>;

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
              <Link href="/dashboard/purchase-orders">Purchase Orders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{order.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-2">PO {order.docId}</h1>
      <div className="mb-6">
        <Badge
          variant={
            order.status?.toLowerCase() === "open"
              ? "outline"
              : order.status?.toLowerCase() === "closed"
              ? "default"
              : "secondary"
          }
          className={
            order.status?.toLowerCase() === "open"
              ? "text-yellow-800 border-yellow-300 bg-yellow-50"
              : order.status?.toLowerCase() === "closed"
              ? "text-green-800 border-green-300 bg-green-50"
              : ""
          }
        >
          {order.status || "Unknown"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Details */}
        <Card className="p-4 space-y-4 relative text-lg md:text-base">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          {order.status?.toLowerCase() === "open" && (
            <div className="absolute top-4 right-4 z-10">
              <Link href={`/dashboard/purchase-orders/${idParam}/edit`} className="block">
                <button
                  type="button"
                  className="p-2 rounded hover:bg-muted transition"
                  aria-label="Edit order"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </Link>
            </div>
          )}
          <div>
            <div className="font-semibold">Vendor</div>
            <div>{order.vendor}</div>
          </div>
          <div>
            <div className="font-semibold">Description</div>
            <div>{order.description}</div>
          </div>
          <div>
            <div className="font-semibold">Amount</div>
            <div>${order.amount?.toFixed(2)}</div>
          </div>
          <div>
            <div className="font-semibold">Other Category</div>
            <div>{order.otherCategory || <span className="text-muted-foreground">None</span>}</div>
          </div>
          <div>
            <div className="font-semibold">Project Doc ID</div>
            <div>{order.projectDocId || <span className="text-muted-foreground">None</span>}</div>
          </div>
          <div>
            <div className="font-semibold">Service Report Doc ID</div>
            <div>{order.serviceReportDocId || <span className="text-muted-foreground">None</span>}</div>
          </div>
          <div>
            <div className="font-semibold">Technician</div>
            {technician ? (
              <div>{technician.name}</div>
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </div>
          <div>
            <div className="font-semibold">Created At</div>
            <div>
              {order.createdAt?.toDate
                ? order.createdAt.toDate().toLocaleString()
                : ""}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailPage;
