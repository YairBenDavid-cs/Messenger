import {
  SEED_CONVERSATIONS,
  SEED_MESSAGES_BY_CONVERSATION,
  SEED_USERS,
} from './seed/seedData';
import { InMemoryUserRepository } from './users/repositories/InMemoryUserRepository';
import { InMemoryTokenRepository } from './auth/repositories/InMemoryTokenRepository';
import { InMemoryConversationRepository } from './conversations/repositories/InMemoryConversationRepository';
import { InMemoryMessageRepository } from './messages/repositories/InMemoryMessageRepository';
import { UserService } from './users/user.service';
import { AuthService } from './auth/auth.service';
import { ConversationService } from './conversations/conversations.service';
import { MessageService } from './messages/messages.service';
import { createAuthenticate } from './shared/middleware/authenticate';

// Repositories — the only place that knows the concrete (in-memory) implementations.
const userRepo = new InMemoryUserRepository(SEED_USERS);
const tokenRepo = new InMemoryTokenRepository();
const conversationRepo = new InMemoryConversationRepository(SEED_CONVERSATIONS);
const messageRepo = new InMemoryMessageRepository(SEED_MESSAGES_BY_CONVERSATION);

// Services — wired bottom-up, depending only on interfaces / other services.
const userService = new UserService(userRepo);
const authService = new AuthService(userService, tokenRepo);
const conversationService = new ConversationService(conversationRepo, userService);
const messageService = new MessageService(messageRepo, conversationService);

// Auth middleware — built from the shared token repository.
const authenticate = createAuthenticate(tokenRepo);

export { authService, conversationService, messageService, authenticate };
