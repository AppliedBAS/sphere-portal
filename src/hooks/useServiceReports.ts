import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ServiceReportHit } from "@/models/ServiceReport";
import { searchClient } from "@/lib/algolia";
import { Hit } from "algoliasearch/lite";

export function useServiceReports() {
  const [reports, setReports] = useState<ServiceReportHit[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [reportsCount, setReportsCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Search Query Params
  const searchParams = useSearchParams();
  const qPage = Number(searchParams.get("page")) || 1;
  const qPageSize = Number(searchParams.get("pageSize")) || 25;
  const qSearch = searchParams.get("q") || "";
  const qDraft = searchParams.get("draft") || "";
  const qWarranty = searchParams.get("warranty") || "";
  const qRemote = searchParams.get("remote") || "";

  useEffect(() => {
    async function algoliaSearch() {
      setLoading(true);
      try {
        const filters: string[] = [];
        if (qDraft) {
          filters.push(`draft:${qDraft}`);
        }
        if (qRemote) {
          const val = qRemote == "true" ? "Y" : "N"
          filters.push(`remote:${val}`);
        }
        if (qWarranty) {
          filters.push(`warranty:${qWarranty}`);
        }

        const { hits, nbHits, nbPages } = await searchClient.searchSingleIndex({
          indexName: "service_reports_docid_desc",
          searchParams: {
            query: qSearch,
            page: qPage - 1,
            filters: filters.join(" AND "),
            hitsPerPage: qPageSize,
          },
        });

        setTotalPages(nbPages ?? 0);
        setReports(hits.map((hit: Hit) => ({
            objectID: hit.objectID,
            docId: hit["doc-id"],
            clientName: hit["client-name"],
            createdAt: hit["created-at"],
            draft: hit.draft,
            authorTechnicianRef: hit["author-technician-ref"],
            cityStateZip: hit["city-state-zip"],
            contactEmail: hit["contact-email"],
            contactName: hit["contact-name"],
            contactPhone: hit["contact-phone"],
            id: hit.id,
            materialNotes: hit["material-notes"],
            serviceAddress1: hit["service-address1"],
            serviceAddress2: hit["service-address2"],
            serviceNotes: hit["service-notes"],
            warranty: hit.warranty ?? null,
        })) as ServiceReportHit[]);

        setReportsCount(hits.length ? hits.length : 0);
        setTotalCount(nbHits ? nbHits : 0);
      } catch {
        setReports([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }
    algoliaSearch();
  }, [qPage, qPageSize, qSearch, qDraft, qRemote, qWarranty]);

  return {
    reports,
    loading,
    reportsCount,
    totalCount,
    totalPages,
    qSearch,
    qDraft,
    qRemote,
    qWarranty,
    qPage,
    qPageSize
  };
}