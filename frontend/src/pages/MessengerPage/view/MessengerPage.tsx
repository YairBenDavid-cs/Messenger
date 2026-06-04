import type { ReactElement } from 'react';
import { ConversationsProvider } from '../domain/conversation/state/ConversationsProvider';
import { Sidebar } from '../components/Sidebar/view/Sidebar';
import { ChatPanel } from '../components/ChatPanel/view/ChatPanel';
import styles from './MessengerPage.module.css';

export function MessengerPage(): ReactElement {
  return (
    <ConversationsProvider>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <Sidebar />
        </aside>
        <main className={styles.chatPanel}>
          <ChatPanel />
        </main>
      </div>
    </ConversationsProvider>
  );
}
