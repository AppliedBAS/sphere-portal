"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { firestore } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import type { ProjectReport } from "@/models/ProjectReport";
import type { ServiceReport } from "@/models/ServiceReport";
import type { PurchaseOrder } from "@/models/PurchaseOrder";
import { DashboardCard } from "@/components/DashboardCard";
import { CreditCardIcon, ClipboardList, FolderIcon } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<{
    projectReports: ProjectReport[];
    serviceReports: ServiceReport[];
    purchaseOrders: PurchaseOrder[];
  }>({ projectReports: [], serviceReports: [], purchaseOrders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribePR = onSnapshot(
      query(
        collection(firestore, "project reports"),
        where("draft", "==", true)
      ),
      (snapshot) => {
        setData((prevData) => ({
          ...prevData,
          projectReports: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              docId: data["doc-id"],
              projectDocId: data["project-doc-id"],
              clientName: data["client-name"],
              location: data["location"],
              description: data["description"],
              notes: data["notes"],
              materials: data["materials"],
              draft: data["draft"],
              createdAt: data["created-at"],
              authorTechnicianRef: data["author-technician-ref"],
              leadTechnicianRef: data["lead-technician-ref"],
              assignedTechniciansRef: data["assigned-technicians-ref"],
            } as ProjectReport;
          }),
        }));
      }
    );

    const unsubscribeSR = onSnapshot(
      query(collection(firestore, "reports"), where("draft", "==", true)),
      (snapshot) => {
        setData((prevData) => ({
          ...prevData,
          serviceReports: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              authorTechnicianRef: data["author-technician-ref"],
              cityStateZip: data["city-state-zip"],
              clientName: data["client-name"],
              contactEmail: data["contact-email"],
              contactPhone: data["contact-phone"],
              contactName: data["contact-name"],
              createdAt: data["created-at"],
              docId: data["doc-id"],
              dateSigned: data["date-signed"],
              draft: data["draft"],
              materialNotes: data["material-notes"],
              printedName: data["printed-name"],
              serviceAddress1: data["service-address1"],
              serviceAddress2: data["service-address2"],
              serviceNotes: data["service-notes"],
            } as ServiceReport;
          }),
        }));
      }
    );

    const unsubscribePO = onSnapshot(
      query(collection(firestore, "orders"), where("status", "==", "OPEN")),
      (snapshot) => {
        setData((prevData) => ({
          ...prevData,
          purchaseOrders: snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              amount: data["amount"],
              createdAt: data["created-at"],
              description: data["description"],
              docId: data["doc-id"],
              otherCategory: data["other-category"],
              projectDocId: data["project-doc-id"],
              serviceReportDocId: data["service-report-doc-id"],
              status: data["status"],
              technicianRef: data["technician-ref"],
              vendor: data["vendor"],
            } as PurchaseOrder;
          }),
        }));
      }
    );

    setLoading(false);

    return () => {
      unsubscribePR();
      unsubscribeSR();
      unsubscribePO();
    };
  }, []);

  const renderPurchaseOrderCards = (items: PurchaseOrder[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <DashboardCard
          key={item.id}
          icon={<CreditCardIcon />}
          subtitle={`PO ${item.docId}`}
          title={item.vendor}
          date={
            item.createdAt && item.createdAt.toDate
              ? item.createdAt.toDate().toLocaleDateString()
              : ""
          }
          onOpen={() => router.push(`/dashboard/purchase-orders/${item.id}`)}
        />
      ))}
    </div>
  );

  const renderServiceReportCards = (items: ServiceReport[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <DashboardCard
          key={item.id}
          icon={<ClipboardList />}
          title={item.clientName}
          subtitle={`SR ${item.docId}`}
          date={
            item.createdAt && item.createdAt.toDate
              ? item.createdAt.toDate().toLocaleDateString()
              : ""
          }
          onOpen={() => router.push(`/dashboard/service-reports/${item.id}`)}
        />
      ))}
    </div>
  );

  const renderProjectReportCards = (items: ProjectReport[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <DashboardCard
          key={item.id}
          icon={<FolderIcon />}
          title={item.clientName}
          subtitle={`PR ${item.projectDocId} - ${item.docId} - ${item.location} - ${item.description}`}
          date={
            item.createdAt && item.createdAt.toDate
              ? item.createdAt.toDate().toLocaleDateString()
              : ""
          }
          onOpen={() => router.push(`/dashboard/project-reports/${item.id}`)}
        />
      ))}
    </div>
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Title and Create Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default">Create</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Report Type</DialogTitle>
              <DialogDescription>
                Choose which kind of report you want to create.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/service-reports/create")}
              >
                Service Report
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/project-reports/create")}
              >
                Project Report
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/purchase-orders/create")}
              >
                Purchase Order
              </Button>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="orders">POs</TabsTrigger>
          <TabsTrigger value="services">SRs</TabsTrigger>
          <TabsTrigger value="projects">PRs</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <section>
            <h2 className="text-lg font-semibold mb-4">Purchase Orders</h2>
            {data.purchaseOrders.length === 0 ? (
              <p>No purchase orders found.</p>
            ) : (
              renderPurchaseOrderCards(data.purchaseOrders)
            )}
          </section>
          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Service Reports</h2>
            {data.serviceReports.length === 0 ? (
              <p>No service reports found.</p>
            ) : (
              renderServiceReportCards(data.serviceReports)
            )}
          </section>
          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Project Reports</h2>
            {data.projectReports.length === 0 ? (
              <p>No project reports found.</p>
            ) : (
              renderProjectReportCards(data.projectReports)
            )}
          </section>
        </TabsContent>

        <TabsContent value="orders">
          <h2 className="text-xl font-semibold mb-4">Purchase Orders</h2>
          {data.purchaseOrders.length === 0 ? (
            <p>No purchase orders found.</p>
          ) : (
            renderPurchaseOrderCards(data.purchaseOrders)
          )}
        </TabsContent>

        <TabsContent value="services">
          <h2 className="text-xl font-semibold mb-4">Service Reports</h2>
          {data.serviceReports.length === 0 ? (
            <p>No service reports found.</p>
          ) : (
            renderServiceReportCards(data.serviceReports)
          )}
        </TabsContent>

        <TabsContent value="projects">
          <h2 className="text-xl font-semibold mb-4">Project Reports</h2>
          {data.projectReports.length === 0 ? (
            <p>No project reports found.</p>
          ) : (
            renderProjectReportCards(data.projectReports)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
