import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/shared/auth/useAuth';
import type { User } from '@/shared/types/user';
import { useConversations } from '@/pages/MessengerPage/domain/conversation/hooks/useConversations';
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
  const { conversations, select, startDraft } = useConversations();
  const [open, setOpen] = useState(false);
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

  // Picking a user who already has a conversation opens that real thread; otherwise
  // a blank draft is opened and the conversation is created lazily on the first sent
  // message (see useMessages), so it stays out of the sidebar until then.
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

  return { open, openDialog, closeDialog, users, pick, busy: false };
}
