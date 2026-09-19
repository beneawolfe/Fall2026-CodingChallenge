// Shell for all logged-in pages: sticky top bar (brand, navigation, notifications,
// account menu) with the current page rendered below via <Outlet />.
// On phones the nav buttons collapse to icon-only.

import type { ReactNode } from 'react';
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom';
import { AppBar, Box, Button, Container, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import PushPinIcon from '@mui/icons-material/PushPin';
import SearchIcon from '@mui/icons-material/Search';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

interface NavItemProps {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

// One navigation link: a labeled button on wider screens, an icon on phones.
// React Router's NavLink automatically adds an "active" class to the current page.
function NavItem({ to, label, icon, end }: NavItemProps) {
  const activeStyles = { color: 'primary.main', bgcolor: 'action.selected' };

  return (
    <>
      <Button
        component={NavLink}
        to={to}
        end={end}
        startIcon={icon}
        sx={{
          display: { xs: 'none', sm: 'inline-flex' },
          color: 'text.secondary',
          '&.active': activeStyles,
        }}
      >
        {label}
      </Button>
      <Tooltip title={label}>
        <IconButton
          component={NavLink}
          to={to}
          end={end}
          aria-label={label}
          sx={{
            display: { xs: 'inline-flex', sm: 'none' },
            color: 'text.secondary',
            '&.active': { color: 'primary.main' },
          }}
        >
          {icon}
        </IconButton>
      </Tooltip>
    </>
  );
}

export default function AppLayout() {
  return (
    <>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 1 }}>
            {/* Brand */}
            <Box
              component={RouterLink}
              to="/"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 2, textDecoration: 'none', color: 'text.primary' }}
            >
              <PushPinIcon color="primary" />
              <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                Change
                <Box component="span" sx={{ color: 'primary.main' }}>
                  ++
                </Box>
              </Typography>
            </Box>

            <NavItem to="/" end label="My Boards" icon={<DashboardIcon />} />
            <NavItem to="/search" label="Search" icon={<SearchIcon />} />

            {/* Pushes the items below to the right edge */}
            <Box sx={{ flexGrow: 1 }} />

            <NotificationBell />
            <UserMenu />
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        <Outlet />
      </Container>
    </>
  );
}