import type { Request, Response } from 'express';
import { config } from '../config/index.js';
import { HttpError } from '../errors.js';

/**
 * Pixabay search proxy.
 * The API key stays on the server, and results are trimmed to the fields
 * the frontend needs. Pixabay's terms require responses to be cached for
 * 24 hours, so successful lookups are kept in a small in-memory cache.
 */

const PIXABAY_URL = 'https://pixabay.com/api/';
const PER_PAGE = 30;
const MAX_QUERY_LENGTH = 100; // Pixabay rejects longer search terms
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h, per Pixabay's API terms
const CACHE_MAX_ENTRIES = 300;
const REQUEST_TIMEOUT_MS = 8000;

interface PixabayHit {
  id: number;
  pageURL: string;
  tags: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  user: string;
}

interface PixabayResponse {
  total: number;
  totalHits: number; // results actually reachable (Pixabay caps this at 500)
  hits: PixabayHit[];
}

interface SearchResult {
  id: number;
  previewUrl: string;
  imageUrl: string;
  tags: string;
  user: string;
  pageUrl: string;
}

interface SearchPayload {
  query: string;
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  results: SearchResult[];
}

const cache = new Map<string, { expires: number; payload: SearchPayload }>();

function readCache(key: string): SearchPayload | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.payload;
}

function writeCache(key: string, payload: SearchPayload): void {
  // Simple size cap: drop the oldest entry (Map keeps insertion order)
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, payload });
}

// GET /api/search/images?q=yellow+flowers&page=1
export async function searchImages(req: Request, res: Response): Promise<void> {
  if (!config.pixabayApiKey) {
    throw new HttpError(503, 'Image search is not configured on the server');
  }

  // Validate the search term
  const rawQ = req.query.q;
  const q = typeof rawQ === 'string' ? rawQ.trim() : '';
  if (!q) throw new HttpError(400, 'Query parameter "q" is required');
  if (q.length > MAX_QUERY_LENGTH) {
    throw new HttpError(400, `Query must be ${MAX_QUERY_LENGTH} characters or fewer`);
  }

  // Validate the page number (defaults to 1)
  const rawPage = req.query.page;
  const page = rawPage === undefined ? 1 : Number(rawPage);
  if (!Number.isInteger(page) || page < 1) {
    throw new HttpError(400, 'Query parameter "page" must be a positive integer');
  }

  const cacheKey = `${q.toLowerCase()}|${page}`;
  const cached = readCache(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  const params = new URLSearchParams({
    key: config.pixabayApiKey,
    q,
    page: String(page),
    per_page: String(PER_PAGE),
    image_type: 'photo',
    safesearch: 'true',
  });

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(`${PIXABAY_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new HttpError(502, 'Could not reach the image search service');
  }

  if (upstream.status === 429) {
    throw new HttpError(429, 'Image search rate limit reached. Please try again in a minute.');
  }
  if (!upstream.ok) {
    // Pixabay returns plain-text errors; log details but don't leak them to clients
    const detail = await upstream.text().catch(() => '');
    console.error(`Pixabay error ${upstream.status}: ${detail}`);
    throw new HttpError(502, 'Image search service returned an error');
  }

  const data = (await upstream.json()) as PixabayResponse;

  const payload: SearchPayload = {
    query: q,
    page,
    perPage: PER_PAGE,
    total: data.totalHits,
    totalPages: Math.ceil(data.totalHits / PER_PAGE),
    results: data.hits.map((hit) => ({
      id: hit.id,
      previewUrl: hit.webformatURL,
      imageUrl: hit.largeImageURL,
      tags: hit.tags,
      user: hit.user,
      pageUrl: hit.pageURL,
    })),
  };

  writeCache(cacheKey, payload);
  res.json(payload);
}