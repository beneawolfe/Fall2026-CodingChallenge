// Typed wrapper for the public (no login) share endpoint.

import { request } from './client';
import { normalizeImage } from './images';
import type { BoardImage } from '../types/image';

export interface SharedBoard {
  id: number;
  name: string;
  description: string;
  ownerUsername: string;
}

export async function fetchSharedBoard(
  token: string,
): Promise<{ board: SharedBoard; images: BoardImage[] }> {
  const data = await request<{
    collection: {
      id: number;
      name: string;
      description?: string | null;
      ownerUsername?: string;
    };
    images: Parameters<typeof normalizeImage>[0][];
  }>(`/api/share/${encodeURIComponent(token)}`);

  return {
    board: {
      id: Number(data.collection.id),
      name: data.collection.name,
      description: data.collection.description ?? '',
      ownerUsername: data.collection.ownerUsername ?? '',
    },
    images: data.images.map(normalizeImage),
  };
}