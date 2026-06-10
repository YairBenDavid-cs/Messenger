import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/shared/auth/AuthProvider';
import { ProtectedRoute } from '@/shared/routing/ProtectedRoute';
import { AuthPage } from '@/pages/AuthPage/view/AuthPage';
import { MessengerPage } from '@/pages/MessengerPage/view/MessengerPage';

export function App(): ReactElement {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MessengerPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
