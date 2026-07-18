import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '@templates/AuthLayout/AuthLayout';
import LoginPage from '@pages/Auth/LoginPage/LoginPage';
import SignUpPage from '@pages/Auth/SignUpPage/SignUpPage';
import MainLayout from '@templates/MainLayout';
import MeetingsPage from '@pages/MeetingsPage/MeetingsPage';

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
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
}
