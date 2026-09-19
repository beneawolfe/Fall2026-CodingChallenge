// Typed wrappers for the board (collection) endpoints on the backend.

import { request } from './client';
import type { Board, BoardInput, BoardRole } from '../types/board';
import type { BoardImage } from '../types/image';
import { normalizeImage } from './images';

// What the server may send back. Fields are loosely typed here and then
// normalized below, so the rest of the app can rely on the strict Board type.
interface RawBoard {
  id: number;
  name: string;
  description?: string | null;
  isPublic?: boolean;
  role?: BoardRole;
  createdAt?: string;
  shareToken?: string | null;
  ownerUsername?: string;
  imageCount?: number | string | null; // Postgres COUNT() can arrive as a string
  coverUrl?: string | null;
}

function normalizeBoard(raw: RawBoard, ownerFallback = ''): Board {
  return {
    id: Number(raw.id),
    name: raw.name,
    description: raw.description ?? '',
    isPublic: Boolean(raw.isPublic),
    role: raw.role ?? 'owner', // a freshly created board is always owned by the creator
    createdAt: raw.createdAt ?? new Date().toISOString(),
    shareToken: raw.shareToken ?? null,
    ownerUsername: raw.ownerUsername ?? ownerFallback,
    imageCount: Number(raw.imageCount ?? 0),
    coverUrl: raw.coverUrl ?? null,
  };
}

export async function fetchBoards(): Promise<Board[]> {
  const data = await request<{ collections: RawBoard[] }>('/api/collections');
  return data.collections.map((raw) => normalizeBoard(raw));
}

export async function createBoard(input: BoardInput, ownerUsername: string): Promise<Board> {
  const data = await request<{ collection: RawBoard }>('/api/collections', {
    method: 'POST',
    body: input,
  });
  return normalizeBoard(data.collection, ownerUsername);
}

// Returns only the fields the edit dialog can change, so the caller can merge
// them into the board it already has (keeping image count, cover, etc.).
export async function updateBoard(id: number, input: BoardInput): Promise<BoardInput> {
  const data = await request<{ collection: RawBoard }>(`/api/collections/${id}`, {
    method: 'PATCH',
    body: input,
  });
  return {
    name: data.collection.name,
    description: data.collection.description ?? '',
    isPublic: Boolean(data.collection.isPublic),
  };
}

export function deleteBoard(id: number): Promise<void> {
  return request<void>(`/api/collections/${id}`, { method: 'DELETE' });
}

// A collaborator removing themselves from a board they don't own
export function leaveBoard(boardId: number, userId: number): Promise<void> {
  return request<void>(`/api/collections/${boardId}/members/${userId}`, { method: 'DELETE' });
}

// One board plus all of its images. If the server doesn't say what role the
// current user has, default to the safest one (viewer).
export async function fetchBoard(
  id: number,
): Promise<{ board: Board; images: BoardImage[] }> {
  const data = await request<{
    collection: RawBoard;
    images: Parameters<typeof normalizeImage>[0][];
  }>(`/api/collections/${id}`);
  return {
    board: normalizeBoard({ ...data.collection, role: data.collection.role ?? 'viewer' }),
    images: data.images.map(normalizeImage),
  };
}