import { Request, Response, NextFunction } from "express";
import { MessagingService } from "./messaging.service";

const messagingService = new MessagingService();

export class MessagingController {
  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await messagingService.getConversations(
        req.user!.organizationId,
        req.query as unknown as Record<string, string>
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await messagingService.getMessages(
        req.params.contactId as string,
        req.user!.organizationId,
        req.query as unknown as Record<string, string>
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await messagingService.sendMessage(
        req.params.contactId as string,
        req.user!.organizationId,
        req.body
      );
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await messagingService.getMessageStats(req.user!.organizationId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
