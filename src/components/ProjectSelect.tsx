"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { algoliasearch } from "algoliasearch";
import { debounce } from "lodash";
import { ProjectHit } from "@/models/Project";
import { Hit } from "algoliasearch/lite";

interface ProjectSelectProps {
  selectedProject: ProjectHit | null;
  setSelectedProject: (proj: ProjectHit | null) => void;
  placeholder?: string;
}

export default function ProjectSelect({
  selectedProject,
  setSelectedProject,
  placeholder = "Select project...",
}: ProjectSelectProps) {
  const [open, setOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [hits, setHits] = useState<ProjectHit[]>([]);
  const [loading, setLoading] = useState(false);

  // Memoize Algolia client
  const client = useMemo(
    () =>
      algoliasearch(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
      ),
    []
  );

  const debouncedSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        setLoading(true);

        try {
          const { hits } = await client.searchSingleIndex({
            indexName: "projects",
            searchParams: { query: q, hitsPerPage: 10 },
          });
          setHits(
            hits
              .map((hit: Hit) => ({
                objectID: String(hit.objectID),
                docId: Number(hit["doc-id"]),
                client: String(hit.client),
                description: String(hit.description),
                location: String(hit.location),
              }))
              .sort((a, b) => (b.docId ?? 0) - (a.docId ?? 0))
          );
        } catch (error) {
          console.error("Algolia search error:", error);
        } finally {
          setLoading(false);
        }
      }, 300),
    [client]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    debouncedSearch(queryText);
  }, [queryText, debouncedSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full md:max-w-96 justify-between overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <span className="truncate block text-left">
            {selectedProject
              ? `${selectedProject.docId} - ${selectedProject.client} - ${selectedProject.location} - ${selectedProject.description}`
              : placeholder}
          </span>
          <ChevronsUpDown className="opacity-50 flex-shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 max-h-60">
        <Command>
          <CommandInput
            placeholder="Search projects..."
            value={queryText}
            onValueChange={(val) => setQueryText(val)}
          />
          <CommandList>
            {loading && <div className="p-4 text-center">Loading...</div>}
            {!loading && hits.length === 0 && (
              <CommandEmpty>No projects found.</CommandEmpty>
            )}
            {!loading && hits.length > 0 && (
              <CommandGroup>
                {hits.map((proj) => (
                  <CommandItem
                    key={proj.objectID}
                    onSelect={() => {
                      setSelectedProject(proj);
                      setOpen(false);
                      setQueryText("");
                    }}
                  >
                    {`${proj.docId} - ${proj.client} - ${proj.location} - ${proj.description}`}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandItem
              onSelect={() => {
                setSelectedProject(null);
                setOpen(false);
                setQueryText("");
              }}
            >
              <ChevronsUpDown className="mr-2 rotate-180" />
              Clear Selection
            </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
