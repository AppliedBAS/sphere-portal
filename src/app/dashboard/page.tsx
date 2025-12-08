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
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { CreditCardIcon, ClipboardList, FolderIcon, Loader2 } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<{
    projectReports: ProjectReport[];
    serviceReports: ServiceReport[];
    purchaseOrders: PurchaseOrder[];
  }>({ projectReports: [], serviceReports: [], purchaseOrders: [] });
  const [loading, setLoading] = useState(true);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [creatingReportType, setCreatingReportType] = useState<string | null>(null);
  
  // Unique version/ID for this update dialog - increment this for future updates
  const UPDATE_DIALOG_VERSION = "2025-update-1";

  useEffect(() => {
    // Check if this specific update dialog has been dismissed
    const dismissedDialogs = JSON.parse(
      localStorage.getItem("update-dialogs-dismissed") || "[]"
    ) as string[];
    
    if (!dismissedDialogs.includes(UPDATE_DIALOG_VERSION)) {
      setShowUpdateDialog(true);
    }
  }, []);

  useEffect(() => {
    // Track which subscriptions have received their first snapshot
    const loadedFlags = {
      projectReports: false,
      serviceReports: false,
      purchaseOrders: false,
    };

    const checkAllLoaded = () => {
      if (loadedFlags.projectReports && loadedFlags.serviceReports && loadedFlags.purchaseOrders) {
        setLoading(false);
      }
    };

    const unsubscribePR = onSnapshot(
      query(
        collection(firestore, "project reports"),
        where("draft", "==", true)
      ),
      (snapshot) => {
        loadedFlags.projectReports = true;
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
        checkAllLoaded();
      }
    );

    const unsubscribeSR = onSnapshot(
      query(collection(firestore, "reports"), where("draft", "==", true)),
      (snapshot) => {
        loadedFlags.serviceReports = true;
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
        checkAllLoaded();
      }
    );

    const unsubscribePO = onSnapshot(
      query(collection(firestore, "orders"), where("status", "==", "OPEN")),
      (snapshot) => {
        loadedFlags.purchaseOrders = true;
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
        checkAllLoaded();
      }
    );

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

  const handleDismissUpdateDialog = () => {
    setShowUpdateDialog(false);
    // Add this dialog version to the dismissed list
    const dismissedDialogs = JSON.parse(
      localStorage.getItem("update-dialogs-dismissed") || "[]"
    ) as string[];
    
    if (!dismissedDialogs.includes(UPDATE_DIALOG_VERSION)) {
      dismissedDialogs.push(UPDATE_DIALOG_VERSION);
      localStorage.setItem("update-dialogs-dismissed", JSON.stringify(dismissedDialogs));
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Update Dialog */}
      <Dialog 
        open={showUpdateDialog} 
        onOpenChange={(open) => {
          if (!open) {
            handleDismissUpdateDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>System Updates</DialogTitle>
            <DialogDescription>
              Here are the latest improvements to the system:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-semibold mb-2">Service Reports (SRs)</h3>
              <p className="text-sm text-muted-foreground">
                Service Reports now require you to select a dispatcher before submission. This helps ensure proper assignment and tracking of work orders.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Purchase Orders (POs)</h3>
              <p className="text-sm text-muted-foreground">
                When submitting Purchase Orders, you&apos;ll now see real-time notifications showing receipt processing and upload progress, making it easier to track your submission status.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Performance Improvements</h3>
              <p className="text-sm text-muted-foreground">
                Submission speed has been significantly improved across all report types for a faster, smoother experience.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDismissUpdateDialog} variant="default">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                disabled={creatingReportType !== null}
                onClick={() => {
                  setCreatingReportType("service-report");
                  router.push("/dashboard/service-reports/create");
                }}
              >
                {creatingReportType === "service-report" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Service Report"
                )}
              </Button>
              <Button
                variant="outline"
                disabled={creatingReportType !== null}
                onClick={() => {
                  setCreatingReportType("project-report");
                  router.push("/dashboard/project-reports/create");
                }}
              >
                {creatingReportType === "project-report" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Project Report"
                )}
              </Button>
              <Button
                variant="outline"
                disabled={creatingReportType !== null}
                onClick={() => {
                  setCreatingReportType("purchase-order");
                  router.push("/dashboard/purchase-orders/create");
                }}
              >
                {creatingReportType === "purchase-order" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Purchase Order"
                )}
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
