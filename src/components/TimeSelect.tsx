// src/components/TimeSelect.tsx
"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeSelectProps {
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}

export default function TimeSelect({
  selectedTime,
  setSelectedTime,
}: TimeSelectProps) {
  // Build an array of strings from "0.0" to "23.5" in steps of 0.5
  const times = React.useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        // Multiply i by 0.5 to get 0.0, 0.5, 1.0, 1.5, …, 23.5
        return (i * 0.5).toFixed(1);
      }),
    []
  );

  return (
    <Select value={selectedTime} onValueChange={setSelectedTime}>
      <SelectTrigger className="w-24">
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        {times.map((time) => (
          <SelectItem key={time} value={time} >
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
