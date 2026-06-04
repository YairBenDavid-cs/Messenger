import type { RequestHandler } from 'express';
import type { ConversationService } from './conversations.service';
import { badRequest } from '../shared/AppError';

export function createConversationsController(conversationService: ConversationService): {
  list: RequestHandler;
  create: RequestHandler;
} {
  return {
    list: async (req, res, next) => {
      try {
        const conversations = await conversationService.listConversations(req.userId);
        res.status(200).json(conversations);
      } catch (err) {
        next(err);
      }
    },

    create: async (req, res, next) => {
      try {
        const { participantIds } = (req.body ?? {}) as { participantIds?: unknown };

        if (
          !Array.isArray(participantIds) ||
          participantIds.some((id) => typeof id !== 'string')
        ) {
          throw badRequest('participantIds must be an array of strings');
        }

        const conversation = await conversationService.createConversation(
          req.userId,
          participantIds as string[],
        );
        res.status(201).json(conversation);
      } catch (err) {
        next(err);
      }
    },
  };
}
