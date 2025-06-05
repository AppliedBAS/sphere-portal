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
      buttonLabel={(p) => (p ? `${p.clientName}` : "Select Client...")}
      hitsPerPage={8}
      mapHit={(hit: Hit) => ({
        objectID: hit.objectID,
        clientName: hit["client-name"] as string,
        active: hit.active as boolean,
        buildings: Array.isArray(hit.buildings)
          ? hit.buildings.map((bld: Record<string, unknown>) => ({
              cityStateZip: String(bld["city-state-zip"]),
              contactEmail: String(bld["contact-email"]),
              contactPhone: String(bld["contact-phone"]),
              contactName: String(bld["contact-name"]),
              serviceAddress1: String(bld["service-address1"]),
              serviceAddress2: String(bld["service-address2"]),
            }))
          : [],
      })}
      renderItem={(client) => (
        <div className="flex flex-col py-2">
          <span className="font-semibold">{client.clientName}</span>
        </div>
      )}
      selected={props.selectedClient}
      onSelect={props.setSelectedClient}
    />
  );
}
