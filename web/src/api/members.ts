// Typed wrappers for the collaborator endpoints of a board.

import { request } from './client';

export interface Member {
  id: number;
  username: string;
  role: 'editor' | 'viewer';
}

export interface MembersResponse {
  owner: { id: number; username: string };
  members: Member[];
}

export function fetchMembers(boardId: number): Promise<MembersResponse> {
  return request<MembersResponse>(`/api/collections/${boardId}/members`);
}

// `user` can be an email or a username
export async function addMember(
  boardId: number,
  user: string,
  role: Member['role'],
): Promise<Member> {
  const data = await request<{ member: Member }>(`/api/collections/${boardId}/members`, {
    method: 'POST',
    body: { user, role },
  });
  return data.member;
}

export function removeMember(boardId: number, userId: number): Promise<void> {
  return request<void>(`/api/collections/${boardId}/members/${userId}`, { method: 'DELETE' });
}