// TEMPORARY placeholder for the "My Boards" home page (built in Step 4).
// Shows who is logged in so the auth flow can be verified.

import { Button, Container, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function BoardsPage() {
  const { user, logout } = useAuth();

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        My Boards
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Signed in as {user?.username} ({user?.email})
      </Typography>
      <Button variant="outlined" onClick={logout}>
        Log out
      </Button>
    </Container>
  );
}