// Types for images saved on a board.

export interface BoardImage {
  id: number;
  imageUrl: string; // full-size image
  previewUrl: string; // smaller version used in grids
  tags: string; // comma-separated text
  note: string;
  addedBy: number | string | null;
  createdAt: string;
}

// Fields the edit dialog can change
export interface ImageEditInput {
  tags: string;
  note: string;
}

// Payload for saving a new image to a board (used by the Search page later)
export interface ImageCreateInput {
  imageUrl: string;
  previewUrl: string;
  tags?: string;
  note?: string;
}