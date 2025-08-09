import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface SearchFiltersProps {
  searchDescription: string;
  setSearchDescription: (term: string) => void;
  amountRange: [number, number];
  setAmountRange: (range: [number, number]) => void;
  onSearch: () => void;
}

export function SearchFilters({
  searchDescription,
  setSearchDescription,
  amountRange,
  setAmountRange,
  onSearch
}: SearchFiltersProps) {
  const [showAmountPopover, setShowAmountPopover] = useState(false);
  const [pendingAmountRange, setPendingAmountRange] = useState<[number, number]>([0, 100000]);

  const handleSearch = () => {
    onSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }; 

  const handleAmountReset = () => {
    setPendingAmountRange([0, 100000]);
    setShowAmountPopover(false);
    onSearch();
  };

  const handleAmountConfirm = () => {
    setAmountRange(pendingAmountRange);
    setShowAmountPopover(false);
    onSearch();
  };

  const hasActiveFilters = searchDescription.trim() !== "" ||
    (amountRange[0] !== 0 || amountRange[1] !== 100000);

  return (
    <div className="flex items-center gap-2">
      {/* Search Input with Button */}
      <div className="relative flex items-center max-w-sm">
        <Input
          placeholder="Search by description"
          value={searchDescription}
          type='search'
          onChange={(e) => setSearchDescription(e.currentTarget.value)}
          onKeyDown={handleKeyPress}
          className="text-foreground"
        />
      </div>

      {/* Amount Range Filter */}
      <Popover
        open={showAmountPopover}
        onOpenChange={(open) => {
          setShowAmountPopover(open);
          if (open) setPendingAmountRange(amountRange);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={hasActiveFilters && (amountRange[0] !== 0 || amountRange[1] !== 100000) ?
              "border-primary bg-blue-50" : ""}
          >
            {amountRange[0] !== 0 || amountRange[1] !== 100000
              ? `Amount: $${amountRange[0].toLocaleString()} - $${amountRange[1].toLocaleString()}`
              : "Amount"}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="mb-2 font-medium text-sm">Set Amount Range</div>
          <div className="flex gap-2 mt-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pendingAmountRange[0] === 0 ? "" : pendingAmountRange[0]}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                if (val === "") {
                  setPendingAmountRange([0, pendingAmountRange[1]]);
                } else {
                  const num = Number(val);
                  setPendingAmountRange([
                    num,
                    pendingAmountRange[1] < num ? num : pendingAmountRange[1],
                  ]);
                }
              }}
              className="w-20 text-xs"
              placeholder="Min"
            />
            <span className="self-center text-xs">to</span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pendingAmountRange[1] === 100000 ? "" : pendingAmountRange[1]}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                if (val === "") {
                  setPendingAmountRange([pendingAmountRange[0], Infinity]);
                } else {
                  const num = Number(val);
                  setPendingAmountRange([
                    pendingAmountRange[0] > num ? pendingAmountRange[0] : pendingAmountRange[0],
                    num,
                  ]);
                }
              }}
              className="w-20 text-xs"
              placeholder="Max"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAmountReset}
            >
              Reset
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={handleAmountConfirm}
            >
              Confirm
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Search Button */}
      <Button
        variant="default"
        size="sm"
        onClick={handleSearch}
        className="flex items-center gap-1"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Clear All Filters Button - only show when there are active filters */}
      {hasActiveFilters && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSearchDescription("");
            setAmountRange([0, 100000]);
            onSearch();
          }}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Clear All
        </Button>
      )}
    </div>
  );
}