"use client";

import { Card } from "@/components/ui/card";
import { firestore } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [counts, setCounts] = useState({
    projectReports: 0,
    serviceReports: 0,
    purchaseOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      const [projectSnap, serviceSnap, purchaseSnap] = await Promise.all([
        getCountFromServer(collection(firestore, "project reports")),
        getCountFromServer(collection(firestore, "reports")),
        getCountFromServer(collection(firestore, "orders")),
      ]);
      setCounts({
        projectReports: projectSnap.data().count,
        serviceReports: serviceSnap.data().count,
        purchaseOrders: purchaseSnap.data().count,
      });
      setLoading(false);
    }
    fetchCounts();
  }, []);

  return (
    <div className="px-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 flex flex-col items-start">
          <span className="">Total Project Reports</span>
          <span className="text-2xl font-bold">
            {loading ? "..." : counts.projectReports}
          </span>
        </Card>
        <Card className="p-6 flex flex-col items-start">
          <span className="">Total Service Reports</span>
          <span className="text-2xl font-bold">
            {loading ? "..." : counts.serviceReports}
          </span>
        </Card>
        <Card className="p-6 flex flex-col items-start">
          <span className="">Total Purchase Orders</span>
          <span className="text-2xl font-bold">
            {loading ? "..." : counts.purchaseOrders}
          </span>
        </Card>
      </div>
      {/* Recent activity panel */}
      {/* <SearchProject /> */}
    </div>
  );
}

