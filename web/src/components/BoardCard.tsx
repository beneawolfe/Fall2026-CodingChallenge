// One board in the My Boards grid: cover image, name, image count, role chip,
// public/private badge, and an actions menu (edit/delete for owners,
// "leave" for collaborators). Clicking the card opens the board.

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import LockIcon from '@mui/icons-material/LockOutlined';
import PublicIcon from '@mui/icons-material/PublicOutlined';
import ImageIcon from '@mui/icons-material/ImageOutlined';
import type { Board, BoardRole } from '../types/board';

const ROLE_LABELS: Record<BoardRole, string> = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
};

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
  onLeave: (board: Board) => void;
}

export default function BoardCard({ board, onEdit, onDelete, onLeave }: BoardCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const isOwner = board.role === 'owner';

  function closeMenu() {
    setMenuAnchor(null);
  }

  return (
    <Card sx={{ position: 'relative', height: '100%', transition: 'box-shadow 0.2s, transform 0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }}>
      <CardActionArea component={RouterLink} to={`/boards/${board.id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {/* Cover image, or a gradient placeholder for empty boards */}
        {board.coverUrl ? (
          <Box
            component="img"
            src={board.coverUrl}
            alt=""
            loading="lazy"
            sx={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box
            sx={{
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              background: 'linear-gradient(135deg, #fde8ef 0%, #e7ecfd 100%)',
            }}
          >
            <ImageIcon sx={{ fontSize: 48, opacity: 0.6 }} />
          </Box>
        )}

        {/* Public/private badge over the cover */}
        <Chip
          size="small"
          icon={board.isPublic ? <PublicIcon /> : <LockIcon />}
          label={board.isPublic ? 'Public' : 'Private'}
          sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(255, 255, 255, 0.92)' }}
        />

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap>
            {board.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              minHeight: 40,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {board.description || 'No description'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
            <Chip size="small" color={isOwner ? 'primary' : 'default'} variant={isOwner ? 'filled' : 'outlined'} label={ROLE_LABELS[board.role]} />
            <Typography variant="body2" color="text.secondary">
              {board.imageCount} {board.imageCount === 1 ? 'image' : 'images'}
            </Typography>
          </Box>

          {!isOwner && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              by {board.ownerUsername}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>

      {/* Menu button sits above the clickable area (a button can't be nested inside another) */}
      <IconButton
        size="small"
        aria-label={`Actions for ${board.name}`}
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255, 255, 255, 0.92)', '&:hover': { bgcolor: '#fff' } }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        {isOwner
          ? [
              <MenuItem
                key="edit"
                onClick={() => {
                  closeMenu();
                  onEdit(board);
                }}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                Edit
              </MenuItem>,
              <MenuItem
                key="delete"
                onClick={() => {
                  closeMenu();
                  onDelete(board);
                }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                Delete
              </MenuItem>,
            ]
          : [
              <MenuItem
                key="leave"
                onClick={() => {
                  closeMenu();
                  onLeave(board);
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Leave board
              </MenuItem>,
            ]}
      </Menu>
    </Card>
  );
}