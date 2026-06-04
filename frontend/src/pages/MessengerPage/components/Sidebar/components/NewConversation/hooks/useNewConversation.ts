import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/shared/api/ApiError';
import { useAuth } from '@/shared/auth/useAuth';
import type { User } from '@/shared/types/user';
import { useConversations } from '@/pages/MessengerPage/domain/conversation/hooks/useConversations';
import { createConversation } from '@/pages/MessengerPage/domain/conversation/api/conversations';
import { listUsers } from '@/pages/MessengerPage/domain/user/api/users';

interface UseNewConversation {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  users: User[];
  pick: (userId: string) => void;
  busy: boolean;
}

export function useNewConversation(): UseNewConversation {
  const { session } = useAuth();
  const currentUserId = session?.user.id ?? '';
  const { conversations, addConversation, select } = useConversations();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let active = true;
    listUsers().then((all) => {
      if (active) {
        setUsers(all.filter((user) => user.id !== currentUserId));
      }
    });
    return () => {
      active = false;
    };
  }, [currentUserId]);

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
      if (busy) {
        return;
      }
      setBusy(true);
      createConversation(userId).then(
        (conversation) => {
          addConversation(conversation);
          select(conversation.id);
          setBusy(false);
          setOpen(false);
        },
        (err: unknown) => {
          setBusy(false);
          if (err instanceof ApiError && err.status === 409) {
            const existing = conversations.find((conversation) =>
              conversation.participants.includes(userId),
            );
            if (existing !== undefined) {
              select(existing.id);
              setOpen(false);
            }
          }
        },
      );
    },
    [busy, conversations, addConversation, select],
  );

  return { open, openDialog, closeDialog, users, pick, busy };
}
