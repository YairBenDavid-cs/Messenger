import type { ReactElement } from 'react';
import { useSelectedConversation } from '@/pages/MessengerPage/domain/conversation/hooks/useSelectedConversation';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import styles from './ConversationTitle.module.css';

export function ConversationTitle(): ReactElement | null {
  const conversation = useSelectedConversation();
  if (conversation === null) {
    return null;
  }

  return (
    <header className={styles.title}>
      <Avatar src={conversation.avatarUrl} alt={conversation.title} size={37} />
      <span className={styles.name}>{conversation.title}</span>
    </header>
  );
}
