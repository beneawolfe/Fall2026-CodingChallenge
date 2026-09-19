// Top-level route table.
// - GuestOnly routes (login/register) redirect away if you're already signed in.
// - RequireAuth routes redirect to /login if you're not.
// More routes (boards, search, share) are added in later steps.

import { Route, Routes } from 'react-router-dom';
import GuestOnly from './components/GuestOnly';
import RequireAuth from './components/RequireAuth';
import BoardsPage from './pages/BoardsPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route index element={<BoardsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}