import type { ReactElement } from 'react';
import { IconButton } from '@/shared/ui/IconButton/IconButton';
import { NewChatIcon } from '@/shared/ui/icons/NewChatIcon';
import { useNewConversation } from '../hooks/useNewConversation';
import { UserPickerItem } from '../components/UserPickerItem/UserPickerItem';
import styles from './NewConversation.module.css';

export function NewConversation(): ReactElement {
  const { open, openDialog, closeDialog, users, error, pick } = useNewConversation();

  return (
    <>
      <IconButton label="New conversation" onClick={openDialog}>
        <NewChatIcon />
      </IconButton>
      {open && (
        <div className={styles.backdrop} role="presentation" onClick={closeDialog}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-label="New conversation"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className={styles.title}>New chat</h2>
            {error !== null ? (
              <p className={styles.message}>{error}</p>
            ) : users.length === 0 ? (
              <p className={styles.message}>No other users to chat with yet.</p>
            ) : (
              <ul className={styles.list}>
                {users.map((user) => (
                  <li key={user.id}>
                    <UserPickerItem user={user} onSelect={pick} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
