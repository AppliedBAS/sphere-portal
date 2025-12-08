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
import { SearchFilters } from "@/components/purchase-orders/SearchFilters";
import { PurchaseOrdersTable } from "@/components/purchase-orders/PurchaseOrdersTable";
import { Pagination } from "@/components/Pagination";
import { MAX_AMOUNT } from "@/lib/utils";
import ReportsSkeleton from "@/components/ReportsSkeleton";

export default function PurchaseOrders() {
  const router = useRouter();

  const { orders, loading, ordersCount, totalCount, totalPages, qMinAmount, qMaxAmount, qDescription, qStatus, qVendor, qPage, qPageSize, qSrDocId, qProjectDocId } = usePurchaseOrders();

  const handleDescriptionChange = (description: string) => {
    window.location.href = `/dashboard/purchase-orders?${buildSearchParams(description, qMinAmount, qMaxAmount, qVendor, qStatus)}`;
  };

  const handleAmountChange = (minAmount: number, maxAmount: number) => {
    window.location.href = `/dashboard/purchase-orders?${buildSearchParams(qDescription, minAmount, maxAmount, qVendor, qStatus, qPage, qPageSize)}`;
  };

  const handleVendorChange = (vendor: string) => {
    window.location.href = `/dashboard/purchase-orders?${buildSearchParams(qDescription, qMinAmount, qMaxAmount, vendor, qStatus, qPage, qPageSize)}`;
  };

  const handleStatusChange = (status: string) => {
    window.location.href = `/dashboard/purchase-orders?${buildSearchParams(qDescription, qMinAmount, qMaxAmount, qVendor, status, qPage, qPageSize)}`;
  };

  const handleFilterReset = () => {
    // Clear all filters including srDocId and projectDocId/pr parameters
    window.location.href = `/dashboard/purchase-orders`;
  };

  const handlePageChange = (page: number) => {
    window.location.href = `/dashboard/purchase-orders?${buildSearchParams(qDescription, qMinAmount, qMaxAmount, qVendor, qStatus, page, qPageSize)}`;
  };

  const handlePageSizeChange = (pageSize: number) => {
    window.location.href = `/dashboard/purchase-orders?${buildSearchParams(qDescription, qMinAmount, qMaxAmount, qVendor, qStatus, qPage, pageSize)}`;
  };

  const buildSearchParams = (
    description: string,
    minAmount: number,
    maxAmount: number,
    vendor: string,
    status: string,
    page?: number,
    pageSize?: number
  ) => {
    const params = new URLSearchParams();
    if (description) {
      params.set("description", description);
    }
    if (vendor) {
      params.set("vendor", vendor);
    }
    if (status) {
      params.set("status", status);
    }
    if (minAmount !== 0 || maxAmount !== MAX_AMOUNT) {
      params.set("minAmount", minAmount.toString());
      params.set("maxAmount", maxAmount.toString());
    }
    if (page) {
      params.set("page", page.toString());
    }
    if (pageSize) {
      params.set("pageSize", pageSize.toString());
    }
    return params;
  };

  if (loading) return <ReportsSkeleton tableColumns={6} filterInputs={5} />;

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

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {orders
          .slice()
          .sort((a, b) => b.docId - a.docId)
          .map((order) => (
            <DashboardCard
              key={order.objectID}
              icon={<ClipboardList />}
              title={order.vendor}
              subtitle={`PO ${order.docId}`}
              date={new Date(order.createdAt).toLocaleDateString()}
              onOpen={() =>
                router.push(`/dashboard/purchase-orders/${order.id}`)
              }
            />
          ))}
      </div>

      {/* Desktop/table layout for md+ screens */}
      <div className="hidden md:block">
        {/* Wrap filters in a form so Enter triggers submit */}
        <SearchFilters
          qDescription={qDescription}
          qMinAmount={qMinAmount}
          qMaxAmount={qMaxAmount}
          qStatus={qStatus}
          qVendor={qVendor}
          qSrDocId={qSrDocId}
          qProjectDocId={qProjectDocId}
          onDescriptionChange={handleDescriptionChange}
          onAmountChange={handleAmountChange}
          onStatusChange={handleStatusChange}
          onVendorChange={handleVendorChange}
          onFilterReset={handleFilterReset}
        />

        <PurchaseOrdersTable
          orders={orders}
        />

        <Pagination
          qPage={qPage}
          qPageSize={qPageSize}
          ordersCount={ordersCount}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
