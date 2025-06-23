import { firestore } from "@/lib/firebase";
import { doc, runTransaction } from "firebase/firestore";

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
