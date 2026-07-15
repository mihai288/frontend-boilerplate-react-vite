import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '@templates/AuthLayout/AuthLayout';
import LoginPage from '@pages/Auth/LoginPage/LoginPage';
import SignUpPage from '@pages/Auth/SignUpPage/SignUpPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route index element={<Navigate to="/signup" replace />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}
