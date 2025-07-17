"use client";

import React, { useState, useMemo } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ProjectReport } from "@/models/ProjectReport";

interface ProjectReportSelectProps {
  reports: ProjectReport[];
  selectedReport: ProjectReport | null;
  setSelectedReport: (report: ProjectReport | null) => void;
  placeholder?: string;
}

export default function ProjectReportSelect({
  reports,
  selectedReport,
  setSelectedReport,
  placeholder = "Select a project report...",
}: ProjectReportSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Filter and sort reports by docId descending
  const filtered = useMemo(() => {
    const sorted: ProjectReport[] = reports.sort((a, b) => b.docId - a.docId);
    if (!query) return sorted;
    const lower = query.toLowerCase();
    return sorted.filter(
      (r) =>
        r.projectDocId.toString().toLowerCase().includes(lower) ||
        r.clientName.toLowerCase().includes(lower) ||
        r.location.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower)
    );
  }, [reports, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:max-w-96 justify-between overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {selectedReport
            ? `${selectedReport.projectDocId} - ${selectedReport.docId} - ${selectedReport.clientName} - ${selectedReport.location}`
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 max-h-60 overflow-y-auto">
        <Command>
          <CommandInput
            placeholder="Search project reports..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {filtered.length === 0 && (
              <CommandItem disabled>No reports found.</CommandItem>
            )}
            {filtered.length > 0 && (
              <CommandGroup>
                {filtered.map((report) => (
                  <CommandItem
                    key={report.id || report.docId}
                    onSelect={() => {
                      setSelectedReport(report);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <div className="flex flex-col">
                      <span>{`${report.projectDocId} - ${report.docId} - ${report.clientName} - ${report.location}`}</span>
                      <span className="text-sm text-muted-foreground">
                        {report.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandItem
              onSelect={() => {
                setSelectedReport(null);
                setOpen(false);
                setQuery("");
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
