import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/useAuth';
import styles from './LogoutButton.module.css';

export function LogoutButton(): ReactElement {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function onClick(): void {
    logout();
    navigate('/auth', { replace: true });
  }

  return (
    <button type="button" className={styles.button} onClick={onClick}>
      Log out
    </button>
  );
}
