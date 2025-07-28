"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { ServiceReport } from "@/models/ServiceReport";

interface ServiceReportSelectProps {
  reports: ServiceReport[];
  selectedReport: ServiceReport | null;
  setSelectedReport: (report: ServiceReport | null) => void;
  placeholder?: string;
}

export default function ServiceReportSelect({
  reports,
  selectedReport,
  setSelectedReport,
  placeholder = "Select a service report...",
}: ServiceReportSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Filter and sort reports by docId descending
  const filtered = useMemo(() => {
    const sorted: ServiceReport[] = reports.sort((a, b) => b.docId - a.docId);
    if (!query) return sorted;
    const lower = query.toLowerCase();
    return sorted.filter(
      (r) =>
        r.docId.toString().toLowerCase().includes(lower) ||
        r.clientName.toLowerCase().includes(lower) ||
        r.cityStateZip.toLowerCase().includes(lower) ||
        r.contactEmail.toLowerCase().includes(lower) ||
        r.contactName.toLowerCase().includes(lower) ||
        r.materialNotes.toLowerCase().includes(lower) ||
        r.serviceAddress1.toLowerCase().includes(lower) ||
        r.serviceNotes.map((note) =>
          note.serviceNotes.toLowerCase().includes(lower)
        ).join(" ")
    );
  }, [reports, query]);

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
            ? `$${selectedReport.docId} - ${selectedReport.clientName}`
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 max-h-60 overflow-y-auto">
        <Command>
          <CommandInput
            placeholder="Search service reports..."
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
                      <span>{`${report.docId} - ${report.clientName}`}</span>
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
