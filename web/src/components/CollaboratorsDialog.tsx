// Owner-only dialog for sharing a board with other accounts: lists current
// collaborators, adds new ones by username/email, and removes them.

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemoveOutlined';
import { addMember, fetchMembers, removeMember } from '../api/members';
import type { Member } from '../api/members';

interface CollaboratorsDialogProps {
  open: boolean;
  boardId: number;
  onClose: () => void;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong';
}

export default function CollaboratorsDialog({ open, boardId, onClose }: CollaboratorsDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState('');
  const [role, setRole] = useState<Member['role']>('editor');
  const [adding, setAdding] = useState(false);

  // Reload the list every time the dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMembers(boardId)
      .then((data) => {
        if (!cancelled) setMembers(data.members);
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
  }, [open, boardId]);

  async function handleAdd() {
    const trimmed = user.trim();
    if (!trimmed) return;
    setAdding(true);
    setError(null);
    try {
      const member = await addMember(boardId, trimmed, role);
      setMembers((current) => [...current.filter((m) => m.id !== member.id), member]);
      setUser('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(member: Member) {
    const previous = members;
    setMembers((current) => current.filter((m) => m.id !== member.id)); // optimistic
    try {
      await removeMember(boardId, member.id);
    } catch (err) {
      setMembers(previous);
      setError(errorMessage(err));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Collaborators</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={1}>
            <TextField
              label="Username or email"
              size="small"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              select
              size="small"
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as Member['role'])}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </TextField>
          </Stack>
          <Button variant="contained" onClick={handleAdd} disabled={adding || !user.trim()}>
            {adding ? 'Adding...' : 'Add collaborator'}
          </Button>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : members.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              Nobody else has access yet.
            </Typography>
          ) : (
            members.map((m) => (
              <Stack
                key={m.id}
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Box>
                  <Typography>{m.username}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {m.role}
                  </Typography>
                </Box>
                <IconButton aria-label={`Remove ${m.username}`} onClick={() => handleRemove(m)}>
                  <PersonRemoveIcon />
                </IconButton>
              </Stack>
            ))
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}