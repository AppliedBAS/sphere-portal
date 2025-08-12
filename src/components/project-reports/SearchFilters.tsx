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
import { useState } from "react";

interface ProjectReportsSearchFiltersProps {
  qSearch: string;
  qDraft: string;
  onSearchChange: (val: string) => void;
  onDraftChange: (val: string) => void;
  onProjectDocIdChange: (val: number | null) => void;
  onFilterReset: () => void;
}

export function ProjectReportsSearchFilters({
  qSearch,
  qDraft,
  onSearchChange,
  onDraftChange,
  onFilterReset,
}: ProjectReportsSearchFiltersProps) {
  const [search, setSearch] = useState<string>(qSearch);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearchChange(search);
    }
  };

  const handleSearchSubmit = () => {
    onSearchChange(search);
  };

  // Toggle logic for Draft
  const handleDraftChange = (val: string) => {
    if (val === qDraft) {
      onDraftChange("");
    } else {
      onDraftChange(val);
    }
  };

  const hasActiveFilters = search.trim() !== "" || qDraft !== "";

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Search Input with Button */}
      <div className="relative flex items-center w-96">
        <Input
          placeholder="Search Project Reports"
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
