"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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

  // Algolia client
  const client = useMemo(
    () =>
      algoliasearch(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
      ),
    []
  );

  // Single helper to fetch hits for any query, including empty string
  const fetchHits = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const { hits: rawHits } = await client.searchSingleIndex({
        indexName: "vendors",
        searchParams: { query: q.trim(), hitsPerPage: 10 },
      });
      const mapped = rawHits
        .map((hit: Hit) => ({
          objectID: String(hit.objectID),
          name: String(hit.name),
          active: Boolean(hit.active),
          id: String(hit.id),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)) as VendorHit[];

      setHits(mapped);
    } catch (err) {
      console.error("Algolia search error:", err);
      setHits([]);
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Debounced version for when user is typing
  const debouncedSearch = useMemo(
    () => debounce((q: string) => fetchHits(q), 300),
    [fetchHits]
  );

  // When queryText changes, trigger the debounced search
  useEffect(() => {
    debouncedSearch(queryText);
    return () => debouncedSearch.cancel();
  }, [queryText, debouncedSearch]);

  // Prevent background scroll when popover is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // When popover opens, do an initial fetch with empty query
  useEffect(() => {
    if (open) {
      fetchHits("");
    }
  }, [open, fetchHits]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:max-w-96 justify-between overflow-hidden text-ellipsis whitespace-nowrap"
        >
          <span className="truncate text-left">
            {selectedVendor ? selectedVendor.name : placeholder}
          </span>
          <ChevronsUpDown className="opacity-50 flex-shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0">
        <Command>
          <CommandInput
            placeholder="Search vendors..."
            value={queryText}
            onValueChange={setQueryText}
          />
          <CommandList className="max-h-60 overflow-y-auto">
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
              <ChevronsUpDown className="mr-2 rotate-180" />
              Clear Selection
            </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
