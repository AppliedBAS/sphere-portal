import { ClientHit } from "@/models/Client";
import { algoliasearch } from "algoliasearch";
import { Hit } from "algoliasearch/lite";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";
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

interface ClientSelectProps {
  selectedClient: ClientHit | null;
  setSelectedClient: (client: ClientHit | null) => void;
}

export default function ClientSelect({
  selectedClient,
  setSelectedClient,
}: ClientSelectProps) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<ClientHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Memoize Algolia client so it's not recreated on every render
  const client = useMemo(
    () =>
      algoliasearch(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
      ),
    []
  );

  // Debounce the search function and memoize it
  const debouncedSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        if (!q.trim()) {
          setHits([]);
          return;
        }
        setLoading(true);
        try {
          const { hits } = await client.searchSingleIndex({
            indexName: "clients",
            searchParams: { query: q, hitsPerPage: 10 },
          });
          setHits(
            hits.map((hit: Hit) => ({
              objectID: hit.objectID,
              clientName: hit.name as string,
              active: hit.active as boolean,
              buildings: Array.isArray(hit.buildings)
                ? hit.buildings.map((bld: Record<string, unknown>) => ({
                    cityStateZip: String(bld["city-state-zip"]),
                    contactEmail: String(bld["contact-email"]),
                    contactPhone: String(bld["contact-phone"]),
                    contactName: String(bld["contact-name"]),
                    serviceAddress1: String(bld["service-address1"]),
                    serviceAddress2: String(bld["service-address2"]),
                  }))
                : [],
            }))
          );
        } catch (error) {
          console.error("Algolia search error:", error);
        } finally {
          setLoading(false);
        }
      }, 300),
    [client]
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Trigger search when query updates
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* Use a button for left-aligned trigger text */}
        <Button variant="outline" className="w-full md:max-w-96 justify-between md:text-sm">
          {selectedClient ? selectedClient.clientName : "Select client..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <Command>
          <CommandInput
            placeholder="Type to search clients..."
            value={query}
            onValueChange={(val) => setQuery(val)}
          />
          <CommandList>
            {loading && <div className="p-4 text-center">Loading...</div>}
            {!loading && hits.length === 0 && (
              <CommandEmpty>No clients found.</CommandEmpty>
            )}
            {!loading && hits.length > 0 && (
              <CommandGroup>
                {hits.map((hit) => (
                  <CommandItem
                    key={hit.objectID}
                    onSelect={() => {
                      setSelectedClient(hit);
                      setQuery(hit.clientName);
                      setOpen(false);
                    }}
                  >
                    {hit.clientName}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandItem
              onSelect={() => {
                setSelectedClient(null);
                setQuery("");
                setOpen(false);
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