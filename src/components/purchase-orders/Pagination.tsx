import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalItems: number;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  onChange: () => void;
}

export function Pagination({
  page,
  setPage,
  totalItems,
  pageSize,
  setPageSize,
  onChange
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const pageSizeOptions: number[] = [25, 50, 100, 200];

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value, 10));
    onChange();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    onChange();
  };

  const generatePageButtons = () => {
    const buttons = [];
    const current = page + 1;

    if (current > 2) {
      buttons.push(
        <Button
          key={1}
          variant={current === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(0)}
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
          onClick={() => handlePageChange(current - 2)}
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
          onClick={() => handlePageChange(current)}
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
          onClick={() => handlePageChange(totalPages - 1)}
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">
          Showing {Math.min(pageSize, totalItems)} of {totalItems} Orders
        </div>
      </div>
      <div className="space-x-2 flex items-center">
        <div className="flex items-center space-x-2 mr-8">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
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
          disabled={page === 0}
          onClick={() => handlePageChange(Math.max(page - 1, 0))}
        >
          Previous
        </Button>
        {generatePageButtons()}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => handlePageChange(Math.min(page + 1, totalPages - 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}