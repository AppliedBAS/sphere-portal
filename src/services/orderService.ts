import { firestore } from "@/lib/firebase";
import { Vendor, vendorConverter } from "@/models/Vendor";
import { collection, doc, getDocs, query, runTransaction, where } from "@firebase/firestore";


export async function reservePO(): Promise<number> {
    const counterRef = doc(firestore, "counter", "s5Lwh7q9cNZvYSJDAc2N");
    const poNo = await runTransaction(firestore, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) {
            throw new Error("Counter document does not exist");
        }
        const data = counterDoc.data();
        const currentPONo = data["purchase-order-no"] + 1;
        transaction.update(counterRef, { "purchase-order-no": currentPONo });
        return currentPONo;
    });

    return poNo;
}

export async function fetchVendorByName(name: string): Promise<Vendor | null> {
    const vendorQuery = query(
        collection(firestore, "vendors").withConverter(vendorConverter),
        where("name", "==", name)
    );
    const vendorSnap = await getDocs(vendorQuery);
    if (!vendorSnap.empty) {
        const docSnap = vendorSnap.docs[0];
        const data = docSnap.data() as Vendor;
        return {
            ...data,
            id: docSnap.id, // Ensure we include the document ID
        };
    }
    return null;
}