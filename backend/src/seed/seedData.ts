import type { User } from '../users/repositories/IUserRepository';
import type { Conversation } from '../conversations/repositories/IConversationRepository';
import type { Message } from '../messages/repositories/IMessageRepository';

export const SEED_USERS: User[] = [
  {
    id: 'u-alice',
    username: 'Alice',
    avatarUrl: 'https://i.pravatar.cc/100?u=alice',
    password: 'password123',
  },
  {
    id: 'u-bob',
    username: 'Bob',
    avatarUrl: 'https://i.pravatar.cc/100?u=bob',
    password: 'password123',
  },
  {
    id: 'u-carol',
    username: 'Carol',
    avatarUrl: 'https://i.pravatar.cc/100?u=carol',
    password: 'password123',
  },

  {
    id: 'u-david',
    username: 'David',
    avatarUrl: 'https://i.pravatar.cc/100?u=david',
    password: 'password123',
  },
];

const MINUTE = 60_000;

// A long Alice/Bob thread (120 messages) so cursor pagination is demonstrable from seed.
function buildAliceBobThread(): Message[] {
  const messages: Message[] = [];
  const start = new Date('2026-05-28T08:00:00Z').getTime();
  for (let i = 0; i < 120; i += 1) {
    const senderId = i % 2 === 0 ? 'u-alice' : 'u-bob';
    messages.push({
      id: `m-ab-${i + 1}`,
      conversationId: 'c-alice-bob',
      senderId,
      text: `Message ${i + 1} in the Alice / Bob thread`,
      createdAt: new Date(start + i * MINUTE).toISOString(),
    });
  }
  return messages;
}

const aliceBobThread = buildAliceBobThread();
const aliceBobLast = aliceBobThread[aliceBobThread.length - 1];

const aliceCarolThread: Message[] = [
  {
    id: 'm-ac-1',
    conversationId: 'c-alice-carol',
    senderId: 'u-alice',
    text: 'Hey Carol, did you get the files?',
    createdAt: '2026-05-27T14:00:00Z',
  },
  {
    id: 'm-ac-2',
    conversationId: 'c-alice-carol',
    senderId: 'u-carol',
    text: 'Yes, looking now',
    createdAt: '2026-05-27T14:10:00Z',
  },
  {
    id: 'm-ac-3',
    conversationId: 'c-alice-carol',
    senderId: 'u-carol',
    text: 'Sounds good',
    createdAt: '2026-05-27T14:15:00Z',
  },
];

const bobCarolThread: Message[] = [
  {
    id: 'm-bc-1',
    conversationId: 'c-bob-carol',
    senderId: 'u-bob',
    text: 'Sending the report over',
    createdAt: '2026-05-25T08:55:00Z',
  },
  {
    id: 'm-bc-2',
    conversationId: 'c-bob-carol',
    senderId: 'u-carol',
    text: 'Got it, thanks',
    createdAt: '2026-05-25T09:00:00Z',
  },
];

export const SEED_MESSAGES_BY_CONVERSATION: Record<string, Message[]> = {
  'c-alice-bob': aliceBobThread,
  'c-alice-carol': aliceCarolThread,
  'c-bob-carol': bobCarolThread,
};

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'c-alice-bob',
    participantIds: ['u-alice', 'u-bob'],
    lastMessagePreview: aliceBobLast.text,
    lastMessageAt: aliceBobLast.createdAt,
    unreadCounts: { 'u-alice': 0, 'u-bob': 0 },
  },
  {
    id: 'c-alice-carol',
    participantIds: ['u-alice', 'u-carol'],
    lastMessagePreview: 'Sounds good',
    lastMessageAt: '2026-05-27T14:15:00Z',
    unreadCounts: { 'u-alice': 2, 'u-carol': 0 },
  },
  {
    id: 'c-bob-carol',
    participantIds: ['u-bob', 'u-carol'],
    lastMessagePreview: 'Got it, thanks',
    lastMessageAt: '2026-05-25T09:00:00Z',
    unreadCounts: { 'u-bob': 0, 'u-carol': 0 },
  },
];
