// Dialog for creating a board, or editing one when a `board` is passed in.
// The parent renders this only while it should be visible, so the form fields
// start fresh from the `board` prop each time it opens.

import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { Board, BoardInput } from '../types/board';

const MAX_NAME = 100;
const MAX_DESCRIPTION = 500;

interface BoardFormDialogProps {
  board?: Board; // present when editing
  onClose: () => void;
  onSubmit: (input: BoardInput) => Promise<void>; // should throw on failure
}

export default function BoardFormDialog({ board, onClose, onSubmit }: BoardFormDialogProps) {
  const [name, setName] = useState(board?.name ?? '');
  const [description, setDescription] = useState(board?.description ?? '');
  const [isPublic, setIsPublic] = useState(board?.isPublic ?? false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const nameError = name.trim() ? null : 'Board name is required';
  const visibleNameError = touched ? nameError : null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    setServerError(null);
    if (nameError) return;

    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), isPublic });
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle>{board ? 'Edit board' : 'New board'}</DialogTitle>

        <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
          {serverError && <Alert severity="error">{serverError}</Alert>}

          <TextField
            label="Board name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            error={visibleNameError !== null}
            helperText={visibleNameError ?? ' '}
            slotProps={{ htmlInput: { maxLength: MAX_NAME } }}
            autoFocus
            disabled={submitting}
            fullWidth
            sx={{ mt: 1 }}
          />

          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            helperText={`${description.length}/${MAX_DESCRIPTION}`}
            slotProps={{ htmlInput: { maxLength: MAX_DESCRIPTION } }}
            multiline
            minRows={2}
            maxRows={5}
            disabled={submitting}
            fullWidth
          />

          <Box>
            <FormControlLabel
              control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} disabled={submitting} />}
              label={isPublic ? 'Public board' : 'Private board'}
            />
            <Typography variant="body2" color="text.secondary">
              {isPublic
                ? 'Any logged-in user can view this board.'
                : 'Only you and the people you add can see this board.'}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={22} color="inherit" /> : board ? 'Save changes' : 'Create board'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}