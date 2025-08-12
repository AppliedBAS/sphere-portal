import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ListCardProps {
  icon: ReactNode;
  name: string;
  quantity: number;
  onClick?: () => void;
}

export function ListCard({ icon, name, quantity, onClick }: ListCardProps) {
  return (
    <Card
      className="relative flex flex-col justify-center min-h-[60px] p-4 cursor-pointer hover:bg-muted/50 transition"
      onClick={onClick}
    >
      <div className="flex items-center h-full">
        {/* Icon left */}
        <div className="flex items-center justify-center h-full mr-4 text-primary">
          {icon}
        </div>
        {/* Content middle */}
        <div className="flex-1 flex flex-col justify-center">
          <span className="font-semibold text-base md:text-sm leading-tight mb-0.5">{name}</span>
        </div>
        {/* Quantity right */}
        <div className="flex items-center justify-center ml-4">
          <span className="text-lg md:text-base font-bold text-muted-foreground">{quantity}</span>
        </div>
      </div>
    </Card>
  );
}
