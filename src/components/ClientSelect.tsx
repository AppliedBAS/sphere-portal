import { AlgoliaSelect } from "@/components/AlgoliaSelect";
import { ClientHit } from "@/models/Client";
import { Hit } from "algoliasearch/lite";

interface ClientSelectProps {
  selectedClient: ClientHit | null;
  setSelectedClient: (p: ClientHit | null) => void;
}

export default function ProjectSelect(props: ClientSelectProps) {
  return (
    <AlgoliaSelect<ClientHit>
      indexName="clients"
      placeholder="Search Client..."
      buttonLabel={(p) =>
        p ? `${p.clientName}` : "Select Client..."
      }
      hitsPerPage={8}
      mapHit={(hit: Hit) => ({
        objectID: hit.objectID,
        clientName: hit["client-name"] as string,
        active: hit.active as boolean,
        buildings: hit.buildings as { cityStateZip: string; contactEmail: string; contactPhone: string; contactName: string; serviceAddress1: string; serviceAddress2: string }[],
        id: hit.id as string,
        updatedAt: hit["updated-at"] as string,
        createdAt: hit["created-at"] as string,
      })}
      renderItem={(client) => (
        <div className="flex flex-col py-2">
          <span className="font-semibold">
            {client.clientName}
          </span>
        </div>
      )}
      selected={props.selectedClient}
      onSelect={props.setSelectedClient}
    />
  );
}
