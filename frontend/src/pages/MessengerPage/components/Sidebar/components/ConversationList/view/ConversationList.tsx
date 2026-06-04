import type { ReactElement } from 'react';
import type { Conversation } from '@/pages/MessengerPage/domain/conversation/types/conversation';
import type { ConversationsStatus } from '@/pages/MessengerPage/domain/conversation/state/ConversationsContext';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import { ConversationItem } from '../components/ConversationItem/ConversationItem';
import styles from './ConversationList.module.css';

interface ConversationListProps {
  conversations: Conversation[];
  status: ConversationsStatus;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  status,
  selectedId,
  onSelect,
}: ConversationListProps): ReactElement {
  if (status === 'loading') {
    return (
      <div className={styles.center}>
        <Spinner />
      </div>
    );
  }
  if (status === 'error') {
    return <div className={styles.center}>Could not load conversations.</div>;
  }
  if (conversations.length === 0) {
    return <div className={styles.center}>No conversations found.</div>;
  }
  return (
    <ul className={styles.list}>
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <ConversationItem
            conversation={conversation}
            selected={conversation.id === selectedId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}
