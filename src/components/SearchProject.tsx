'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LiteClient as algoliasearch } from 'algoliasearch/lite';

import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

interface ProjectHit {
  objectID: string;
  docId: number;
  client: string;
  description: string;
  location: string;
}

function mapAlgoliaHit(hit: any): ProjectHit {
  return {
    objectID: hit.objectID,
    docId: hit['doc-id'] as number,
    client: hit.client as string,
    description: hit.description as string,
    location: hit.location as string,
  };
}

function CustomCombobox() {
  // InstantSearch hooks
  const { query, refine } = useSearchBox();
  const { hits: rawHits } = useHits();
  const hits = rawHits.map(mapAlgoliaHit);

  // local input + open state
  const [input, setInput] = useState(query);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // debounce refine
  useEffect(() => {
    const t = setTimeout(() => {
      refine(input);
      if (input && rawHits.length > 0) {
        setOpen(true);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [input, refine]);

  // close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            placeholder="Search projects…"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onFocus={() => input && hits.length > 0 && setOpen(true)}
            className="w-full"
            autoComplete="off"
          />
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 mt-1">
          {hits.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto p-2">
              {hits.map((hit) => (
                <Card
                  key={hit.objectID}
                  className="cursor-pointer hover:shadow-md"
                  onClick={() => {
                    setInput(hit.client);
                    setOpen(false);
                    // e.g. router.push(`/projects/${hit.docId}`)
                  }}
                >
                  <CardContent className="flex flex-col space-y-1">
                    <CardTitle className="text-sm text-gray-500">
                      #{hit.docId}
                    </CardTitle>
                    <h3 className="font-semibold">{hit.client}</h3>
                    <CardDescription className="text-xs line-clamp-2">
                      {hit.description}
                    </CardDescription>
                    <p className="text-xs text-gray-500">{hit.location}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {input ? `No results for “${input}”` : 'Type to search…'}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function SearchProject() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="projects"
      // keep SearchBox state alive if you ever unmount/remount
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <CustomCombobox />
    </InstantSearch>
  );
}
