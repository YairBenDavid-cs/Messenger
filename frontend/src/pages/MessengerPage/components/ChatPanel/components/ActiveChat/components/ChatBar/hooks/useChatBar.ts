import { useCallback, useState } from 'react';

interface UseChatBar {
  text: string;
  setText: (value: string) => void;
  submit: () => void;
  canSend: boolean;
}

export function useChatBar(onSend: (text: string) => void): UseChatBar {
  const [text, setText] = useState('');
  const canSend = text.trim() !== '';

  const submit = useCallback((): void => {
    const trimmed = text.trim();
    if (trimmed === '') {
      return;
    }
    onSend(trimmed);
    setText('');
  }, [text, onSend]);

  return { text, setText, submit, canSend };
}
