import { Skeleton } from "@/components/ui/skeleton";

interface EditPageSkeletonProps {
  titleWidth?: "sm" | "md" | "lg";
  showBreadcrumb?: boolean;
}

export default function EditPageSkeleton({ 
  titleWidth = "md",
  showBreadcrumb = true 
}: EditPageSkeletonProps) {
  const titleWidthClass = {
    sm: "w-48",
    md: "w-64",
    lg: "w-80",
  }[titleWidth];

  return (
    <div className="flex flex-col space-y-6 pb-8">
      {showBreadcrumb && (
        <>
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-2">
            <Skeleton className={`h-8 ${titleWidthClass}`} />
          </div>
        </>
      )}

      {/* Form skeleton - matches ProjectReportForm skeleton */}
      <div className="mt-4 flex flex-col gap-6 mb-8">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full md:max-w-96" />
        </div>
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="mt-8 mb-8 flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

