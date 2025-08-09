"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DashboardCard } from "@/components/DashboardCard";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useTableState } from "@/hooks/useTableState";
import { SearchFilters } from "@/components/purchase-orders/SearchFilters";
import { PurchaseOrdersTable } from "@/components/purchase-orders/PurchaseOrdersTable";
import { Pagination } from "@/components/purchase-orders/Pagination";

export default function PurchaseOrders() {
  const router = useRouter();
  const { orders, loading, ordersCount, pageIndex, pageSize, amountRange, description, srDocId, projectDocId, setAmountRange, setDescription, setPageSize, setSrDocId, setProjectDocId } = usePurchaseOrders();
  const {
    sortColumn,
    sortDirection,
    toggleSort
  } = useTableState();

  const search = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("description", description);
    params.set("pageSize", pageSize.toString());
    router.push(`/dashboard/purchase-orders?${params.toString()}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
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

      <h1 className="text-2xl font-bold">Purchase Orders</h1>

      {/* Mobile card layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {orders
          .sort((a, b) => b.docId - a.docId)
          .map((order) => (
            <DashboardCard
              key={order.id}
              icon={<ClipboardList />}
              title={order.vendor}
              subtitle={`PO ${order.docId}`}
              date={order.createdAt.toDate().toLocaleDateString()}
              onOpen={() =>
                router.push(`/dashboard/purchase-orders/${order.id}`)
              }
            />
          ))}
      </div>

      <SearchFilters
        searchDescription={description}
        setSearchDescription={setDescription}
        amountRange={amountRange}
        setAmountRange={setAmountRange}
        onSearch={search}
      />

      <PurchaseOrdersTable
        orders={orders}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={toggleSort}
      />

      {/* <Pagination
        page={pageIndex}
        pageSize={pageSize}
        totalItems={ordersCount || 0}
        onChange={search}
        setPage={setPage}
        setPageSize={(size: number) => {
          // You may need to update this logic depending on your state management
          router.push(`/dashboard/purchase-orders?page=1&pageSize=${size}`);
        }}
      /> */}
    </div>
  );
}