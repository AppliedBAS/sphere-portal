import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ServiceReportsSearchFiltersProps {
  qSearch: string;
  qAmountRange: [number, number];
  qDraft: string;
  qRemote: string;
  qWarranty: string;
  onSearchChange: (val: string) => void;
  onAmountRangeChange: (val: [number, number]) => void;
  onDraftChange: (val: string) => void;
  onWarrantyChange: (val: string) => void;
  onFilterReset: () => void;
}

export function ServiceReportsSearchFilters({
  qSearch,
  qDraft,
  qRemote,
  qWarranty,
  onSearchChange,
  onDraftChange,
  onWarrantyChange,
  onFilterReset,
}: ServiceReportsSearchFiltersProps) {
  const [search, setSearch] = useState<string>(qSearch);

  // Toggle logic for Draft
  const handleDraftChange = (val: string) => {
    if (val === qDraft) {
      onDraftChange("");
    } else {
      onDraftChange(val);
    }
  };

  // Toggle logic for Warranty
  const handleWarrantyChange = (val: string) => {
    if (val === qWarranty) {
      onWarrantyChange("");
    } else {
      onWarrantyChange(val);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearchChange(search);
    }
  };

  const handleSearchSubmit = () => {
    onSearchChange(search);
  };

  // (removed duplicate handleRemoteChange, see below for toggle logic)

  const hasActiveFilters =
    search.trim() !== "" || qDraft !== "" || qRemote !== "" || qWarranty !== "";

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Search Input with Button */}
      <div className="relative flex items-center w-96">
        <Input
          placeholder="Search by Client, Address, Contact, or Notes"
          value={search}
          type="search"
          onChange={(e) => setSearch(e.currentTarget.value)}
          onKeyDown={handleKeyPress}
          className="text-foreground"
        />
      </div>
      {/* Search Button */}
      <Button
        variant="default"
        size="sm"
        onClick={handleSearchSubmit}
        className="flex items-center gap-1"
      >
        <Search className="h-4 w-4" />
      </Button>
      {/* Draft Filter */}
      <Select value={qDraft} onValueChange={handleDraftChange}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Draft</SelectItem>
          <SelectItem value="false">Completed</SelectItem>
        </SelectContent>
      </Select>

      {/* Remote Filter */}
      {/* <Select value={qRemote} onValueChange={onRemoteChange}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue placeholder="Remote" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Remote</SelectItem>
          <SelectItem value="false">On-Site</SelectItem>
        </SelectContent>
      </Select> */}

      {/* Warranty Filter */}
      <Select value={qWarranty} onValueChange={handleWarrantyChange}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue placeholder="Warranty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Warranty</SelectItem>
          <SelectItem value="false">No Warranty</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear All Filters Button - only show when there are active filters */}
      {hasActiveFilters && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onFilterReset}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Clear All
        </Button>
      )}
    </div>
  );
}
