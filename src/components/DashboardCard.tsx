import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface DashboardCardProps {
  icon: ReactNode;
  subtitle: string;
  title: string;
  date?: string;
  onOpen?: () => void;
}

export function DashboardCard({
  icon,
  subtitle,
  title,
  date,
  onOpen,
}: DashboardCardProps) {
  return (
    <Card className="relative flex flex-col justify-center min-h-[70px] p-4 cursor-pointer" onClick={onOpen}>
      {/* Open icon top right */}
      <div className="flex items-center h-full">
        {/* Icon left */}
        <div className="flex items-center justify-center h-full mr-4">{icon}</div>
        {/* Content middle */}
        <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
                <span className="text-muted-foreground">{subtitle}</span>
                <span className="text-xs text-muted-foreground">{date}</span>
            </div>
          <span className="font-bold text-lg leading-tight mb-1">{title}</span>
        </div>
      </div>
    </Card>
  );
}
