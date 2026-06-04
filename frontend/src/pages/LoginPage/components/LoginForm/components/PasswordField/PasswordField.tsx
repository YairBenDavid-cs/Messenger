import type { ReactElement } from 'react';
import type { LoginFieldProps } from '../../types/loginForm';
import styles from './PasswordField.module.css';

export function PasswordField({ value, onChange, disabled }: LoginFieldProps): ReactElement {
  return (
    <label className={styles.field}>
      <span className={styles.label}>Password</span>
      <input
        className={styles.input}
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        autoComplete="current-password"
        placeholder="Enter your password"
      />
    </label>
  );
}
