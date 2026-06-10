import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/shared/api/ApiError';
import type { User } from '@/shared/types/user';
import { useConversations } from '@/pages/MessengerPage/domain/conversation/hooks/useConversations';
import { listUsers } from '@/pages/MessengerPage/domain/user/api/users';

interface UseNewConversation {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  users: User[];
  error: string | null;
  pick: (userId: string) => void;
}

export function useNewConversation(): UseNewConversation {
  const { conversations, select, startDraft } = useConversations();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listUsers().then(
      (all) => {
        if (!active) {
          return;
        }
        setUsers(all);
        setError(null);
      },
      (err: unknown) => {
        if (!active) {
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Failed to load users');
      },
    );
    return () => {
      active = false;
    };
  }, []);

  // Esc closes the dialog and must win over deselect-on-Escape: capture phase + stop
  // propagation so the document-level deselect listener never sees the key.
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation();
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  const openDialog = useCallback((): void => {
    setOpen(true);
  }, []);

  const closeDialog = useCallback((): void => {
    setOpen(false);
  }, []);

  const pick = useCallback(
    (userId: string): void => {
      const user = users.find((candidate) => candidate.id === userId);
      if (user === undefined) {
        return;
      }
      const existing = conversations.find((conversation) =>
        conversation.participants.includes(userId),
      );
      if (existing !== undefined) {
        select(existing.id);
      } else {
        startDraft(user);
      }
      setOpen(false);
    },
    [users, conversations, select, startDraft],
  );

  return { open, openDialog, closeDialog, users, error, pick };
}
