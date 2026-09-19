// Loads the user's boards and provides create / edit / delete / leave actions.
// Delete and leave are optimistic: the card disappears immediately and comes
// back (with the error re-thrown) if the server request fails.

import { useCallback, useEffect, useState } from 'react';
import {
  createBoard as createRequest,
  deleteBoard as deleteRequest,
  fetchBoards,
  leaveBoard as leaveRequest,
  updateBoard as updateRequest,
} from '../api/collections';
import { useAuth } from './useAuth';
import type { Board, BoardInput } from '../types/board';

export function useBoards() {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Load boards on mount (and again whenever retry() bumps reloadKey).
  // State is only set inside promise callbacks; `cancelled` ignores late responses.
  useEffect(() => {
    let cancelled = false;

    fetchBoards()
      .then((data) => {
        if (!cancelled) setBoards(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your boards');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  const createBoard = useCallback(
    async (input: BoardInput) => {
      const created = await createRequest(input, user?.username ?? '');
      setBoards((prev) => [created, ...prev]);
    },
    [user],
  );

  const updateBoard = useCallback(async (id: number, input: BoardInput) => {
    const changes = await updateRequest(id, input);
    setBoards((prev) => prev.map((board) => (board.id === id ? { ...board, ...changes } : board)));
  }, []);

  const removeBoard = useCallback(
    async (id: number) => {
      const snapshot = boards;
      setBoards((prev) => prev.filter((board) => board.id !== id)); // optimistic
      try {
        await deleteRequest(id);
      } catch (err) {
        setBoards(snapshot); // roll back
        throw err;
      }
    },
    [boards],
  );

  const leaveBoard = useCallback(
    async (id: number) => {
      if (!user) throw new Error('You must be logged in');
      const snapshot = boards;
      setBoards((prev) => prev.filter((board) => board.id !== id)); // optimistic
      try {
        await leaveRequest(id, user.id);
      } catch (err) {
        setBoards(snapshot); // roll back
        throw err;
      }
    },
    [boards, user],
  );

  return { boards, loading, error, retry, createBoard, updateBoard, removeBoard, leaveBoard };
}