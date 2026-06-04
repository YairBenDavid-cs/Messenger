import type { ReactElement } from 'react';
import styles from './EmptyState.module.css';

export function EmptyState(): ReactElement {
  return (
    <div className={styles.emptyState}>
      <svg className={styles.icon} viewBox="0 0 24 24" width="72" height="72" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
        />
      </svg>
      <p className={styles.title}>Select a conversation</p>
      <p className={styles.subtitle}>Choose a chat from the list to start messaging.</p>
    </div>
  );
}
