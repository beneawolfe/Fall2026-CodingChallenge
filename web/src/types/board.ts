// Types for boards (the backend calls them "collections").

export type BoardRole = 'owner' | 'editor' | 'viewer';

// One board as shown in the My Boards list
export interface Board {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  role: BoardRole; // the current user's role on this board
  createdAt: string;
  shareToken: string | null; // only present for boards you own
  ownerUsername: string;
  imageCount: number;
  coverUrl: string | null; // preview of the board's first image, if any
}

// Fields the create/edit dialog collects
export interface BoardInput {
  name: string;
  description: string;
  isPublic: boolean;
}