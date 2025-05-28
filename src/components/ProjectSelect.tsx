'use client';

import { Check, ChevronsUpDown } from "lucide-react"
import { Configure, Hits, InstantSearch, useSearchBox } from "react-instantsearch";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Button } from "./ui/button";
import { useState } from "react";
import { ProjectHit } from "@/models/ProjectHit";

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

function mapAlgoliaHit(hit: any): ProjectHit {
  return {
    objectID: hit.objectID,
    docId: hit['doc-id'] as number,
    client: hit.client as string,
    description: hit.description as string,
    location: hit.location as string,
  };
}

export default function ProjectSelect() {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectHit | null>(null);

  function CustomSearchBox() {
      const { refine, clear, query } = useSearchBox();

      return (
        <CommandInput
          placeholder="Search projects..."
          value={query}
          onValueChange={(value) => refine(value)}
          className=""
        />
      )
  }
  
  const ProjectHitComponent = ({ hit }: { hit: any }) => {
    const project = mapAlgoliaHit(hit);
    return (
      <Button
        variant="ghost"
        className="w-full h-[100px] text-left m-2"
        onClick={() => {
          setSelectedProject(project);
          setOpen(false);
        }}
      >
        <div className="w-full text-left space-y-2 p-8">
          <p className="font-semibold">{project.docId} - {project.client}</p>
          <p className="text-sm text-muted-foreground">{project.description}</p>
          <p className="text-xs text-muted-foreground">{project.location}</p>
        </div>
      </Button>
    );
  };

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="projects"
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Configure filters="active:true" />
      <div className="w-full max-w-md mx-auto">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[400px] justify-between"
            >
              {selectedProject
              ? `${selectedProject.docId} - ${selectedProject.client}`
              : "Select Project..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full max-h-96 overflow-y-auto">
            <Command>
              <CustomSearchBox />
              <Hits hitComponent={ProjectHitComponent} />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    // handle reset
                  }}
                >
                  <Check className="mr-2" />
                  Clear Selection
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </InstantSearch>
  );
}
