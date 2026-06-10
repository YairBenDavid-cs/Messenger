import { Router } from 'express';
import type { ConversationService } from './conversations.service';
import type { MessageService } from '../messages/messages.service';
import { createConversationsController } from './conversations.controller';
import { createMessagesController } from '../messages/messages.controller';

export function createConversationsRouter(
  conversationService: ConversationService,
  messageService: MessageService,
): Router {
  const router = Router();
  const conversationsController = createConversationsController(conversationService);
  const messagesController = createMessagesController(messageService);

  router.get('/', conversationsController.list);
  router.post('/', conversationsController.create);
  router.get('/:id/messages', messagesController.list);
  router.post('/:id/messages', messagesController.send);

  return router;
}
