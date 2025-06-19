import { algoliasearch, Hit } from 'algoliasearch';
import type { ClientHit } from '@/models/Client';

const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

export async function searchClients(query: string): Promise<ClientHit[]> {
  if (!query) return [];
  const { hits } = await algoliaClient.searchSingleIndex({
    indexName: "clients",
    searchParams: {
        query: query,
        hitsPerPage: 10,
        attributesToRetrieve: ["objectID", "client-name"],
    }
  });
    // Map Algolia hits to ClientHit type

    const mappedHits: ClientHit[] = hits.map((hit: Hit) => ({
        objectID: hit.objectID,
        clientName: hit["client-name"] as string,
        buildings: Array.isArray(hit.buildings) ? hit.buildings.map((bld: {
            "city-state-zip": string;
            "contact-email": string;
            "contact-phone": string;
            "contact-name": string;
            "service-address1": string;
            "service-address2": string;
        }) => ({
            cityStateZip: bld["city-state-zip"],
            contactEmail: bld["contact-email"],
            contactPhone: bld["contact-phone"],
            contactName: bld["contact-name"],
            serviceAddress1: bld["service-address1"],
            serviceAddress2: bld["service-address2"]
        })) : [],
    }));
  return mappedHits;
}