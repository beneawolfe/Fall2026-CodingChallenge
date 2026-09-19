// "My Boards" home page: boards you own, boards shared with you, plus dialogs
// for creating, editing, deleting, and leaving boards.

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import BoardCard from '../components/BoardCard';
import BoardCardSkeleton from '../components/BoardCardSkeleton';
import BoardFormDialog from '../components/BoardFormDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { useBoards } from '../hooks/useBoards';
import { useToast } from '../hooks/useToast';
import type { Board, BoardInput } from '../types/board';

type FormState = { mode: 'create' } | { mode: 'edit'; board: Board } | null;
type ConfirmState = { kind: 'delete' | 'leave'; board: Board } | null;

// Responsive grid: as many 260px+ columns as fit, so phones get one column
function BoardGrid({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {children}
    </Box>
  );
}

export default function BoardsPage() {
  const { showToast } = useToast();
  const { boards, loading, error, retry, createBoard, updateBoard, removeBoard, leaveBoard } = useBoards();
  const [form, setForm] = useState<FormState>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const owned = boards.filter((board) => board.role === 'owner');
  const shared = boards.filter((board) => board.role !== 'owner');

  // Called by the dialog; throws on failure so the dialog can show the error
  async function handleFormSubmit(input: BoardInput) {
    if (form?.mode === 'edit') {
      await updateBoard(form.board.id, input);
      showToast('Board updated', 'success');
    } else {
      await createBoard(input);
      showToast('Board created', 'success');
    }
  }

  async function handleConfirm() {
    if (!confirm) return;
    const { kind, board } = confirm;
    setConfirm(null);

    try {
      if (kind === 'delete') {
        await removeBoard(board.id);
        showToast(`Deleted "${board.name}"`, 'success');
      } else {
        await leaveBoard(board.id);
        showToast(`Left "${board.name}"`, 'success');
      }
    } catch (err) {
      // The hook already rolled the card back into the list
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error');
    }
  }

  function renderCards(list: Board[]) {
    return list.map((board) => (
      <BoardCard
        key={board.id}
        board={board}
        onEdit={(b) => setForm({ mode: 'edit', board: b })}
        onDelete={(b) => setConfirm({ kind: 'delete', board: b })}
        onLeave={(b) => setConfirm({ kind: 'leave', board: b })}
      />
    ));
  }

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1">
          My Boards
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm({ mode: 'create' })}>
          New board
        </Button>
      </Box>

      {/* Body: loading, error, empty, or the grids */}
      {loading ? (
        <BoardGrid>
          {Array.from({ length: 6 }, (_, index) => (
            <BoardCardSkeleton key={index} />
          ))}
        </BoardGrid>
      ) : error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={retry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : boards.length === 0 ? (
        <EmptyState
          icon={<AddPhotoAlternateIcon />}
          title="No boards yet"
          message="Boards are where you collect the images you love. Create your first one to get started."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm({ mode: 'create' })}>
              Create a board
            </Button>
          }
        />
      ) : (
        <Box sx={{ display: 'grid', gap: 4 }}>
          {owned.length > 0 && (
            <Box>
              {shared.length > 0 && (
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Your boards
                </Typography>
              )}
              <BoardGrid>{renderCards(owned)}</BoardGrid>
            </Box>
          )}

          {shared.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Shared with me
              </Typography>
              <BoardGrid>{renderCards(shared)}</BoardGrid>
            </Box>
          )}
        </Box>
      )}

      {/* Dialogs */}
      {form && (
        <BoardFormDialog
          key={form.mode === 'edit' ? form.board.id : 'new'}
          board={form.mode === 'edit' ? form.board : undefined}
          onClose={() => setForm(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.kind === 'delete' ? 'Delete this board?' : 'Leave this board?'}
        message={
          confirm?.kind === 'delete'
            ? `"${confirm.board.name}" and all of its saved images will be permanently deleted for everyone.`
            : `You'll lose access to "${confirm?.board.name}" until the owner adds you again.`
        }
        confirmLabel={confirm?.kind === 'delete' ? 'Delete' : 'Leave'}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}