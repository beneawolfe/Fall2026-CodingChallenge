// Search page: queries Pixabay through our backend, shows a masonry grid of
// results with a "Load more" button, and lets the user save an image to a board.

import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Link,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import SearchIcon from '@mui/icons-material/Search';
import SaveToBoardDialog from '../components/SaveToBoardDialog';
import { searchImages } from '../api/search';
import type { SearchResult } from '../api/search';
import { useToast } from '../hooks/useToast';

const COLUMNS = { xs: 2, sm: 3, md: 4 };

export default function SearchPage() {
  const { showToast } = useToast();

  const [input, setInput] = useState('');
  const [term, setTerm] = useState(''); // the query the current results belong to
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);

  // Ignores responses from older searches if the user searches again quickly
  const latestRequest = useRef(0);

  async function load(query: string, nextPage: number) {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError(null);
    try {
      const data = await searchImages(query, nextPage);
      if (requestId !== latestRequest.current) return;
      setResults((current) => {
        if (nextPage === 1) return data.results;
        const seen = new Set(current.map((r) => r.id));
        return [...current, ...data.results.filter((r) => !seen.has(r.id))];
      });
      setTotal(data.total);
      setPage(nextPage);
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const query = input.trim();
    if (!query) return;
    setTerm(query);
    setSearched(true);
    setResults([]);
    setTotal(0);
    void load(query, 1);
  }

  const hasMore = results.length > 0 && results.length < total;
  const firstLoad = loading && results.length === 0;

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Search images
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search Pixabay (e.g. mountains, cats, minimalist desk)"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button type="submit" variant="contained" disabled={!input.trim() || loading}>
          Search
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => void load(term, page === 1 ? 1 : page + 1)}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!searched && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
          <Typography variant="h6">Find something you love</Typography>
          <Typography color="text.secondary">
            Search millions of free images, then save your favorites to a board.
          </Typography>
        </Paper>
      )}

      {firstLoad && (
        <Box sx={{ columnCount: COLUMNS, columnGap: 2 }}>
          {[180, 260, 220, 300, 200, 240, 280, 210].map((h, i) => (
            <Skeleton key={i} variant="rounded" height={h} sx={{ mb: 2 }} />
          ))}
        </Box>
      )}

      {searched && !loading && !error && results.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No results for "{term}"</Typography>
          <Typography color="text.secondary">Try a different or more general search.</Typography>
        </Paper>
      )}

      {results.length > 0 && (
        <>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {total.toLocaleString()} results for "{term}"
          </Typography>

          {/* CSS columns give the Pinterest-style masonry layout */}
          <Box sx={{ columnCount: COLUMNS, columnGap: 2 }}>
            {results.map((result) => (
              <Paper
                key={result.id}
                variant="outlined"
                sx={{ mb: 2, breakInside: 'avoid', overflow: 'hidden' }}
              >
                <Box
                  component="img"
                  src={result.previewUrl}
                  alt={result.tags || 'Search result'}
                  loading="lazy"
                  sx={{ display: 'block', width: '100%', height: 'auto' }}
                />
                <Box sx={{ p: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {result.tags}
                  </Typography>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}
                  >
                    {result.pageUrl ? (
                      <Link
                        href={result.pageUrl}
                        target="_blank"
                        rel="noreferrer"
                        variant="caption"
                        underline="hover"
                      >
                        {result.user || 'Pixabay'}
                      </Link>
                    ) : (
                      <span />
                    )}
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PushPinIcon />}
                      onClick={() => setSelected(result)}
                    >
                      Save
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            {loading ? (
              <CircularProgress size={28} />
            ) : hasMore ? (
              <Button variant="outlined" onClick={() => void load(term, page + 1)}>
                Load more
              </Button>
            ) : null}
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Images provided by Pixabay
          </Typography>
        </>
      )}

      {selected && (
        <SaveToBoardDialog
          image={selected}
          onClose={() => setSelected(null)}
          onSaved={(boardName) => {
            setSelected(null);
            showToast(`Saved to "${boardName}"`, 'success');
          }}
        />
      )}
    </Box>
  );
}