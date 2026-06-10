import express from 'express';
import cors from 'cors';
import { requestLogger } from './shared/middleware/requestLogger';
import { errorHandler } from './shared/middleware/errorHandler';
import { authService, conversationService, messageService, authenticate } from './container';
import { createAuthRouter } from './auth/auth.router';
import { createConversationsRouter } from './conversations/conversations.router';

export const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(requestLogger);

app.get('/ping', (_req, res) => {
  res.json({ ok: true });
});

app.use('/auth', createAuthRouter(authService));
app.use(
  '/conversations',
  authenticate,
  createConversationsRouter(conversationService, messageService),
);

app.use(errorHandler);
