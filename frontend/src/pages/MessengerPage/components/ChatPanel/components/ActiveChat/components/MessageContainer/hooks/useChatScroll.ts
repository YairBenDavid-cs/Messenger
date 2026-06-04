import { useLayoutEffect, useRef } from 'react';
import type { RefObject, UIEvent } from 'react';
import type { Message } from '@/pages/MessengerPage/domain/message/types/message';

interface UseChatScrollParams {
  messages: Message[];
  hasMore: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
}

interface UseChatScroll {
  ref: RefObject<HTMLDivElement>;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
}

const TOP_THRESHOLD = 80;

export function useChatScroll({
  messages,
  hasMore,
  loadingOlder,
  onLoadOlder,
}: UseChatScrollParams): UseChatScroll {
  const ref = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef(0);
  const prevFirstId = useRef<string | null>(null);
  const prevLastId = useRef<string | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) {
      return;
    }
    const firstId = messages[0]?.id ?? null;
    const lastId = messages[messages.length - 1]?.id ?? null;
    const prependedOlder = prevFirstId.current !== null && firstId !== prevFirstId.current;

    if (prependedOlder) {

      element.scrollTop = element.scrollHeight - prevScrollHeight.current;
    } else if (lastId !== prevLastId.current) {

      element.scrollTop = element.scrollHeight;
    }

    prevFirstId.current = firstId;
    prevLastId.current = lastId;
    prevScrollHeight.current = element.scrollHeight;

  
    if (hasMore && !loadingOlder && element.scrollHeight <= element.clientHeight) {
      onLoadOlder();
    }
  }, [messages, hasMore, loadingOlder, onLoadOlder]);

  const onScroll = (event: UIEvent<HTMLDivElement>): void => {
    if (event.currentTarget.scrollTop <= TOP_THRESHOLD && hasMore && !loadingOlder) {
      onLoadOlder();
    }
  };

  return { ref, onScroll };
}
