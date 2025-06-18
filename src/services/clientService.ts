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
    }));
  return mappedHits;
}