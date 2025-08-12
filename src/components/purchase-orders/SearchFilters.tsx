import { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { MAX_AMOUNT } from '@/lib/utils';
import { VendorHit } from '@/models/Vendor';
import VendorSelect from '../VendorSelect';
import { toast } from 'sonner';

interface SearchFiltersProps {
  qDescription: string;
  qMinAmount: number;
  qMaxAmount: number;
  qVendor: string;
  qStatus: string;
  onDescriptionChange: (val: string) => void;
  onAmountChange: (minAmount: number, maxAmount: number) => void;
  onVendorChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onFilterReset: () => void;
}

export function SearchFilters({
  qDescription,
  qMinAmount,
  qMaxAmount,
  qVendor,
  qStatus,
  onDescriptionChange,
  onAmountChange,
  onVendorChange,
  onStatusChange,
  onFilterReset
}: SearchFiltersProps) {
  const [showAmountPopover, setShowAmountPopover] = useState(false);
  const [minAmount, setMinAmount] = useState<number>(qMinAmount);
  const [maxAmount, setMaxAmount] = useState<number>(qMaxAmount);
  const [description, setDescription] = useState<string>(qDescription);
  const vendor: VendorHit | null = qVendor ? {
    objectID: "",
    name: qVendor,
    active: true,
    id: "",
  } : null;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onDescriptionChange(description);
    }
  }; 

  const handleAmountReset = () => {
    onAmountChange(0, MAX_AMOUNT);
  };

  const handleAmountConfirm = () => {
    if (minAmount < 0 || maxAmount > MAX_AMOUNT) {
      toast.error(`Please enter a valid amount range (0 - ${MAX_AMOUNT})`);
      return;
    }
    onAmountChange(minAmount, maxAmount);
  };

  const handleDescriptionSubmit = () => {
    onDescriptionChange(description);
  };

  const handleVendorChange = (vendor: VendorHit | null) => {
    onVendorChange(vendor?.name ?? "");
  };

  const hasActiveFilters = qDescription !== "" ||
    (qMinAmount !== 0 || qMaxAmount !== MAX_AMOUNT) || qVendor !== "" || qStatus !== "";

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Search Input with Button */}
      <div className="relative flex items-center w-96">
        <Input
          placeholder="Search by description"
          value={description}
          type='search'
          onChange={(e) => setDescription(e.currentTarget.value)}
          onKeyDown={handleKeyPress}
          className="text-foreground"
        />
      </div>

      {/* Search Button */}
      <Button
        variant="default"
        size="sm"
        onClick={handleDescriptionSubmit}
        className="flex items-center gap-1"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Amount Range Filter */}
      <Popover
        open={showAmountPopover}
        onOpenChange={(open) => {
          setShowAmountPopover(open);
          if (open) setMinAmount(minAmount);
          if (open) setMaxAmount(maxAmount);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
          >
            {qMinAmount !== 0 || qMaxAmount !== MAX_AMOUNT
              ? `Amount: $${qMinAmount.toLocaleString()} - $${qMaxAmount.toLocaleString()}`
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
              value={minAmount === 0 ? "" : minAmount}
              onChange={(e) => {
                if (e.target.value === "") {
                  setMinAmount(0);
                } else {
                  const num = Number(e.target.value);
                  setMinAmount(num);
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
              value={maxAmount === MAX_AMOUNT ? "" : maxAmount}
              onChange={(e) => {
                if (e.target.value === "") {
                  setMaxAmount(MAX_AMOUNT);
                } else {
                  const num = Number(e.target.value);
                  setMaxAmount(num);
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
      {/* Vendor Filter */}
      <div className="w-32">
        <VendorSelect selectedVendor={vendor} setSelectedVendor={handleVendorChange} placeholder="Vendor" />
      </div>
      {/* Status Filter */}
      <Select value={qStatus.toLowerCase()} onValueChange={onStatusChange}>
        <SelectTrigger className="w-28 h-8">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
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