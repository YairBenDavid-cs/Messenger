import type { ReactElement } from 'react';
import type { LoginFieldProps } from '../../types/loginForm';
import styles from './UsernameField.module.css';

export function UsernameField({ value, onChange, disabled }: LoginFieldProps): ReactElement {
  return (
    <label className={styles.field}>
      <span className={styles.label}>Username</span>
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        autoComplete="username"
        placeholder="Enter your username"
      />
    </label>
  );
}
