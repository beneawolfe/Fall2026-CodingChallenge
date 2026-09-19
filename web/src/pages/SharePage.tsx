// Public, read-only view of a shared board at /share/:token.
// No login needed and it does not use the logged-in app layout.

import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Skeleton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import { fetchSharedBoard } from '../api/share';
import type { SharedBoard } from '../api/share';
import type { BoardImage } from '../types/image';

const COLUMNS = { xs: 2, sm: 3, md: 4 };

export default function SharePage() {
  const { token } = useParams();

  const [board, setBoard] = useState<SharedBoard | null>(null);
  const [images, setImages] = useState<BoardImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchSharedBoard(token)
      .then((data) => {
        if (cancelled) return;
        setBoard(data.board);
        setImages(data.images);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load this board');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 1 }}>
            <PushPinIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Change
              <Box component="span" sx={{ color: 'primary.main' }}>
                ++
              </Box>
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button component={RouterLink} to="/login">
              Sign in
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        {loading ? (
          <Box>
            <Skeleton variant="text" width={240} height={48} />
            <Box sx={{ columnCount: COLUMNS, columnGap: 2, mt: 2 }}>
              {[180, 260, 220, 300, 200, 240, 280, 210].map((h, i) => (
                <Skeleton key={i} variant="rounded" height={h} sx={{ mb: 2 }} />
              ))}
            </Box>
          </Box>
        ) : error || !board ? (
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Alert severity="error">
              {error ?? 'This link is invalid or has been turned off by the owner.'}
            </Alert>
            <Button component={RouterLink} to="/">
              Go to Change++
            </Button>
          </Stack>
        ) : (
          <Box>
            <Typography variant="h4" component="h1">
              {board.name}
            </Typography>
            {board.description && (
              <Typography color="text.secondary">{board.description}</Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Shared by {board.ownerUsername} (view only)
            </Typography>

            {images.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6">This board is empty</Typography>
              </Paper>
            ) : (
              <Box sx={{ columnCount: COLUMNS, columnGap: 2 }}>
                {images.map((image) => (
                  <Paper
                    key={image.id}
                    variant="outlined"
                    sx={{ mb: 2, breakInside: 'avoid', overflow: 'hidden' }}
                  >
                    <Box
                      component="img"
                      src={image.previewUrl}
                      alt={image.note || image.tags || 'Shared image'}
                      loading="lazy"
                      sx={{ display: 'block', width: '100%', height: 'auto' }}
                    />
                    {(image.note || image.tags) && (
                      <Box sx={{ p: 1 }}>
                        {image.note && <Typography variant="body2">{image.note}</Typography>}
                        {image.tags && (
                          <Typography variant="caption" color="text.secondary">
                            {image.tags}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </>
  );
}