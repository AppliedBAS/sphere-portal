import { liteClient as algoliasearch, LiteClient } from 'algoliasearch/lite';

export const searchClient: LiteClient = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!, process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!);

