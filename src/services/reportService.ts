import { firestore } from "@/lib/firebase";
import { ProjectReport, projectReportConverter } from "@/models/ProjectReport";
import { ServiceReport, serviceReportConverter } from "@/models/ServiceReport";
import { collection, doc, runTransaction } from "firebase/firestore";
import { query, where, getDocs } from "firebase/firestore";

export async function reserveDocid(): Promise<number> {
  const counterRef = doc(firestore, "counter", "s5Lwh7q9cNZvYSJDAc2N");
  const reportNo = await runTransaction(firestore, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    if (!counterDoc.exists()) {
      throw new Error("Counter document does not exist");
    }
    const data = counterDoc.data();
    const currentReportNo = data["report-no"] + 1;
    transaction.update(counterRef, { "report-no": currentReportNo });
    return currentReportNo;
  });

  return reportNo;
}

export async function fetchDraftProjectReports(): Promise<ProjectReport[]> {
  const reportsRef = collection(firestore, "project reports").withConverter(projectReportConverter);
  const q = query(reportsRef, where("draft", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as ProjectReport);
}

export async function fetchDraftServiceReports(): Promise<ServiceReport[]> {
  const reportsRef = collection(firestore, "reports").withConverter(serviceReportConverter);
  const q = query(reportsRef, where("draft", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as ServiceReport);
}
