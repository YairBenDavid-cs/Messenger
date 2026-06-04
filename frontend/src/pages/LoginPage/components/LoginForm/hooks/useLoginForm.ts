import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/useAuth';
import { ApiError } from '@/shared/api/ApiError';
import { login as loginRequest } from '@/pages/LoginPage/api/login';
import type { LoginFormValues } from '../types/loginForm';

interface UseLoginForm {
  values: LoginFormValues;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  submit: () => void;
  submitting: boolean;
  error: string | null;
  canSubmit: boolean;
}

export function useLoginForm(): UseLoginForm {
  const auth = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginFormValues>({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUsername = useCallback((username: string): void => {
    setValues((prev) => ({ ...prev, username }));
  }, []);

  const setPassword = useCallback((password: string): void => {
    setValues((prev) => ({ ...prev, password }));
  }, []);

  const submit = useCallback((): void => {
    if (submitting) {
      return;
    }
    const username = values.username.trim();
    if (username === '' || values.password === '') {
      return;
    }
    setSubmitting(true);
    setError(null);
    loginRequest(username, values.password).then(
      (session) => {
        auth.login(session);
        navigate('/', { replace: true });
      },
      (err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
        setSubmitting(false);
      },
    );
  }, [submitting, values, auth, navigate]);

  const canSubmit = values.username.trim() !== '' && values.password !== '' && !submitting;

  return { values, setUsername, setPassword, submit, submitting, error, canSubmit };
}
