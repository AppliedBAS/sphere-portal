import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PurchaseOrderHit } from "@/models/PurchaseOrder";
import { searchClient } from "@/lib/algolia";
import { Hit } from "algoliasearch/lite";
import { MAX_AMOUNT } from "@/lib/utils";

export function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrderHit[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Search Query Params
  const searchParams = useSearchParams();
  const qPage = Number(searchParams.get("page")) || 1;

  const qMinAmount = Number(searchParams.get("minAmount")) || 0;
  const qMaxAmount = Number(searchParams.get("maxAmount")) || MAX_AMOUNT;

  const qPageSize = Number(searchParams.get("pageSize")) || 25;
  const qDescription = searchParams.get("description") || "";
  const qVendor = searchParams.get("vendor") || "";
  const qStatus = searchParams.get("status") || "";
  const qSrDocId = searchParams.get("srDocId");
  const qProjectDocId = searchParams.get("projectDocId");

  function quoteIfNeeded(v: string) {
    // quote if spaces or special chars; escape inner quotes
    return /[\s()"']/.test(v) ? `"${v.replace(/"/g, '\\"')}"` : v;
  }
  // Algolia search function (no debounce)

  useEffect(() => {
    async function algoliaSearch() {
      setLoading(true);
      try {
        const filters: string[] = [];
        if (qSrDocId && !isNaN(Number(qSrDocId))) {
          filters.push(`service-report-doc-id:${parseInt(qSrDocId, 10)}`);
        }
        if (qProjectDocId && !isNaN(Number(qProjectDocId))) {
          filters.push(`project-doc-id:${parseInt(qProjectDocId, 10)}`);
        }
        if (
          qMinAmount !== 0 &&
          qMaxAmount !== MAX_AMOUNT
        ) {
          filters.push(
            `amount >= ${qMinAmount} AND amount <= ${qMaxAmount}`
          );
        } 
        else if (qMinAmount > 0 && qMaxAmount === MAX_AMOUNT) {
          filters.push(`amount >= ${qMinAmount}`);
        } 
        else if (qMaxAmount !== MAX_AMOUNT) {
          filters.push(`amount <= ${qMaxAmount}`);
        }
        if (qVendor.trim()) {
          filters.push(`vendor:${quoteIfNeeded(qVendor)}`);
        }
        if (qStatus.trim()) {
          filters.push(`status:${qStatus.toUpperCase()}`);
        }
        // Algolia does not support range queries on text, so just use query for description
        const { hits, nbHits, nbPages } = await searchClient.searchSingleIndex({
          indexName: "purchase_orders_docid_desc",
          searchParams: {
            query: qDescription,
            page: qPage - 1, // Algolia uses 0-based index
            filters: filters.join(" AND "),
            hitsPerPage: qPageSize,
          },
        });

        setTotalPages(nbPages ?? 0);
        setOrders(
          hits.map((hit: Hit) => ({
            objectID: hit.objectID,
            amount: hit.amount,
            createdAt: hit["created-at"],
            description: hit.description,
            docId: hit["doc-id"],
            otherCategory: hit["other-category"],
            projectDocId: hit["project-doc-id"],
            serviceReportDocId: hit["service-report-doc-id"],
            status: hit.status,
            technicianRef: hit["technician-ref"],
            vendor: hit.vendor,
            id: hit.id,
          })) as PurchaseOrderHit[]
        );

        setOrdersCount(hits.length ? hits.length : 0);
        setTotalCount(nbHits ? nbHits : 0);
      } catch {
        setOrders([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }
    algoliaSearch();
  }, [qDescription, qPage, qPageSize, qProjectDocId, qSrDocId, qStatus, qVendor, qMinAmount, qMaxAmount]);

  return {
    orders,
    loading,
    ordersCount,
    totalCount,
    totalPages,
    qMinAmount,
    qMaxAmount,
    qDescription,
    qVendor,
    qStatus,
    qPage,
    qPageSize,
    qSrDocId,
    qProjectDocId,
  };
}
