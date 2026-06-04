import type { FormEvent, ReactElement } from 'react';
import { useLoginForm } from '../hooks/useLoginForm';
import { UsernameField } from '../components/UsernameField/UsernameField';
import { PasswordField } from '../components/PasswordField/PasswordField';
import { SubmitButton } from '../components/SubmitButton/SubmitButton';
import styles from './LoginForm.module.css';

export function LoginForm(): ReactElement {
  const { values, setUsername, setPassword, submit, submitting, error, canSubmit } = useLoginForm();

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    submit();
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <UsernameField value={values.username} onChange={setUsername} disabled={submitting} />
      <PasswordField value={values.password} onChange={setPassword} disabled={submitting} />
      {error !== null && <p className={styles.error}>{error}</p>}
      <SubmitButton label={submitting ? 'Logging in…' : 'Log in'} disabled={!canSubmit} />
    </form>
  );
}
