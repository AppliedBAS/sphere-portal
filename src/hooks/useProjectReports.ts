import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectReportHit } from "@/models/ProjectReport";
import { searchClient } from "@/lib/algolia";
import { Hit } from "algoliasearch/lite";

export function useProjectReports() {
  const [reports, setReports] = useState<ProjectReportHit[]>([]);
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

  useEffect(() => {
    async function algoliaSearch() {
      setLoading(true);
      try {
        const filters: string[] = [];
        if (qDraft.trim()) {
          filters.push(`draft:${qDraft}`);
        }
        const { hits, nbHits, nbPages } = await searchClient.searchSingleIndex({
          indexName: "project_reports_docid_desc",
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
          projectDocId: hit["project-doc-id"],
          clientName: hit["client-name"],
          location: hit.location,
          description: hit.description,
          materials: hit["materials"],
          notes: hit["notes"],
          draft: hit.draft,
          createdAt: hit["created-at"],
          authorTechnicianRef: hit["author-technician-ref"],
          leadTechnicianRef: hit["lead-technician-ref"],
          assignedTechniciansRef: hit["assigned-technicians-ref"],
        })) as ProjectReportHit[]);
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
  }, [qPage, qPageSize, qSearch, qDraft]);

  return {
    reports,
    loading,
    reportsCount,
    totalCount,
    totalPages,
    qSearch,
    qDraft,
    qPage,
    qPageSize
  };
}
