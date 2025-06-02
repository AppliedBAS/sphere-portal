"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
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
  selectedEmployee: Employee | null;
  setSelectedEmployee: React.Dispatch<React.SetStateAction<Employee | null>>;
  placeholder: string;
}

export default function EmployeeSelect({
  selectedEmployee,
  setSelectedEmployee,
  placeholder = "Select an employee...",
}: EmployeeSelectProps) {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");

  // Fetch employees when popover opens
  useEffect(() => {
    if (!open || employees.length) return;

    (async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "employees"));
        const list: Employee[] = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            active: data.active ?? true,
            clientId: data.clientId ?? "",
            clientSecret: data.clientSecret ?? "",
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
            policy: data.policy ?? [],
          };
        });
        setEmployees(list);
      } catch (err) {
        console.error("Error loading employees:", err);
      }
    })();
  }, [open, employees.length]);

  // Filtered list
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
          >
            {selectedEmployee
              ? selectedEmployee.name
              : placeholder }
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
              {filtered.map((emp) => (
                <CommandItem
                  key={emp.id}
                  onSelect={() => {
                    setSelectedEmployee(emp);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{emp.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {emp.email}
                    </span>
                  </div>
                </CommandItem>
              ))}

              {filtered.length === 0 && (
                <CommandItem disabled>No employees found.</CommandItem>
              )}

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
