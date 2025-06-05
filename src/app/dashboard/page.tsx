"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { firestore } from "@/lib/firebase";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Counts {
  projectReports: number;
  serviceReports: number;
  purchaseOrders: number;
  draftProjectReports: number;
  draftServiceReports: number;
  draftPurchaseOrders: number;
  draftReports: number;
}

export default function Dashboard() {
  const router = useRouter();

  const [counts, setCounts] = useState<Counts>({
    projectReports: 0,
    serviceReports: 0,
    purchaseOrders: 0,
    draftProjectReports: 0,
    draftServiceReports: 0,
    draftPurchaseOrders: 0,
    draftReports: 0,
  });
  const [loadingCounts, setLoadingCounts] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCounts() {
      setLoadingCounts(true);

      // 1) Total Project Reports
      const projectSnap = await getCountFromServer(
        collection(firestore, "project reports")
      );
      // 1a) Draft Project Reports
      const projectDraftQuery = query(
        collection(firestore, "project reports"),
        where("draft", "==", true)
      );
      const draftProjectSnap = await getCountFromServer(projectDraftQuery);

      // 2) Total Service Reports
      const serviceSnap = await getCountFromServer(
        collection(firestore, "reports")
      );
      // 2a) Draft Service Reports
      const serviceDraftQuery = query(
        collection(firestore, "reports"),
        where("draft", "==", true)
      );
      const draftServiceSnap = await getCountFromServer(serviceDraftQuery);

      // 3) Total Purchase Orders
      const ordersSnap = await getCountFromServer(
        collection(firestore, "orders")
      );
      // 3a) “Draft” Purchase Orders (status = OPEN)
      const ordersDraftQuery = query(
        collection(firestore, "orders"),
        where("status", "==", "OPEN")
      );
      const draftOrdersSnap = await getCountFromServer(ordersDraftQuery);

      setCounts({
        projectReports: projectSnap.data().count,
        serviceReports: serviceSnap.data().count,
        purchaseOrders: ordersSnap.data().count,
        draftProjectReports: draftProjectSnap.data().count,
        draftServiceReports: draftServiceSnap.data().count,
        draftPurchaseOrders: draftOrdersSnap.data().count,
        draftReports:
          draftProjectSnap.data().count +
          draftServiceSnap.data().count +
          draftOrdersSnap.data().count,
      });

      setLoadingCounts(false);
    }

    fetchCounts();
  }, []);

  return (
    <div className="px-8 py-6 space-y-6">
      {/* 1. Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="secondary">Create New Report</Button>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Project Reports Card */}
        <Card className="relative p-6 flex flex-col">
          {/* top-right icon */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => router.push("/dashboard/project-reports")}
          >
            <ArrowRight />
          </Button>

          <div>
            <span className="text-card-foreground mb-2">Project Reports</span>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">
                {loadingCounts ? "..." : counts.projectReports}
              </span>
              {!loadingCounts && (
                <Badge variant="outline">
                  {counts.draftProjectReports} Drafts
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Service Reports Card */}
        <Card className="relative p-6 flex flex-col">
          {/* top-right icon */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => router.push("/dashboard/service-reports")}
          >
            <ArrowRight />
          </Button>

          <div>
            <span className="text-card-foreground mb-2">Service Reports</span>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">
                {loadingCounts ? "..." : counts.serviceReports}
              </span>
              {!loadingCounts && (
                <Badge variant="outline">
                  {counts.draftServiceReports} Drafts
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Purchase Orders Card */}
        <Card className="relative p-6 flex flex-col">
          {/* top-right icon */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => router.push("/dashboard/purchase-orders")}
          >
            <ArrowRight />
          </Button>

          <div>
            <span className="text-card-foreground mb-2">
              Purchase Orders
            </span>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">
                {loadingCounts ? "..." : counts.purchaseOrders}
              </span>
              {!loadingCounts && (
                <Badge variant="outline">
                  {counts.draftPurchaseOrders} Drafts
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Draft Reports Card */}
        <Card className="relative p-6 flex flex-col">
          {/* top-right icon */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => router.push("/dashboard/draft-reports")}
          >
            <ArrowRight />
          </Button>

          <div >
            <span className="text-card-foreground mb-2">Draft Reports</span>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold">
                {loadingCounts ? "..." : counts.draftReports}
              </span>
              </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
