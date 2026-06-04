import type { ReactElement } from 'react';
import { useConversations } from '@/pages/MessengerPage/domain/conversation/hooks/useConversations';
import { useConversationSearch } from '../hooks/useConversationSearch';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { NewConversation } from '../components/NewConversation/view/NewConversation';
import { ConversationList } from '../components/ConversationList/view/ConversationList';
import { LogoutButton } from '../components/LogoutButton/LogoutButton';
import styles from './Sidebar.module.css';

export function Sidebar(): ReactElement {
  const { conversations, status, selectedId, select } = useConversations();
  const { query, setQuery, filtered } = useConversationSearch(conversations);

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.search}>
          <SearchBar value={query} onChange={setQuery} />
        </div>
        <NewConversation />
      </div>
      <ConversationList
        conversations={filtered}
        status={status}
        selectedId={selectedId}
        onSelect={select}
      />
      <LogoutButton />
    </div>
  );
}
