import type { FormEvent, ReactElement } from 'react';
import { SendIcon } from '@/shared/ui/icons/SendIcon';
import { useChatBar } from '../hooks/useChatBar';
import styles from './ChatBar.module.css';

interface ChatBarProps {
  onSend: (text: string) => void;
}

export function ChatBar({ onSend }: ChatBarProps): ReactElement {
  const { text, setText, submit, canSend } = useChatBar(onSend);

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    submit();
  }

  return (
    <form className={styles.chatBar} onSubmit={onSubmit}>
      <input
        className={styles.input}
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type a message"
      />
      <button type="submit" className={styles.send} disabled={!canSend} aria-label="Send message">
        <SendIcon />
      </button>
    </form>
  );
}
