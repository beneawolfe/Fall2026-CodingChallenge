// Board detail page: Pinterest-style image grid with edit/remove, a
// public/private switch, a copyable share link and a collaborators dialog
// (owner only).
// Removing an image and toggling public/private are optimistic: the UI
// updates immediately and rolls back if the server rejects the change.

import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import GroupAddIcon from '@mui/icons-material/GroupAddOutlined';
import CollaboratorsDialog from '../components/CollaboratorsDialog';
import { fetchBoard, updateBoard } from '../api/collections';
import { deleteImage, updateImage } from '../api/images';
import type { Board } from '../types/board';
import type { BoardImage } from '../types/image';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong';
}

export default function BoardPage() {
  const { boardId } = useParams();
  const id = Number(boardId);

  const [board, setBoard] = useState<Board | null>(null);
  const [images, setImages] = useState<BoardImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(
    null,
  );

  // Edit-image dialog state
  const [editing, setEditing] = useState<BoardImage | null>(null);
  const [tagsDraft, setTagsDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [saving, setSaving] = useState(false);

  // Collaborators dialog state
  const [collabOpen, setCollabOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchBoard(id)
      .then((data) => {
        if (cancelled) return;
        setBoard(data.board);
        setImages(data.images);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const canEdit = board !== null && board.role !== 'viewer';
  const isOwner = board?.role === 'owner';

  // Optimistic remove: hide the image now, put it back if the server fails.
  async function handleRemove(image: BoardImage) {
    const previous = images;
    setImages((current) => current.filter((i) => i.id !== image.id));
    try {
      await deleteImage(id, image.id);
    } catch (err) {
      setImages(previous);
      setToast({ message: `Couldn't remove image: ${errorMessage(err)}`, severity: 'error' });
    }
  }

  // Optimistic public/private toggle with rollback.
  async function handleTogglePublic(next: boolean) {
    if (!board) return;
    const previous = board;
    setBoard({ ...board, isPublic: next });
    try {
      await updateBoard(board.id, {
        name: board.name,
        description: board.description,
        isPublic: next,
      });
    } catch (err) {
      setBoard(previous);
      setToast({ message: `Couldn't update board: ${errorMessage(err)}`, severity: 'error' });
    }
  }

  function openEdit(image: BoardImage) {
    setEditing(image);
    setTagsDraft(image.tags);
    setNoteDraft(image.note);
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await updateImage(id, editing.id, { tags: tagsDraft, note: noteDraft });
      setImages((current) => current.map((i) => (i.id === updated.id ? updated : i)));
      setEditing(null);
    } catch (err) {
      setToast({ message: `Couldn't save changes: ${errorMessage(err)}`, severity: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyLink() {
    if (!board?.shareToken) return;
    const link = `${window.location.origin}/share/${board.shareToken}`;
    try {
      await navigator.clipboard.writeText(link);
      setToast({ message: 'Share link copied to clipboard', severity: 'success' });
    } catch {
      setToast({ message: `Copy failed. Link: ${link}`, severity: 'error' });
    }
  }

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={240} height={48} />
        <Box sx={{ columnCount: { xs: 2, sm: 3, md: 4 }, columnGap: 2, mt: 2 }}>
          {[180, 260, 220, 300, 200, 240, 280, 210].map((h, i) => (
            <Skeleton key={i} variant="rounded" height={h} sx={{ mb: 2 }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (loadError || !board) {
    return (
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Alert severity="error">{loadError ?? 'Board not found'}</Alert>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />}>
          Back to my boards
        </Button>
      </Stack>
    );
  }

  return (
    <Box>
      <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 1 }}>
        My boards
      </Button>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            {board.name}
          </Typography>
          {board.description && (
            <Typography color="text.secondary">{board.description}</Typography>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip size="small" label={board.role} />
            <Chip size="small" variant="outlined" label={`by ${board.ownerUsername}`} />
            <Chip
              size="small"
              color={board.isPublic ? 'success' : 'default'}
              label={board.isPublic ? 'Public' : 'Private'}
            />
          </Stack>
        </Box>

        {isOwner && (
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={board.isPublic}
                    onChange={(e) => handleTogglePublic(e.target.checked)}
                  />
                }
                label="Public board"
              />
              <Button
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyLink}
                disabled={!board.shareToken}
              >
                Copy share link
              </Button>
              <Button size="small" startIcon={<GroupAddIcon />} onClick={() => setCollabOpen(true)}>
                Collaborators
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>

      {images.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No images yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Search for images and save them to this board.
          </Typography>
          {canEdit && (
            <Button component={RouterLink} to="/search" variant="contained">
              Search images
            </Button>
          )}
        </Paper>
      ) : (
        // CSS columns give a Pinterest-style masonry layout with no extra library.
        <Box sx={{ columnCount: { xs: 2, sm: 3, md: 4 }, columnGap: 2 }}>
          {images.map((image) => (
            <Paper
              key={image.id}
              variant="outlined"
              sx={{ mb: 2, breakInside: 'avoid', overflow: 'hidden' }}
            >
              <Box
                component="img"
                src={image.previewUrl}
                alt={image.note || image.tags || 'Saved image'}
                loading="lazy"
                sx={{ display: 'block', width: '100%', height: 'auto' }}
              />
              {(image.note || image.tags || canEdit) && (
                <Box sx={{ p: 1 }}>
                  {image.note && <Typography variant="body2">{image.note}</Typography>}
                  {image.tags && (
                    <Typography variant="caption" color="text.secondary">
                      {image.tags}
                    </Typography>
                  )}
                  {canEdit && (
                    <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                      <IconButton
                        size="small"
                        aria-label="Edit image"
                        onClick={() => openEdit(image)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Remove image"
                        onClick={() => handleRemove(image)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}

      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="xs">
        <DialogTitle>Edit image</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Note"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              label="Tags (comma separated)"
              value={tagsDraft}
              onChange={(e) => setTagsDraft(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {isOwner && (
        <CollaboratorsDialog
          open={collabOpen}
          boardId={board.id}
          onClose={() => setCollabOpen(false)}
        />
      )}

      <Snackbar
        open={toast !== null}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}