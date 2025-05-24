// import { ProjectReportForm } from "@/components/ProjectReportForm";
// import { searchClient } from "@/lib/algolia";
import SearchProject from "@/components/SearchProject";

// function Hit({ hit: any }) {
//   return (
//     <article>
//       <h2 className="text-lg font-bold">{hit.name}</h2>
//       <p className="text-sm text-gray-500">{hit.description}</p>
//     </article>
//   )
// }

export default function Dashboard() {
  return (
    <div className="">
      <SearchProject />
    </div>
  );
}

