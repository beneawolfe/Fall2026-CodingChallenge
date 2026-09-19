// Typed wrapper for the backend's Pixabay search proxy.

import { request } from './client';

export interface SearchResult {
  id: number;
  previewUrl: string; // small version for the grid
  imageUrl: string; // large version that gets saved to a board
  tags: string;
  user: string; // Pixabay contributor
  pageUrl: string; // link back to the image on Pixabay
}

export interface SearchPageData {
  results: SearchResult[];
  total: number;
}

// The server response is read loosely so small naming differences don't break the page.
interface RawResult {
  id: number | string;
  previewUrl?: string;
  imageUrl?: string;
  tags?: string | null;
  user?: string | null;
  pageUrl?: string | null;
  total?: number;
}

interface RawSearchResponse {
  images?: RawResult[];
  results?: RawResult[];
  hits?: RawResult[];
  total?: number;
  totalHits?: number;
}

export async function searchImages(query: string, page: number): Promise<SearchPageData> {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const data = await request<RawSearchResponse>(`/api/search/images?${params.toString()}`);

  const list = data.images ?? data.results ?? data.hits ?? [];
  const results: SearchResult[] = list.map((raw) => ({
    id: Number(raw.id),
    previewUrl: raw.previewUrl ?? raw.imageUrl ?? '',
    imageUrl: raw.imageUrl ?? raw.previewUrl ?? '',
    tags: raw.tags ?? '',
    user: raw.user ?? '',
    pageUrl: raw.pageUrl ?? '',
  }));

  return { results, total: data.total ?? data.totalHits ?? list[0]?.total ?? results.length };
}