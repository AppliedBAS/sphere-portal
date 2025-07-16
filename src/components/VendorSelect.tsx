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
import { VendorHit } from "@/models/Vendor";
import { Hit } from "algoliasearch/lite";

interface VendorSelectProps {
  selectedVendor: VendorHit | null;
  setSelectedVendor: (vendor: VendorHit | null) => void;
  placeholder?: string;
}

export default function VendorSelect({
  selectedVendor,
  setSelectedVendor,
  placeholder = "Select vendor...",
}: VendorSelectProps) {
  const [open, setOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [hits, setHits] = useState<VendorHit[]>([]);
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
        if (!q.trim()) {
          setHits([]);
          return;
        }

        setLoading(true);

        try {
          const { hits } = await client.searchSingleIndex({
            indexName: "vendors",
            searchParams: { query: q, hitsPerPage: 10 },
          });
          setHits(
            hits.map((hit: Hit) => ({
              objectID: String(hit.objectID),
              name: String(hit.name),
              active: Boolean(hit.active),
              id: String(hit.id),
            })) 
            .sort((a, b) => a.name.localeCompare(b.name)) as VendorHit[]
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
          style={{ display: "flex", alignItems: "center" }}
        >
          <span className="truncate block text-left">
            {selectedVendor ? selectedVendor.name : placeholder}
          </span>
          <ChevronsUpDown className="opacity-50 flex-shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 max-h-60 overflow-y-auto">
        <Command>
          <CommandInput
            placeholder="Search vendors..."
            value={queryText}
            onValueChange={(val) => setQueryText(val)}
          />
          <CommandList>
            {loading && <div className="p-4 text-center">Loading...</div>}
            {!loading && hits.length === 0 && (
              <CommandEmpty>No vendors found.</CommandEmpty>
            )}
            {!loading && hits.length > 0 && (
              <CommandGroup>
                {hits.map((vendor) => (
                  <CommandItem
                    key={vendor.objectID}
                    onSelect={() => {
                      setSelectedVendor(vendor);
                      setOpen(false);
                      setQueryText("");
                    }}
                  >
                    {vendor.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandItem
              onSelect={() => {
                setSelectedVendor(null);
                setOpen(false);
                setQueryText("");
              }}
            >
              Clear selection
            </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
