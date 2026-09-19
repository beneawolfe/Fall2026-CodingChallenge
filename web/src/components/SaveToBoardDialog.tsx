// Dialog for saving one search result to a board you can edit.
// It is only rendered while open, so its state resets for each image.

import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { fetchBoards } from '../api/collections';
import { addImage } from '../api/images';
import type { SearchResult } from '../api/search';
import type { Board } from '../types/board';

interface SaveToBoardDialogProps {
  image: SearchResult;
  onClose: () => void;
  onSaved: (boardName: string) => void;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong';
}

export default function SaveToBoardDialog({ image, onClose, onSaved }: SaveToBoardDialogProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardId, setBoardId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the boards this user is allowed to add images to (owner or editor)
  useEffect(() => {
    let cancelled = false;
    fetchBoards()
      .then((all) => {
        if (cancelled) return;
        const editable = all.filter((b) => b.role !== 'viewer');
        setBoards(editable);
        if (editable.length > 0) setBoardId(String(editable[0].id));
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    const board = boards.find((b) => String(b.id) === boardId);
    if (!board) return;
    setSaving(true);
    setError(null);
    try {
      const trimmed = note.trim();
      await addImage(board.id, {
        imageUrl: image.imageUrl,
        previewUrl: image.previewUrl,
        tags: image.tags,
        ...(trimmed ? { note: trimmed } : {}),
      });
      onSaved(board.name);
    } catch (err) {
      // e.g. "already saved" (409) from the server
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Save to board</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Box
            component="img"
            src={image.previewUrl}
            alt={image.tags || 'Selected image'}
            sx={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 1 }}
          />

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : boards.length === 0 ? (
            <Typography color="text.secondary">
              You don't have a board you can add images to yet.{' '}
              <Button component={RouterLink} to="/" size="small">
                Create one
              </Button>
            </Typography>
          ) : (
            <>
              <TextField
                select
                label="Board"
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                fullWidth
              >
                {boards.map((b) => (
                  <MenuItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading || boards.length === 0}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}