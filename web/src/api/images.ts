// Typed wrappers for the image endpoints inside a board.

import { request } from './client';
import type { BoardImage, ImageCreateInput, ImageEditInput } from '../types/image';

interface RawImage {
  id: number;
  imageUrl: string;
  previewUrl: string;
  tags?: string | null;
  note?: string | null;
  addedBy?: number | string | null;
  createdAt?: string;
}

// Fills in defaults so the rest of the app can rely on the strict BoardImage type.
export function normalizeImage(raw: RawImage): BoardImage {
  return {
    id: Number(raw.id),
    imageUrl: raw.imageUrl,
    previewUrl: raw.previewUrl || raw.imageUrl,
    tags: raw.tags ?? '',
    note: raw.note ?? '',
    addedBy: raw.addedBy ?? null,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export async function addImage(boardId: number, input: ImageCreateInput): Promise<BoardImage> {
  const data = await request<{ image: RawImage }>(`/api/collections/${boardId}/images`, {
    method: 'POST',
    body: input,
  });
  return normalizeImage(data.image);
}

export async function updateImage(
  boardId: number,
  imageId: number,
  input: ImageEditInput,
): Promise<BoardImage> {
  const data = await request<{ image: RawImage }>(
    `/api/collections/${boardId}/images/${imageId}`,
    { method: 'PATCH', body: input },
  );
  return normalizeImage(data.image);
}

export function deleteImage(boardId: number, imageId: number): Promise<void> {
  return request<void>(`/api/collections/${boardId}/images/${imageId}`, { method: 'DELETE' });
}