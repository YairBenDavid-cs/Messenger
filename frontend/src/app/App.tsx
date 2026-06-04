import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/shared/auth/AuthProvider';
import { ProtectedRoute } from '@/shared/routing/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage/view/LoginPage';
import { MessengerPage } from '@/pages/MessengerPage/view/MessengerPage';

export function App(): ReactElement {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MessengerPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
