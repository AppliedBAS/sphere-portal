import { useState } from 'react';

type SortColumn = "docId" | "vendor" | "description" | "status" | "createdAt" | "amount";

export function useTableState() {
  const [sortColumn, setSortColumn] = useState<SortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");


  const toggleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return {
    sortColumn,
    sortDirection,
    toggleSort,
  };
}