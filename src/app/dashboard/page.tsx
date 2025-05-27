import SearchProject from "@/components/SearchProject";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="mx-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 flex flex-col items-start">
          <span className="">Total Project Reports</span>
          <span className="text-2xl font-bold mt-2">0</span>
        </Card>
        <Card className="p-6 flex flex-col items-start">
          <span className="">Total Service Reports</span>
          <span className="text-2xl font-bold mt-2">0</span>
        </Card>
        <Card className="p-6 flex flex-col items-start">
          <span className="">Total Purchase Orders</span>
          <span className="text-2xl font-bold mt-2">0</span>
        </Card>
      </div>
      {/* Recent activity panel */}
      {/* <SearchProject /> */}
    </div>
  );
}

