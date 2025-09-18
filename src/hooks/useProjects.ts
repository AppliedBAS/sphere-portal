import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectHit } from "@/models/Project";
import { searchClient } from "@/lib/algolia";
import { Hit } from "algoliasearch/lite";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectHit[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Search Query Params
  const searchParams = useSearchParams();
  const qPage = Number(searchParams.get("page")) || 1;
  const qPageSize = Number(searchParams.get("pageSize")) || 25;
  const qSearch = searchParams.get("q") || "";
  const qActive = searchParams.get("active") || "";

  useEffect(() => {
    async function algoliaSearch() {
      setLoading(true);
      try {
        const filters: string[] = [];
        if (qActive.trim()) {
          filters.push(`active:${qActive}`);
        }
        const { hits, nbHits, nbPages } = await searchClient.searchSingleIndex({
          indexName: "projects_docid_desc", // Update this to your actual Algolia index name
          searchParams: {
            query: qSearch,
            page: qPage - 1,
            filters: filters.join(" AND "),
            hitsPerPage: qPageSize,
          },
        });
        setTotalPages(nbPages ?? 0);
        setProjects(hits.map((hit: Hit) => ({
          objectID: hit.objectID,
          docId: hit["doc-id"],
          client: hit.client,
          location: hit.location,
          description: hit.description,
          active: hit.active,
          balance: hit.balance,
          createdAt: hit["created-at"],
        })) as ProjectHit[]);
        setProjectsCount(hits.length ? hits.length : 0);
        setTotalCount(nbHits ? nbHits : 0);
      } catch {
        setProjects([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }
    algoliaSearch();
  }, [qPage, qPageSize, qSearch, qActive]);

  return {
    projects,
    loading,
    projectsCount,
    totalCount,
    totalPages,
    qSearch,
    qActive,
    qPage,
    qPageSize,
    setProjects
  };
}