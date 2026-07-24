import { Route, Routes } from 'react-router-dom';
import AuthRedirect from '@/components/auth/AuthRedirect';
import GuestRoute from '@/components/auth/GuestRoute';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthLayout from '@templates/AuthLayout/AuthLayout';
import LoginPage from '@pages/Auth/LoginPage/LoginPage';
import SignUpPage from '@pages/Auth/SignUpPage/SignUpPage';
import MainLayout from '@templates/MainLayout';
import MeetingsPage from '@pages/MeetingsPage/MeetingsPage';
import ProfilePage from '@pages/ProfilePage/ProfilePage';
import TodosPage from '@pages/TodosPage/TodosPage';

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          path="/main"
          element={
            <MainLayout>
              <MeetingsPage />
            </MainLayout>
          }
        />
        <Route
          path="/meetings"
          element={
            <MainLayout>
              <MeetingsPage />
            </MainLayout>
          }
        />
        <Route
          path="/todos"
          element={
            <MainLayout>
              <TodosPage />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          }
        />
      </Route>

      <Route index element={<AuthRedirect />} />
      <Route path="*" element={<AuthRedirect />} />
    </Routes>
  );
}
