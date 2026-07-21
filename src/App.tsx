import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '@templates/AuthLayout/AuthLayout';
import LoginPage from '@pages/Auth/LoginPage/LoginPage';
import SignUpPage from '@pages/Auth/SignUpPage/SignUpPage';
import MainLayout from '@templates/MainLayout';
import MeetingsPage from '@pages/MeetingsPage/MeetingsPage';
import ProfilePage from '@pages/ProfilePage/ProfilePage';

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route index element={<Navigate to="/signup" replace />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

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
            <div className="route-placeholder">
              <h1>To-dos</h1>
              <p>This is a placeholder page for your to-do workspace.</p>
            </div>
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
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
}
