"use client";

import React, { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { InstantSearch, Configure, Hits, useSearchBox } from "react-instantsearch";
import { liteClient as algoliasearch, Hit } from "algoliasearch/lite";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";

export interface AlgoliaSelectProps<HitType> {
  indexName: string;
  placeholder?: string;
  buttonLabel?: (selected: HitType | null) => string;
  mapHit: (hit: Hit) => HitType;
  renderItem: (item: HitType) => React.ReactNode;
  selected: HitType | null;
  onSelect: (item: HitType | null) => void;
  hitsPerPage?: number;
}

export function AlgoliaSelect<HitType>({
  indexName,
  placeholder = "Search…",
  buttonLabel = (sel) => (sel ? String(sel) : "Select…"),
  mapHit,
  renderItem,
  selected,
  onSelect,
  hitsPerPage = 10,
}: AlgoliaSelectProps<HitType>) {
  const [open, setOpen] = useState(false);

  function SearchBox() {
    const { query, refine } = useSearchBox();
    return (
      <CommandInput
        placeholder={placeholder}
        value={query}
        onValueChange={refine}
      />
    );
  }

  function HitWrapper({ hit }: { hit: Hit }) {
    const item = mapHit(hit);
    return (
      <CommandItem
        onSelect={() => {
          onSelect(item);
          setOpen(false);
        }}
      >
        {renderItem(item)}
      </CommandItem>
    );
  }

  const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
  );

  return (
    <div className="w-[400px]">
      <InstantSearch searchClient={client} indexName={indexName}>
        <Configure hitsPerPage={hitsPerPage} />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[400px] justify-between"
            >
              {buttonLabel(selected)}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[400px] max-h-80 overflow-y-auto">
            <Command>
              <SearchBox />
              <Hits hitComponent={HitWrapper} />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onSelect(null);
                    setOpen(false);
                  }}
                >
                  <ChevronsUpDown className="mr-2 rotate-180" />
                  Clear Selection
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </InstantSearch>
    </div>
  );
}
