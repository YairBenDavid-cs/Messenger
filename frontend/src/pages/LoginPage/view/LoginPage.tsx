import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/useAuth';
import { Header } from '../components/Header/Header';
import { LoginForm } from '../components/LoginForm/view/LoginForm';
import styles from './LoginPage.module.css';

export function LoginPage(): ReactElement {
  const { session } = useAuth();
  if (session !== null) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Header />
        <LoginForm />
      </div>
    </div>
  );
}
