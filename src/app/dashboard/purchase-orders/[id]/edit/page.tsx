"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { PurchaseOrder, purchaseOrderConverter } from "@/models/PurchaseOrder";
import PurchaseOrderForm from "@/components/PurchaseOrderForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const EditPurchaseOrderPage = () => {
  const { id } = useParams();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      setLoading(true);
      const ref = doc(firestore, "orders", id as string).withConverter(purchaseOrderConverter);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setPurchaseOrder(snap.data());
      }
      setLoading(false);
    }
    fetchOrder();
  }, [id]);

  if (loading) return <div>Loading…</div>;
  if (!purchaseOrder) return <div>Purchase Order not found.</div>;

  return (
    <div className="flex flex-col space-y-6 pb-8">
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
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/purchase-orders/${id}`}>{id}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold">Edit Purchase Order</h1>
      <PurchaseOrderForm purchaseOrder={purchaseOrder} />
    </div>
  );
};

export default EditPurchaseOrderPage;
