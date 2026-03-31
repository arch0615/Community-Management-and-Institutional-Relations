import { Request, Response, NextFunction } from "express";
import { MessagingService } from "./messaging.service";

const messagingService = new MessagingService();

export class MessagingController {
  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const result = await messagingService.getConversations(
        orgId,
        req.query as unknown as Record<string, string>
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const result = await messagingService.getMessages(
        req.params.contactId as string,
        orgId,
        req.query as unknown as Record<string, string>
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const message = await messagingService.sendMessage(
        req.params.contactId as string,
        orgId,
        req.body
      );
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const stats = await messagingService.getMessageStats(orgId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
