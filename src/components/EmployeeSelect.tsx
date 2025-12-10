// src/components/EmployeeSelect.tsx
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
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Employee } from "@/models/Employee";
import { CommandList } from "cmdk";

interface EmployeeSelectProps {
  employees: Employee[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  selectedEmployee: Employee | null;
  setSelectedEmployee: (empl: Employee | null) => void;
  placeholder?: string;
}

export default function EmployeeSelect({
  employees,
  loading,
  error,
  refetch,
  selectedEmployee,
  setSelectedEmployee,
  placeholder = "Select an employee...",
}: EmployeeSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Filter and sort employees alphabetically by name
  const filtered = useMemo(() => {
    // Sort alphabetically by name
    const sorted = employees.sort((a, b) => a.name.localeCompare(b.name));
    if (!query) return sorted;
    const lower = query.toLowerCase();
    return sorted.filter(
      (e) =>
        e.name.toLowerCase().includes(lower) ||
        e.email.toLowerCase().includes(lower)
    );
  }, [employees, query]);

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
            onClick={() => {
              // Refetch employees any time the popover opens if the list is empty
              if (!open && employees.length === 0) {
                refetch();
              }
            }}
          >
            {selectedEmployee ? selectedEmployee.name : placeholder}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-96 p-0">
          <Command>
            <CommandInput
              placeholder="Search employees..."
              value={query}
              onValueChange={(val) => setQuery(val)}
            />

            <CommandList className="max-h-60 overflow-y-auto">
              {loading && (
                <CommandItem disabled>Loading employees…</CommandItem>
              )}
              {error && (
                <CommandItem disabled>Error loading employees.</CommandItem>
              )}
              {!loading && !error && filtered.length === 0 && (
                <CommandItem disabled>No employees found.</CommandItem>
              )}

              {!loading &&
                !error && filtered.length > 0 && (
                <CommandGroup>
                  {filtered.map((emp) => (
                    <CommandItem
                      key={emp.id}
                      onSelect={() => {
                        setSelectedEmployee(emp);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                  {emp.name}
                  </CommandItem>
                ))}
                </CommandGroup>
              )}

              <CommandItem
                onSelect={() => {
                  setSelectedEmployee(null);
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
