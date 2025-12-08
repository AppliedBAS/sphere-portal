import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-8">
      {/* Title and Create Button skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 w-full gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* All tab content - three subsections */}
        <div className="space-y-8">
          {/* Purchase Orders section */}
          <section>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="relative flex flex-col justify-center min-h-[70px] p-4">
                  <div className="flex items-center h-full">
                    <Skeleton className="h-8 w-8 mr-4 rounded" />
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-center mb-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-5 w-24 mb-1" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Service Reports section */}
          <section>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="relative flex flex-col justify-center min-h-[70px] p-4">
                  <div className="flex items-center h-full">
                    <Skeleton className="h-8 w-8 mr-4 rounded" />
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-center mb-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-5 w-24 mb-1" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Project Reports section */}
          <section>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="relative flex flex-col justify-center min-h-[70px] p-4">
                  <div className="flex items-center h-full">
                    <Skeleton className="h-8 w-8 mr-4 rounded" />
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-center mb-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-5 w-24 mb-1" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

