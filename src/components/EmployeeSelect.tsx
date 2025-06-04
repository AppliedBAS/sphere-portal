// src/components/EmployeeSelect.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

  // Only filter once employees arrive
  const filtered = useMemo(() => {
    if (!query) return employees;
    const lower = query.toLowerCase();
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(lower) ||
        e.email.toLowerCase().includes(lower)
    );
  }, [employees, query]);

  return (
    <div className="max-w-[400px]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[400px] justify-between"
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

        <PopoverContent className="w-[400px] max-h-80 overflow-y-auto">
          <Command>
            <CommandInput
              placeholder="Search employees..."
              value={query}
              onValueChange={(val) => setQuery(val)}
            />

            <CommandGroup>
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
                !error &&
                filtered.map((emp) => (
                  <CommandItem
                    key={emp.id}
                    onSelect={() => {
                      setSelectedEmployee(emp);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{emp.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {emp.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}

              <CommandItem
                onSelect={() => {
                  setSelectedEmployee(null);
                  setOpen(false);
                  setQuery("");
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
  );
}
