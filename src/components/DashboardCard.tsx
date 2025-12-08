import { ReactNode, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (onOpen && !isLoading) {
      setIsLoading(true);
      onOpen();
    }
  };

  return (
    <Card 
      className={`relative flex flex-col justify-center min-h-[70px] p-4 ${isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer'}`} 
      onClick={handleClick}
    >
      {/* Open icon top right */}
      <div className="flex items-center h-full">
        {/* Icon left */}
        <div className="flex items-center justify-center h-full mr-4 text-primary">
          {isLoading ? <Loader2 className="animate-spin" /> : icon}
        </div>
        {/* Content middle */}
        <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs">{subtitle}</span>
                <span className="text-base md:text-xs text-muted-foreground">{date}</span>
            </div>
          <span className="font-bold text-lg leading-tight mb-1">{title}</span>
        </div>
      </div>
    </Card>
  );
}
