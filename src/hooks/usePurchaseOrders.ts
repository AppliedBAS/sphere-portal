import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { firestore } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getCountFromServer,
  doc,
  getDoc,
  orderBy,
  query,
  limit,
  where
} from "firebase/firestore";
import { purchaseOrderConverter, PurchaseOrder } from "@/models/PurchaseOrder";

export function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersCount, setOrdersCount] = useState<number | null>(null);

  // Search Query Params
  const searchParams = useSearchParams();
  const qPage = Number(searchParams.get("page"));
  const qAmountRange: [number, number] = (() => {
    const arr = searchParams.get("amountRange")?.split(",").map(Number);
    if (arr && arr.length === 2 && arr.every(n => !isNaN(n))) {
      return [arr[0], arr[1]];
    }
    return [0, 100000];
  })();
  const pageIndex = !isNaN(qPage) && qPage > 0 ? qPage - 1 : 0;
  const qPageSize = Number(searchParams.get("pageSize")) || 25;
  const qDescription = searchParams.get("description") || "";
  const qSrDocId = searchParams.get("srDocId");
  const qProjectDocId = searchParams.get("projectDocId");

    // UI Values
  const [amountRange, setAmountRange] = useState<[number, number]>(qAmountRange);
  const [description, setDescription] = useState<string>(qDescription);
  const [pageSize, setPageSize] = useState<number>(qPageSize);
  const [page, setPage] = useState<number>(pageIndex);
  const [srDocId, setSrDocId] = useState<string | null>(qSrDocId);
  const [projectDocId, setProjectDocId] = useState<string | null>(qProjectDocId);


  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      
      const countSnap = await getCountFromServer(
        collection(firestore, "orders")
      );
      setOrdersCount(countSnap.data().count);

      const base = collection(firestore, "orders").withConverter(
        purchaseOrderConverter
      );

      let q = query(base, orderBy("doc-id", "desc"), limit(pageSize));

      if (srDocId && !isNaN(Number(srDocId))) {
        q = query(
          base,
          orderBy("doc-id", "desc"),
          where("service-report-doc-id", "==", parseInt(srDocId, 10)),
          where("amount", ">=", amountRange[0]),
          where("amount", "<=", amountRange[1]),
          where("description", ">=", description),
        );
      } else if (projectDocId && !isNaN(Number(projectDocId))) {
        q = query(
          base,
          orderBy("doc-id", "desc"),
          where("project-doc-id", "==", parseInt(projectDocId, 10)),
          where("amount", ">=", amountRange[0]),
          where("amount", "<=", amountRange[1]),
          where("description", ">=", description),
        );
      } else if (pageIndex > 0) {
        const topDoc = await getDoc(
          doc(firestore, "counter", "s5Lwh7q9cNZvYSJDAc2N")
        );
        const topId = topDoc.data()!["purchase-order-no"] as number;
        const start = topId - pageIndex * pageSize;

        q = query(
          base,
          orderBy("doc-id", "desc"),
          where("doc-id", "<=", start),
          where("description", ">=", description),
          where("amount", ">=", amountRange[0]),
          where("amount", "<=", amountRange[1]),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map((doc) => doc.data() as PurchaseOrder));
      setLoading(false);
    }
    
    fetchOrders();
  }, [srDocId, projectDocId, pageIndex, pageSize, description, amountRange]);

  return {
    orders,
    loading,
    ordersCount,
    pageIndex,
    pageSize,
    page,
    amountRange,
    description,
    srDocId,
    projectDocId,
    setAmountRange,
    setDescription,
    setPageSize,
    setSrDocId,
    setProjectDocId,
    setPage
  };
}