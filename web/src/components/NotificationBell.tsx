// Bell icon with an unread badge. Clicking it opens a dropdown listing recent
// notifications; clicking one marks it read and jumps to that board.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/NotificationsNoneRounded';
import { useNotifications } from '../hooks/useNotifications';
import type { AppNotification } from '../types';
import { timeAgo } from '../utils/time';

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  function handleItemClick(notification: AppNotification) {
    void markRead(notification.id);
    if (notification.collectionId !== null) {
      setAnchorEl(null);
      navigate(`/boards/${notification.collectionId}`);
    }
  }

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton aria-label="Notifications" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Badge badgeContent={unreadCount} max={99} color="primary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ '& .MuiPopover-paper': { width: 360, maxWidth: 'calc(100vw - 32px)' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          <Button size="small" onClick={() => void markAllRead()} disabled={unreadCount === 0}>
            Mark all read
          </Button>
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            {loading ? 'Loading...' : "You're all caught up."}
          </Typography>
        ) : (
          <List disablePadding sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.map((notification) => (
              <ListItemButton
                key={notification.id}
                onClick={() => handleItemClick(notification)}
                sx={{
                  alignItems: 'flex-start',
                  gap: 1.5,
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                }}
              >
                {/* Unread dot */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    mt: 1,
                    flexShrink: 0,
                    borderRadius: '50%',
                    bgcolor: notification.isRead ? 'transparent' : 'primary.main',
                  }}
                />
                <ListItemText
                  primary={notification.message}
                  secondary={`${notification.collectionName ?? 'Board'} · ${timeAgo(notification.createdAt)}`}
                  sx={{
                    m: 0,
                    '& .MuiListItemText-primary': {
                      fontSize: 14,
                      fontWeight: notification.isRead ? 400 : 600,
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}