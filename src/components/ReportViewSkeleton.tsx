import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface ReportViewSkeletonProps {
  /** Number of detail fields to show in the details card */
  detailFieldsCount?: number;
  /** Type of second card: "materials" for Materials & Notes, "service" for Service Notes */
  secondCardType?: "materials" | "service";
}

export default function ReportViewSkeleton({
  detailFieldsCount = 8,
  secondCardType = "materials",
}: ReportViewSkeletonProps) {
  return (
    <div className="flex flex-col space-y-6 pb-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Title skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Details card skeleton */}
        <Card className="p-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[...Array(detailFieldsCount)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </Card>

        {/* Second card skeleton */}
        {secondCardType === "materials" ? (
          <Card className="p-4">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-6">
              <div className="space-y-4 pb-4 border-b">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

