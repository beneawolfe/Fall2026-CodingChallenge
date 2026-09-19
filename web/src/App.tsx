// Top-level route table.
// - GuestOnly routes (login/register) redirect away if you're already signed in.
// - RequireAuth routes redirect to /login if you're not.
// - AppLayout wraps every logged-in page with the top bar.
// More routes (board detail, public share) are added in later steps.

import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import GuestOnly from './components/GuestOnly';
import RequireAuth from './components/RequireAuth';
import BoardsPage from './pages/BoardsPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<BoardsPage />} />
          <Route path="search" element={<SearchPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}