import type { ReactElement } from 'react';
import { useConversations } from '@/pages/MessengerPage/domain/conversation/hooks/useConversations';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { ActiveChat } from '../components/ActiveChat/view/ActiveChat';
import styles from './ChatPanel.module.css';

export function ChatPanel(): ReactElement {
  const { selectedId } = useConversations();

  return (
    <div className={styles.panel}>
      {selectedId === null ? ( <EmptyState /> ) : ( <ActiveChat key={selectedId} conversationId={selectedId} /> )}
    </div>
  );
}
