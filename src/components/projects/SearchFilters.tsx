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

interface ProjectsSearchFiltersProps {
  qSearch: string;
  qActive: string;
  onSearchChange: (val: string) => void;
  onActiveChange: (val: string) => void;
  onDocIdChange: (val: number | null) => void;
  onFilterReset: () => void;
}

export function ProjectsSearchFilters({
  qSearch,
  qActive,
  onSearchChange,
  onActiveChange,
  onFilterReset,
}: ProjectsSearchFiltersProps) {
  const [search, setSearch] = useState<string>(qSearch);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearchChange(search);
    }
  };

  const handleSearchSubmit = () => {
    onSearchChange(search);
  };

  // Toggle logic for Active status
  const handleActiveChange = (val: string) => {
    if (val === qActive) {
      onActiveChange("");
    } else {
      onActiveChange(val);
    }
  };

  const hasActiveFilters = search.trim() !== "" || qActive !== "";

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Search Input with Button */}
      <div className="relative flex items-center w-96">
        <Input
          placeholder="Search Projects"
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

      {/* Active Status Filter */}
      <Select value={qActive} onValueChange={handleActiveChange}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
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