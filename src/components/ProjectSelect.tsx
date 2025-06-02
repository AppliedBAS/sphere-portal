import { AlgoliaSelect } from "@/components/AlgoliaSelect";
import { Hit } from "algoliasearch/lite";
import { ProjectHit } from "@/models/ProjectHit";

interface ProjectSelectProps {
  selectedProject: ProjectHit | null;
  setSelectedProject: (p: ProjectHit | null) => void;
}

export default function ProjectSelect(props: ProjectSelectProps) {
  return (
    <AlgoliaSelect<ProjectHit>
      indexName="projects"
      placeholder="Search projects..."
      buttonLabel={(p) =>
        p ? `${p.docId} – ${p.client}` : "Select Project..."
      }
      hitsPerPage={8}
      mapHit={(hit: Hit) => ({
        objectID: hit.objectID,
        docId: hit["doc-id"] as number,
        client: hit.client as string,
        description: hit.description as string,
        location: hit.location as string,
      })}
      renderItem={(proj) => (
        <div className="flex flex-col py-4">
          <span className="font-semibold">
            {proj.docId} – {proj.client}
          </span>
          <span className="text-sm text-muted-foreground">
            {proj.description}
          </span>
          <span className="text-xs text-muted-foreground">
            {proj.location}
          </span>
        </div>
      )}
      selected={props.selectedProject}
      onSelect={props.setSelectedProject}
    />
  );
}
