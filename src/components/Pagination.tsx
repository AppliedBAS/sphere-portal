import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationProps {
  qPage: number;
  qPageSize: number;
  ordersCount: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function Pagination({
  qPage,
  qPageSize,
  ordersCount,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange
}: PaginationProps) {
  const pageSizeOptions: number[] = [25, 50, 100, 200];

  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(parseInt(value, 10));
  };

  // page is now 1-based
  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
  };

  const generatePageButtons = () => {
    const buttons = [];
    const current = qPage;

    if (current > 2) {
      buttons.push(
        <Button
          key={1}
          variant={current === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      if (current > 3) {
        buttons.push(
          <span key="start-ellipsis" className="px-1">...</span>
        );
      }
    }

    if (current > 1) {
      buttons.push(
        <Button
          key={current - 1}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current - 1)}
        >
          {current - 1}
        </Button>
      );
    }

    buttons.push(
      <Button key={current} variant="default" size="sm">
        {current}
      </Button>
    );

    if (current < totalPages) {
      buttons.push(
        <Button
          key={current + 1}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current + 1)}
        >
          {current + 1}
        </Button>
      );
    }

    if (current < totalPages - 1) {
      if (current < totalPages - 2) {
        buttons.push(
          <span key="end-ellipsis" className="px-1">...</span>
        );
      }
      buttons.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

   // Calculate start and end item numbers for display
   const startItem = ordersCount === 0 ? 0 : (qPageSize * (qPage - 1)) + 1;
   const endItem = Math.min(qPageSize * qPage, totalCount);

   return (
     <div className="flex items-center justify-between py-4">
       <div className="flex items-center space-x-4">
         <div className="text-sm text-muted-foreground">
           {ordersCount === 0
             ? "No rows available"
             : `Showing ${startItem}-${endItem} of ${totalCount} rows`}
         </div>
       </div>
      <div className="space-x-2 flex items-center">
        <div className="flex items-center space-x-2 mr-8">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select value={qPageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={qPage === 1}
          onClick={() => handlePageChange(Math.max(qPage - 1, 1))}
        >
          Previous
        </Button>
        {generatePageButtons()}
        <Button
          variant="outline"
          size="sm"
          disabled={qPage >= totalPages}
          onClick={() => handlePageChange(Math.min(qPage + 1, totalPages))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}