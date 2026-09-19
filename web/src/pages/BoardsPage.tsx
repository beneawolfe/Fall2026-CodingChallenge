// TEMPORARY placeholder for the "My Boards" home page (built in Step 4).

import { Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function BoardsPage() {
  const { user } = useAuth();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        My Boards
      </Typography>
      <Typography color="text.secondary">
        Signed in as {user?.username}. Your boards will appear here.
      </Typography>
    </>
  );
}